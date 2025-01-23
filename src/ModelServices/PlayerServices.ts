import Player, {createId} from "../../models/Player.interface";
import WebSocket from "ws";
import Request from "../../models/Request.interface";
import RoomServices from "./RoomServices";

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
        const existingPlayer = this.findPlayerByName(name);
        if(existingPlayer) {
            return existingPlayer;
        }

        const index = createId(name, password);
        this.Players[index] = <Player>{name, password, index, wins: 0, ws: ws};
        this.updateWinners(this.Players[index]);
        RoomServices.updateRoom();
        return this.Players[index];
    }

    findPlayerByName(name: string): Player | undefined {
        return Object.values(this.Players).find(player => player.name === name);
    }

    findPlayerByWs(ws: WebSocket): Player | undefined {
        return Object.values(this.Players).find(player => player.ws === ws);
    }

    updateWinners(player: Player) {
        const request: Request = {
            type: "update_winners",
            data: {
                name: player.name,
                wins: player.wins
            },
            id : 0
        }

        this.notifyAllUsers(request)
    }



    notifyAllUsers(request: Request) {
        for(const [key, player] of Object.entries(this.Players)) {
            player.ws.send(JSON.stringify(request));
        }
    }
}