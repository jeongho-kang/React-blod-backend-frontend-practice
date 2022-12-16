import Post from '../../models/post.js'
import mongoose from 'mongoose'
import Joi from 'joi'

const { ObjectId } = mongoose.Types;

export const checkObjectId= (ctx,next) => {
    const { id } = ctx.params
    if(!ObjectId.isValid(id)) {
        ctx.status = 400 // bad request
        return
    }
    return next();
}

export const write = async ctx => { // 함수의 반환값은 Promise이므로 async=await 문법을 사용한다.
    const schema = Joi.object().keys({
        // 객체가 다음 필드를 가지고 있음을 검증
        title: Joi.string().required(), // required() 가 있으면 필수 항목
        body: Joi.string().required(),
        tags:Joi.array()
        .items(Joi.string())
        .required(), // 문자열로 이루어진 배열
    })

    // 검증하고 나서 검증실패 할 경우 에러 처리
    const result = Joi.ValidationError(ctx.request.body, schema)
    if(result.error) {
        ctx.statue = 400
        ctx.body = result.error
        return
    }

    const { title,body,tags} = ctx.request.body
    const post = new Post({
        title,
        body,
        tags,
    })
    try {
        await post.save(); // save 함수를 실행시켜야 데이터베이스에 저장된다
        ctx.body = post
    }   catch (e) {
        ctx.throw(500,e)
    }
}

export const list = async ctx => {
    // query는 문자열이기 때문에 숫자로 변환해주어야 한다.
    // 값이 주어지지 않았다면 1을 기본값으로 사용한다.
    const page = parseInt(ctx.query.page || '1', 10)
    if(page< 1) {
        ctx.statue = 400;
        return;
    }
    try {
        const posts = await Post.find()
        .sort({_id: -1 })
        .limit(10)
        .skip((page -1 ) * 10)
        .exec() // find함수 다음에는 exec를 붙여 주어야 서버에 쿼리를 요청한다
        const postCount = await Post.countDocuments().exec();
        ctx.set('Last-Page',Math.ceil(postCount/10))
        ctx.body = posts
        .map(post => post.toJSON())
        .map(post => ({
            ...post,
            body : 
            post.body.length < 200 ? post.body : `${post.body.slice(0,200)}...`,
        }))// body의 길이가 200자 이상이면 뒤에 ...을 붙이고 문자열을 자른다.
        // find()를 통해 조회한 데이터는 mongoose 문서 인스턴스의 형태이므로
        // 데이터를 바로 변형 x 그렇기 때문에 toJSON() 함수를 실행하여 JSON 형태로 변환한뒤 변형을 일으켜 줘야 한다.
    } catch (e) {
        ctx.throw(500,e)
    }
}
 // 특정 id를 가진 데이터를 조회할 떄는 findById() 함수를 사용한다.
export const read = async ctx => {
    const { id } = ctx.params
    try {
        const post = await Post.findById(id).exec()
        if(!post) {
            ctx.status = 404
            return
        }
        ctx.body = post
    }   catch(e) {
        ctx.throw(500,e)
    }
}
// 데이터 삭제는 여러종류의 함수를 사용할 수 있다.
// remove() : 특정 조건을 만족하는 데이터를 모두 지운다
// findByIdAndRemove(): id를 찾아서 지운다
// findOneAndRemove(): 특정 조건을 만족하는 데이터 하나를 찾아서 제거한다.
export const remove = async ctx => {
    const {id} = ctx.params
    try {
        await Post.findByIdAndRemove(id).exec() // id를 찾아서 지운다
        ctx.status = 204; // 성공하기는 했지만 응당하는 데이터가 없을때
    } catch(e) {
        ctx.throw(500,e)
    }
}
// update 함수는 findByIdAndUpdate() 함수를 사용한다
// 이 함수에는 세가지 파라미터를 넣어줘야한다 id, 내용 , 옵션 이다.
export const update = async ctx => {
    const {id} = ctx.params
    // write에서 사용한 schema와 비슷한데, required()가 없다.
    const schema = Joi.object().keys({
        title: Joi.string(),
        body: Joi.string(),
        tags : Joi.array().items(Joi.string())
    })
    // 검증하고 실패인 경우 에러처리
    const result = Joi.ValidationError(ctx.request.body, schema)
    if(result.error) {
        ctx.status = 400 
        ctx.body = result.error
        return
    }

    try {
        const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
            new: true, // 이 값을 설정하면 업데이트된 데이터를 반환합니다.
            // false일때는 업데이트가 되기 전의 데이터를 반환합니다.
        }).exec();
        if(!post) {
            ctx.status = 404;
            return;
        }
        ctx.body = post
    }   catch(e) {
        ctx.throw(500,e)
    }
}

