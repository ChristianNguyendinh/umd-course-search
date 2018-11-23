import application from './app';
import http from 'http';
import tagLogger from '@services/tag-logger';

const logger = tagLogger('server.ts');

const DEFAULT_PORT = 3001;

function startServer(port: number): void {
    logger.log('Starting server on port', port);

    http.createServer(application.callback()).listen(port);
}

startServer(parseInt(process.env.PORT, 10) || DEFAULT_PORT);
