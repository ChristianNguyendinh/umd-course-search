import { Context } from 'koa';
import KoaRouter from 'koa-router';
import searchRoutes from '@routes/search/search-routes';

const router = new KoaRouter();

router.get('/', async (ctx: Context) => {
    await ctx.render('search');
});

router.use('/search', searchRoutes);

export default router;
