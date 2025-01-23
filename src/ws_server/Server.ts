import {WebSocketServer} from 'ws';
import dotenv from 'dotenv';
import messageHandler from "../utils/messageHandler";
import App from "../utils/App";
import WebSocket from "ws";
import PlayerServices from "../ModelServices/PlayerServices";
dotenv.config();

const wss = new WebSocketServer({port: 3000}, () =>  {
    console.log("Server listening on port 3000");
});
const playerService = new PlayerServices();

wss.on('connection', (socket: WebSocket , req) => {
    console.log('new client')
    socket.send("Connected to server");
    const app = new App(playerService, socket);

    socket.on('message', (msg) => {

        try {
            messageHandler(msg, app);
        }
        catch(err) {
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
})

export default wss;