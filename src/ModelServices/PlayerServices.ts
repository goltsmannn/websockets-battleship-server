import Player, {createId} from "../../models/Player.interface";
import WebSocket from "ws";

export default class PlayerServices {

    private Players: { [key: string]: Player } = {};
    private static cnt = 0;

    constructor() {
        if (PlayerServices.cnt > 0) {
            console.log("Singleton class, cannot create instance");
            throw new Error("Singleton class, cannot create instance");
        }
        PlayerServices.cnt++;
    }
    // private readonly ws: WebSocket;
    //
    // constructor(ws: WebSocket) {
    //     this.ws = ws;
    // }

    addPlayer(name: string, password: string, ws: WebSocket): Player {
        const index = createId(name, password);
        this.Players[index] = <Player>{name, password, index, wins: 0, ws: ws};
        return this.Players[index];
    }
}