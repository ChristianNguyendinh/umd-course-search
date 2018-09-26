import application from './app';
import http from 'http';

const DEFAULT_PORT = 3000;

function startServer(port: number): void {
    console.log('Starting server on port', port);

    http.createServer(application.callback()).listen(port);
}

startServer(parseInt(process.env.PORT) || DEFAULT_PORT);
