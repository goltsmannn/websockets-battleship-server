import * as http from "node:http";
import * as path from "node:path";
import * as fs from "node:fs";
import wss from "../ws_server/Server";

const httpServer = http.createServer((req, res) => {
    const __dirname = path.resolve(path.dirname(""));
    const frontendPath = __dirname + (req.url === "/" ? "/front/index.html" : "/front" + req.url);
    fs.readFile(frontendPath, (err, data) => {
        if (err) {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end(JSON.stringify(err));
            return;
        }
        res.writeHead(200);
        res.end(data)
    });
});

httpServer.on('upgrade', (req, socket, head) => {

    socket.on('error', (_) => {
        console.error("Error while establishing handshake");
    })
    if (req.headers.upgrade && req.headers.upgrade.toLowerCase() === 'websocket') {
        wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit('connection', ws, req);
        });
    } else {
        socket.destroy();
    }
});

export default httpServer;