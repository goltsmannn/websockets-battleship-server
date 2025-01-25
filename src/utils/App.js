"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Player_interface_1 = require("../../models/Player.interface");
const PlayerErrors_1 = require("../Errors/PlayerErrors");
const GameService_1 = __importDefault(require("../ModelServices/GameService"));
const RoomServices_1 = __importDefault(require("../ModelServices/RoomServices"));
class App {
    constructor(playerServices, roomService, gameService, ws) {
        this.ws = ws;
        this.playerServices = playerServices;
        this.roomService = roomService;
        this.gameService = gameService;
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
                this.createRoom(req, player);
            }
            else if (req.type === "add_user_to_room") {
                this.addUserToRoom(req, player);
            }
            else if (req.type === "add_ships") {
                this.addShips(req, player);
            }
            else if (req.type === "attack") {
                this.attack(req);
            }
            else if (req.type === "finish") {
                this.finish(req);
            }
            else if (req.type == "randomAttack") {
                this.giveTurn(req);
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
    createRoom(req, player) {
        RoomServices_1.default.addRoom(player);
    }
    addUserToRoom(req, player) {
        const roomId = req.data.hasOwnProperty("indexRoom") ? req.data.indexRoom : undefined;
        if (!roomId) {
            throw new Error("Missing data in add user to room request");
        }
        else {
            RoomServices_1.default.addUsersToRoom(player, roomId);
        }
    }
    addShips(req, player) {
        let gameId, indexPlayer, ships;
        if (req.data.hasOwnProperty('gameId')
            && req.data.hasOwnProperty('indexPlayer')
            && req.data.hasOwnProperty('ships')) {
            gameId = req.data.gameId;
            indexPlayer = req.data.indexPlayer;
            ships = req.data.ships;
        }
        else {
            throw new Error("Missing data in add ships request");
        }
        //   console.log({gameId, ships, indexPlayer})
        GameService_1.default.addShips({ gameId, ships, indexPlayer });
    }
    attack(req) {
        const data = req.data;
        if ('gameId' in data && 'indexPlayer' in data && 'x' in data && 'y' in data) {
            GameService_1.default.attack(data);
        }
        else {
            throw new Error("Missing data in attack request");
        }
    }
    giveTurn(req) {
        GameService_1.default.giveTurn(req);
    }
    finish(req) {
    }
}
exports.default = App;
