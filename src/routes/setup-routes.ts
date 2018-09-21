import { Context } from "koa";
import KoaRouter from 'koa-router';
import searchRoutes from '@routes/search/search-routes';

const router = new KoaRouter();

router.use('/search', searchRoutes);

router.get('/', async (ctx: Context) => {
    await ctx.render('search');
});

export default router;
