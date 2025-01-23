"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Player_interface_1 = require("../../models/Player.interface");
class App {
    constructor(playerServices, ws) {
        this.ws = ws;
        this.playerServices = playerServices;
    }
    dispatchRequest(req) {
        //  req.data = JSON.parse(req.data);
        switch (req.type) {
            case "reg":
                this.registerPlayer(req);
                break;
            case "update_winners":
                this.updateWinners(req);
                break;
            case "create_room":
                this.createRoom(req);
                break;
            case "create_game":
                this.createGame(req);
                break;
            case "update_room":
                this.updateRoom(req);
                break;
            case "add_ships":
                this.addShips(req);
                break;
            case "start_game":
                this.startGame(req);
                break;
            case "attack":
                this.attack(req);
                break;
            case "randomAttack":
                this.randomAttack(req);
                break;
            case "turn":
                this.turn(req);
                break;
            case "finish":
                this.finish(req);
                break;
            default:
                throw new Error("Invalid reg type");
        }
    }
    registerPlayer(req) {
        if (!(0, Player_interface_1.isPlayerData)(req.data)) {
            const response = { type: "reg", id: req['id'], data: {
                    name: "",
                    index: "",
                    error: true,
                    errorText: "Invalid data"
                } };
            this.ws.send(JSON.stringify({ response }));
        }
        const player = this.playerServices.addPlayer(req.data.name, req.data.password, this.ws);
        const response = { type: "reg",
            data: JSON.stringify({
                name: player.name,
                index: player.index,
                error: false,
                errorText: "",
            }),
            id: req['id'] };
        console.log(this.ws);
        this.ws.send(JSON.stringify(response));
    }
    updateWinners(req) {
        return;
    }
    createGame(req) {
    }
    updateRoom(req) {
    }
    createRoom(req) {
    }
    finish(req) {
    }
    turn(req) {
    }
    randomAttack(req) {
    }
    startGame(req) {
    }
    addShips(req) {
    }
    attack(req) {
    }
}
exports.default = App;
