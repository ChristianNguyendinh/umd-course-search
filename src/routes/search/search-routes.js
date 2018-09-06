const router = require('koa-router')();
const searchCourses = require('@services/course-search');
const searchBuildings = require('@services/building-search');


router.post('/courses', async (ctx, next) => {
    const { body } = ctx.request; 
    body.timestamp = parseInt(body.timestamp) || 0;

    try {
        ctx.response.body = await searchCourses(body);
    } catch (err) {
        ctx.response.status = 500;
        console.log('Error querying the courses database: ', err);
    }

    return next();
});

router.get('/buildings', async (ctx, next) => {
    ctx.response.body = await searchBuildings();

    return next();
});

module.exports = router.routes();
