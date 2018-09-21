import application from './app';

const DEFAULT_PORT = 3000;

function startServer(port: number): void {
    console.log('Starting server on port', port);

    application.listen(port);
}

startServer(parseInt(process.env.PORT) || DEFAULT_PORT);
