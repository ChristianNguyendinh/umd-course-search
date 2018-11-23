import 'module-alias/register';
import routes from '@routes/setup-routes';
import Koa from 'koa';
import views from 'koa-views';
import tagLogger from '@services/tag-logger';

const logger = tagLogger('app.ts');
const app = new Koa();

app.use(views(`${__dirname}/views`, {
    map: {
        html: 'lodash'
    }
}));

app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        if (err && (err.isJoi || err.status === 400)) {
            ctx.status = err.status || 400;
            ctx.body = (err.details && err.details[0] && err.details[0].message)
                || err.message
                || 'request validation error';
        } else {
            ctx.status = 500;
            logger.error('Uncaught Error: ', err);
        }
    }
});

// Allow Cross Origin Resource Sharing
app.use(async (ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    ctx.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    await next();
});

app.use(routes.routes());
app.use(routes.allowedMethods());

export default app;
