"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Player_interface_1 = require("../../models/Player.interface");
class PlayerServices {
    constructor() {
        this.Players = {};
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
        const index = (0, Player_interface_1.createId)(name, password);
        this.Players[index] = { name, password, index, wins: 0, ws: ws };
        return this.Players[index];
    }
}
PlayerServices.cnt = 0;
exports.default = PlayerServices;
