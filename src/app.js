require('module-alias/register');
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const routes = require('@routes/setup-routes');

const app = new Koa();
app.use(bodyParser());

app.use(routes.routes());
app.use(routes.allowedMethods());

module.exports = app;
