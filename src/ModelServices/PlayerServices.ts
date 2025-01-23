import Player, {createId} from "../../models/Player.interface";
import WebSocket, {name} from "ws";
import Request from "../../models/Request.interface";
import RoomServices from "./RoomServices";
import {AuthorizationError, MultiTabConnectionError} from "../Errors/PlayerErrors";
import * as console from "node:console";
import * as console from "node:console";


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

    addPlayer(name: string, password: string, ws: WebSocket): Player {
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
        this.updateWinners(this._Players[index]);
        RoomServices.updateRoom();
        return this._Players[index];
    }

    findPlayerByName(name: string): Player | undefined {
        return Object.values(this._Players).find(player => player.name === name);
    }

    findPlayerByWs(ws: WebSocket): Player | undefined {
        return Object.values(this._Players).find(player => player.ws === ws);
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
        for(const [key, player] of Object.entries(this._Players)) {
            player.ws.send(JSON.stringify(request));
        }
    }
}