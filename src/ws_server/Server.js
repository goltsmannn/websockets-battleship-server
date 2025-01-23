"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const dotenv_1 = __importDefault(require("dotenv"));
const messageHandler_1 = __importDefault(require("../utils/messageHandler"));
dotenv_1.default.config();
const wss = new ws_1.WebSocketServer({ port: 3000 }, () => {
    console.log("Server listening on port 3000");
});
wss.on('connection', (socket, req) => {
    console.log('ahere');
    socket.on('message', (msg) => {
        try {
            (0, messageHandler_1.default)(msg);
        }
        catch (err) {
            console.error("Error while handling request on websocket server", err);
        }
    });
    socket.on('error', (msg) => {
        console.error("Error in current connection, closing it...");
        socket.close();
    });
});
wss.on('error', (err) => {
    console.error("Error in websocket server, closing it...");
    wss.close();
});
exports.default = wss;
