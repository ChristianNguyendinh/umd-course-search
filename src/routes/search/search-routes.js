const router = require('koa-router')();
const searchCourses = require('@services/course-search');

router.post('/courses', async (ctx, next) => {
    const documents = await searchCourses(ctx.request.body);

    ctx.response.body = documents;

    return next();
});

module.exports = router.routes();
