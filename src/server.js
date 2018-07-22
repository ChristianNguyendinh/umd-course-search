const app = require('./app');

const DEFAULT_PORT = 3000;

function startServer(port) {
    console.log('Starting server on port', port);

    app.listen(port);
}

startServer(process.env.PORT || DEFAULT_PORT);
