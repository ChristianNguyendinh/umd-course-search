const joiRouter = require('koa-joi-router');
const Joi = joiRouter.Joi;
const routes = joiRouter();
const searchCourses = require('@services/course-search');
const searchBuildings = require('@services/building-search');

const courseSearchBodySchema = {
    building: Joi.string().optional(),
    hour: Joi.number().min(0).max(23).optional(),
    minute: Joi.number().min(0).max(59).optional(),
    days: Joi.array().items(Joi.string().valid('M', 'Tu', 'W', 'Th', 'F')).optional(),
    room: Joi.string().optional(),
    timestamp: Joi.number().optional(),
    page: Joi.number().optional()
};

routes.route({
    method: 'post',
    path: '/courses',
    validate: {
        body: courseSearchBodySchema,
        type: 'json'
    },
    handler: async (ctx, next) => {
        const { body } = ctx.request; 
        body.timestamp = parseInt(body.timestamp) || 0;

        try {
            ctx.response.body = await searchCourses(body);
        } catch (err) {
            ctx.response.status = 500;
            console.log('Error querying the courses database: ', err);
        }

        return next();
    }
});

routes.route({
    method: 'get',
    path: '/buildings',
    handler: async (ctx, next) => {
        ctx.response.body = await searchBuildings();

        return next();
    }
});

module.exports = routes.middleware();
