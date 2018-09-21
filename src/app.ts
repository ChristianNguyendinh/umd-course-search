require('module-alias/register');
import Koa from 'koa';
import views from 'koa-views';
import routes from '@routes/setup-routes';

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
        if (err && (err.isJoi || err.status == 400)) {
            ctx.status = err.status || 400;
            ctx.body = (err.details && err.details[0] && err.details[0].message) || err.message || 'request validation error';
        } else {
            ctx.status = 500;
            console.log('Uncaught Error: ', err);
        }
    }
});

app.use(routes.routes());
app.use(routes.allowedMethods());

export default app;
