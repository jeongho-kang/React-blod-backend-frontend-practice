import Router from 'koa-router'
import * as authCtrl from './auth.ctrl.js'

const auths = new Router();

auths.post('/register', authCtrl.register)
auths.post('/login',authCtrl.login)
auths.get('/check',authCtrl.check)
auths.post('/logout',authCtrl.logout)

export default auths;