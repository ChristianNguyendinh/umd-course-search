import { Context } from 'koa';
import KoaRouter from 'koa-router';
import searchRoutes from '@routes/search/search-routes';

const router = new KoaRouter();

// there use to be a need for this file, i promise ;3

router.use('/search', searchRoutes);

export default router;
