"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Player_interface_1 = require("../../models/Player.interface");
const RoomServices_1 = __importDefault(require("../ModelServices/RoomServices"));
class App {
    constructor(playerServices, roomService, ws) {
        this.ws = ws;
        this.playerServices = playerServices;
        this.roomService = roomService;
    }
    dispatchRequest(req) {
        //  req.data = JSON.parse(req.data);
        switch (req.type) {
            case "reg":
                this.registerPlayer(req);
                break;
            case "create_room":
                this.createRoom(req);
                break;
            case "create_game":
                this.createGame(req);
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
        this.ws.send(JSON.stringify(response));
    }
    createGame(req) {
    }
    createRoom(req) {
        const player = this.playerServices.findPlayerByWs(this.ws);
        if (!player) {
            throw new Error("Error while locating player by WS connection");
        }
        RoomServices_1.default.addRoom(player);
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
