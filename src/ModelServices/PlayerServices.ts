import Player, {createId} from "../../models/Player.interface";
import WebSocket from "ws";
import Request from "../../models/Request.interface";
import RoomServices from "./RoomServices";
import {AuthorizationError, MultiTabConnectionError} from "../Errors/PlayerErrors";



export default class PlayerServices {
    get Players(): { [p: string]: Player } {
        return this._Players;
    }

    private _Players: { [key: string]: Player } = {};
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

    addPlayer(name: string, password: string, ws: WebSocket) {
        const existingPlayer = this.findPlayerByName(name);
        if(existingPlayer) {
            console.log("Player already exists");
            if (existingPlayer.password !== password) {
                throw new AuthorizationError();
            }
            if (existingPlayer.ws !== ws) {
                throw new MultiTabConnectionError();
            }

            return existingPlayer;
        }

        const index = createId(name, password);
        this._Players[index] = <Player>{name, password, index, wins: 0, ws: ws};

        const response: Request = {
            type: "reg",
            data: JSON.stringify({
                name: name,
                index: index,
                error: false,
                errorText: "",
            }),
            id: 0
        };
        ws.send(JSON.stringify(response));
        RoomServices.updateRoom();
        this.updateWinners(this._Players[index]);
    }

    findPlayerByName(name: string): Player | undefined {
        return Object.values(this._Players).find(player => player.name === name);
    }

    findPlayerByWs(ws: WebSocket): Player | undefined {
        return Object.values(this._Players).find(player => player.ws === ws);
    }

    updateWinners(player: Player) {
        let winners = [];
        for(const player of Object.values(this.Players)) {
            winners.push({name: player.name, wins: player.wins});
        }
        const request: Request = {
            type: "update_winners",
            data: JSON.stringify(winners),
            id : 0
        }

        this.notifyAllUsers(request)
    }



    notifyAllUsers(request: Request) {
        for(const [key, player] of Object.entries(this._Players)) {
            player.ws.send(JSON.stringify(request));
        }
    }
}