import {WebSocketServer} from 'ws';
import dotenv from 'dotenv';
import messageHandler from "../utils/messageHandler";

dotenv.config();

const wss = new WebSocketServer({port: 3000}, () =>  {
    console.log("Server listening on port 3000");
});


wss.on('connection', (socket, req) => {
    console.log('ahere');

    socket.on('message', (msg) => {
        try {
            messageHandler(msg);
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