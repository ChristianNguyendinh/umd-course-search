import { Context } from "koa";
import joiRouter from 'koa-joi-router';

// don't es6 import cause we can't stub with proxyquire :( - need to research more
const searchCourses = require('@services/course-search');
const searchBuildings = require('@services/building-search');

const Joi = joiRouter.Joi;
const routes = joiRouter();

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
    handler: async (ctx: Context) => {
        const body: any = ctx.request.body; 
        body.timestamp = parseInt(body.timestamp) || 0;

        try {
            ctx.response.body = await searchCourses(body);
        } catch (err) {
            ctx.response.status = 500;
            console.log('Error querying the courses database: ', err);
        }
    }
});

routes.route({
    method: 'get',
    path: '/buildings',
    handler: async (ctx: Context) => {
        console.log(searchBuildings);
        ctx.response.body = await searchBuildings();
    }
});

export default routes.middleware();
