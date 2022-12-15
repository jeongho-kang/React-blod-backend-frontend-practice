require('dotenv').config()
const Koa = require('Koa')
const Router = require('koa-router')
const bodyparser = require('koa-bodyparser')
const mongoose = require('mongoose')

const {PORT,} = process.env

mongoose
.set('strictQuery',true)
    .connect("mongodb://127.0.0.1:27017/blog")
    .then(() => {
        console.log("connected to MongoDB")
})
    .catch(e => {
        console.error(e)
})

const api = require('./api')

const app = new Koa();
const router = new Router();

router.use('/api', api.routes()) // api router 적용

// 라우터 적용 전에 bodyparser 적용
app.use(bodyparser())

// app 인스턴스에 라우터 적용
app.use(router.routes()).use(router.allowedMethods())

const port = PORT || 4000
app.listen(port, () => {
    console.log(`Listening to port ${port}`);
})







//라우터 설정
/* router.get('/', ctx => {
    ctx.boty = '홈';
})
router.get('/about/:name?', ctx => {
    const {name} = ctx.params;
    // name의 존재 유뮤에 따라 다른 결과 출력
    ctx.body = name ? `${name}의 소개` : '소개'
})
router.get('/posts', ctx => {
    const {id} = ctx.query
    // id의 존재 유무에 따라 다른 결과 출력
    ctx.body = id ? `포스트 #${id}` : '포스트 아이디가 없습니다.'
}) */
