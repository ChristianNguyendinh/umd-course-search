const router = require('koa-router')();
const searchRoutes = require('@routes/search/search-routes');

router.use('/search', searchRoutes);

router.get('/', async (ctx) => {
    await ctx.render('search');
});

module.exports = router;
