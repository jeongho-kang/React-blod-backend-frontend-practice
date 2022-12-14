const Router = require('koa-router')
const postsctrl = require('./posts.ctrl')

const posts = new Router();

posts.get('/', postsctrl.list);
posts.post('/', postsctrl.write);
posts.get('/:id',postsctrl.read)
posts.delete('/:id',postsctrl.remove)
posts.put('/:id',postsctrl.replace)
posts.patch('/:id',postsctrl.update)
module.exports = posts