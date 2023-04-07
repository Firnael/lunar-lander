import express from 'express';
import bodyParser from 'body-parser';
import { createServer } from 'http';
import path from 'path';
import cors from 'cors';
import { NetworkInterfaceInfo, networkInterfaces } from 'os';

const port = 4000;
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '../../display', 'dist')));

// Route towards React router if path is not found on Express server
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, '../../display', 'dist', 'index.html'));
});

// Local IPs router
app.get('/ips', (req, res) => {
    const localIps = retrieveLocalIps();
    console.log(localIps);
    res.send(localIps);
});

const server = createServer(app);

const start = () => {
    try {
        server.listen(port, '0.0.0.0');
        console.log(`HTTP server ready on port ${port}`);
    } catch (e) {
        console.error('Could not start HTTP server', e);
    }
};

const retrieveLocalIps = (): Map<string, string[]> => {
    const nets = networkInterfaces();
    const results: any = {};

    for (const name of Object.keys(nets)) {
        const netInfo = nets[name] || new Array<NetworkInterfaceInfo>();
        for (const net of netInfo) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
            const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4;
            if (net.family === familyV4Value && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }
                results[name].push(net.address);
            }
        }
    }

    return results;
};

export { start, server };
