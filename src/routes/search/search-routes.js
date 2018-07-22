const router = require('koa-router')();
const searchCourses = require('@services/course-search');

router.post('/courses', async (ctx, next) => {
    const { body } = ctx.request;
    const documents = await searchCourses(body);
    console.log('post');
    ctx.response.body = documents;
    return next();
});

module.exports = router.routes();
