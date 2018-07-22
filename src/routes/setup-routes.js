const router = require('koa-router')();
const searchRoutes = require('@routes/search/search-routes');

router.use('/search', searchRoutes);

module.exports = router;
