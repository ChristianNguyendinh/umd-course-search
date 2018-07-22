const router = require('koa-router')();

router.get('/', async (ctx, next) => {
    ctx.response.body = 'test';
});

module.exports = router.routes();
