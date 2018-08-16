const router = require('koa-router')();
const searchCourses = require('@services/course-search');

router.post('/courses', async (ctx, next) => {
    const { body } = ctx.request;
    if (!body.timestamp || isNaN(body.timestamp)) {
        body.timestamp = 0;
    }
    const documents = await searchCourses(body);

    ctx.response.body = documents;

    return next();
});

module.exports = router.routes();
