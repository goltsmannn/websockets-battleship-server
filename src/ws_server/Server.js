"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const dotenv_1 = __importDefault(require("dotenv"));
const messageHandler_1 = __importDefault(require("../utils/messageHandler"));
const App_1 = __importDefault(require("../utils/App"));
const PlayerServices_1 = __importDefault(require("../ModelServices/PlayerServices"));
const RoomServices_1 = __importDefault(require("../ModelServices/RoomServices"));
const GameService_1 = __importDefault(require("../ModelServices/GameService"));
dotenv_1.default.config();
const wss = new ws_1.WebSocketServer({ port: 3000 }, () => {
    console.log("Server listening on port 3000");
});
const playerService = new PlayerServices_1.default();
const roomService = new RoomServices_1.default(playerService);
const gameService = new GameService_1.default(playerService);
wss.on('connection', (socket, req) => {
    console.log('new client');
    socket.send("Connected to server");
    const app = new App_1.default(playerService, roomService, gameService, socket);
    socket.on('message', (msg) => {
        try {
            (0, messageHandler_1.default)(msg, app);
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
