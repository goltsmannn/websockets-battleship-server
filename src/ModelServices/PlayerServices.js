"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Player_interface_1 = require("../../models/Player.interface");
const RoomServices_1 = __importDefault(require("./RoomServices"));
const PlayerErrors_1 = require("../Errors/PlayerErrors");
class PlayerServices {
    get Players() {
        return this._Players;
    }
    constructor() {
        this._Players = {};
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
    addPlayer(name, password, ws) {
        const existingPlayer = this.findPlayerByName(name);
        if (existingPlayer) {
            console.log("Player already exists");
            if (existingPlayer.password !== password) {
                throw new PlayerErrors_1.AuthorizationError();
            }
            if (existingPlayer.ws !== ws) {
                throw new PlayerErrors_1.MultiTabConnectionError();
            }
            return existingPlayer;
        }
        const index = (0, Player_interface_1.createId)(name, password);
        this._Players[index] = { name, password, index, wins: 0, ws: ws };
        const response = {
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
        RoomServices_1.default.updateRoom();
        this.updateWinners(this._Players[index]);
    }
    findPlayerByName(name) {
        return Object.values(this._Players).find(player => player.name === name);
    }
    findPlayerByWs(ws) {
        return Object.values(this._Players).find(player => player.ws === ws);
    }
    updateWinners(player) {
        let winners = [];
        for (const player of Object.values(this.Players)) {
            winners.push({ name: player.name, wins: player.wins });
        }
        const request = {
            type: "update_winners",
            data: JSON.stringify(winners),
            id: 0
        };
        this.notifyAllUsers(request);
    }
    notifyAllUsers(request) {
        for (const [key, player] of Object.entries(this._Players)) {
            player.ws.send(JSON.stringify(request));
        }
    }
}
PlayerServices.cnt = 0;
exports.default = PlayerServices;
