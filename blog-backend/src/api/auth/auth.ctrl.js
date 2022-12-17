import Joi from 'joi'
import User from '../../models/user.js'

/*
POST /api/auth/register
{
    username: 'velopert'
    password: 'mypass123'
}
*/ 
export const register = async ctx => {
    // Request Body 검증하기
    const schema = Joi.object().keys({
        username : Joi.string()
        .alphanum()
        .min(3)
        .max(20)
        .required(),
        password: Joi.string().required(),
    })
    const result = Joi.validate(ctx.request.body, schema)
    if(result.error) {
        ctx.status = 400
        ctx.body= result.error
        return
    }
    const {username, password} = ctx.request.body
    try {
        // username이 존재하는지 확인
        // findByUsername 스태틱 메서드를 사용하여 처리한다.
        const exists = await User.findByUsername(username)
        if(exists) {
            ctx.status = 409 // conflict
            return
        }
        const user = new User ({
            username,})
        // setPassword 인스턴스 함수 사용
        await user.setPassword(password) // 비밀번호 설정
        await user.save() // 데이터베이스에 저장
        // 응답할 데이터베이스에서 hashpassword 제거
        ctx.body=user.serialize();
    } catch(e) {
        ctx.throw(500,e)
    }
}
export const login = async ctx => {
    // 로그인
}
export const check = async ctx => {
    // 로그인 상태 확인
}
export const logout = async ctx => {
    // 로그아웃
}