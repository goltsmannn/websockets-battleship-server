"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http = __importStar(require("node:http"));
const path = __importStar(require("node:path"));
const fs = __importStar(require("node:fs"));
const Server_1 = __importDefault(require("../ws_server/Server"));
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
        res.end(data);
    });
});
httpServer.on('upgrade', (req, socket, head) => {
    socket.on('error', (_) => {
        console.error("Error while establishing handshake");
    });
    if (req.headers.upgrade && req.headers.upgrade.toLowerCase() === 'websocket') {
        Server_1.default.handleUpgrade(req, socket, head, (ws) => {
            Server_1.default.emit('connection', ws, req);
        });
    }
    else {
        socket.destroy();
    }
});
exports.default = httpServer;
