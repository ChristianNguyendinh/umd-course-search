require('module-alias/register');
const Koa = require('koa');
// const bodyParser = require('koa-bodyparser');
const routes = require('@routes/setup-routes');
const views = require('koa-views');

const app = new Koa();

// app.use(bodyParser());
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

module.exports = app;
