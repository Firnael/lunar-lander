import * as http from './services/http';
import io from './services/socket';

function run() {
    http.start();
    io.start(http.server);
}

run();

// Perform any cleanup actions here
function cleanup(exitCode: number) {
    console.log('Cleaning up...');
    // Close the websocket connection and HTTP server
    io.stop();
    http.stop();
    // Exit the process
    process.exit(exitCode);
}

process
    .on('SIGINT', () => cleanup(0))
    .on('SIGTERM', () => cleanup(0))
    .on('SIGHUP', () => cleanup(0))
    .on('unhandledRejection', (reason, p) => {
        console.error(reason, 'Unhandled Rejection at Promise', p);
        cleanup(-1);
    })
    .on('uncaughtException', err => {
        console.error(err, 'Uncaught Exception thrown');
        cleanup(-1);
    });
