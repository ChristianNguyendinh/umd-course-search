require('module-alias/register');
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const routes = require('@routes/setup-routes');
const views = require('koa-views');

const app = new Koa();
app.use(bodyParser());
app.use(views(`${__dirname}/views`, {
    map: {
        html: 'lodash'
    }
}));

app.use(routes.routes());
app.use(routes.allowedMethods());

module.exports = app;
