import Router from 'koa-router'
import * as postsctrl from './posts.ctrl.js'

const posts = new Router();

posts.get('/', postsctrl.list);
posts.post('/', postsctrl.write);

const post = new Router() // /api/posts/:id
posts.get('/',postsctrl.read)
posts.delete('/',postsctrl.remove)
posts.patch('/',postsctrl.update)

posts.use('/:id', postsctrl.checkObjectId, post.routes())

export default posts;