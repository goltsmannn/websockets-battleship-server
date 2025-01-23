"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Player_interface_1 = require("../../models/Player.interface");
const RoomServices_1 = __importDefault(require("../ModelServices/RoomServices"));
const PlayerErrors_1 = require("../Errors/PlayerErrors");
class App {
    constructor(playerServices, roomService, ws) {
        this.ws = ws;
        this.playerServices = playerServices;
        this.roomService = roomService;
    }
    dispatchRequest(req) {
        //  req.data = JSON.parse(req.data);
        if (req.type === "reg") {
            this.registerPlayer(req);
        }
        else {
            const player = this.playerServices.findPlayerByWs(this.ws);
            if (!player) {
                throw new Error("Error while locating player by WS connection");
            }
            if (req.type === "create_room") {
                this.createRoom(req);
            }
            else if (req.type === "add_user_to_room") {
                this.addUserToRoom(req);
            }
            else if (req.type === "create_game") {
                this.createGame(req);
            }
            else if (req.type === "add_ships") {
                this.addShips(req);
            }
            else if (req.type === "start_game") {
                this.startGame(req);
            }
            else if (req.type === "attack") {
                this.attack(req);
            }
            else if (req.type === "randomAttack") {
                this.randomAttack(req);
            }
            else if (req.type === "turn") {
                this.turn(req);
            }
            else if (req.type === "finish") {
                this.finish(req);
            }
            else {
                throw new Error("Invalid request type");
            }
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
        try {
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
        catch (err) {
            if (err instanceof PlayerErrors_1.AuthorizationError) {
                console.log(err.message);
                this.ws.send("");
            }
            else if (err instanceof PlayerErrors_1.MultiTabConnectionError) {
                console.log(err.message);
                this.ws.send("");
            }
            else {
                this.ws.send("");
            }
        }
    }
    createRoom(req) {
        const player = this.playerServices.findPlayerByWs(this.ws);
        RoomServices_1.default.addRoom(player);
    }
    addUserToRoom(req) {
        const player = this.playerServices.findPlayerByWs(this.ws);
        const roomId = req.data.hasOwnProperty("indexRoom") ? req.data.indexRoom : undefined;
        if (!roomId) {
            console.log("Missing data in json req");
        }
        else {
            RoomServices_1.default.addUsersToRoom(player, roomId);
        }
    }
    createGame(req) {
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
