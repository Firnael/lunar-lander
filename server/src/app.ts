import * as http from './services/http';
import io from './services/socket';

function run() {
    http.start();
    io.start(http.server);
}

run();

// Perform any cleanup actions here
function cleanup() {
    console.log('Cleaning up...');
    // Close the websocket connection and HTTP server
    io.stop();
    http.stop();
    // Exit the process
    process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('SIGHUP', cleanup);