/* 포스트 작성
    POST /api/posts
    {title,body}

export const write = ctx => {
    // REST API의 Request Body는 ctx.request.body에서 조회할 수 있다.
    const {title,body} = ctx.request.body
    postId += 1 // 기존 postId 값에 1을 더한다
    const post = {id: postId, title, body}
    posts.push(post)
    ctx.body = post
}
*/


/* 포스트 목록조회
    GET /api/posts

export const list = ctx => {
    ctx.body = posts
}
*/

/* 특정 포스트 조회 
    GET /api/posts/:id

export const read = ctx => {
    const {id} = ctx.params
    // 주어진 id 값으로 파라미터를 찾는다
    // 파라미터로 받아온 값은 문자열 형식이므로 파마리터를 숫자로 변환하거나
    // 비교할 p.id 값을 문자열로 변경해야한다.
    const post = posts.find(p => p.id.toString() === id)
    // post가 없으면 오류를 반환한다.
    if(!post) {
        ctx.status = 404;
        ctx.body = {
            message: '포스트가 존재하지 않습니다.'
        }
        return
    }
    ctx.body = post
}
*/

/* 특정 포스트 제거 
    DELETE api/posts/:id

export const remove = ctx => {
    const {id} = ctx.params
    // 해당 id를 가진 post가 몇번쨰인지 확인한다
    const index = posts.findIndex(p => p.id.toString() === id)
    // 포스타가 없으면 오류를 반환한다.
    if(index === -1) {
        ctx.status = 404;
        ctx.body = {
            message : '포스트가 존재하지 않습니다.'
        }
        return
    }
    // index번째 아이템을 제거한다.
    posts.splice(index,1)
    ctx.status = 204 // No Content
}
*/

/* post 수정 및 교체 
    PUT /api/posts/:id
    {title,body}

export const replace = ctx => {
    // PUT 메서드는 전체 정보를 입력하여 데이터를 통쨰로 교체할 때 사용
    const {id} = ctx.params
    // 해당 id를 가진 post가 몇번쨰인지 확인
    const index = posts.findIndex(p => p.id.toString()===id)
    // post가 없으면 오류를 반환
    if(index===-1) {
        ctx.status = 404;
        ctx.body = {
            message: '포스트가 존재하지 않습니다.'
        }
        return
    }
    // 전체 객체를 뒤집어 씌운다.
    // 따라서 id를 제외한 기존 정보를 날리고 객체를 새로 만든다.
    posts[index] = {
        id,
        ...ctx.request.body,
    }
    ctx.body = posts[index]
}
*/

/* 포스트 수정 ( 특정 필드 변경 )
    PATCH /api/post/:id
    {title, body}

export const update = ctx => {
    // PATCH에서는 주어진 필드만 교체한다.
    const {id} = ctx.params
    // 해당 id를 가진 post가 몇번쨰인지 확인한다.
    const index = posts.findIndex(p => p.id.toString === id)
    if(index===-1) {
        ctx.status = 404
        ctx.body = {
            message : ' 포스트가 존재하지 않습니다.'
        }
        return
    }
     // 기존 값에 정보를 덮어 씌운다.
    posts[index] = {
        ...posts[index],
        ...ctx.request.body,
    }
    ctx.body = posts[index]
}
*/







