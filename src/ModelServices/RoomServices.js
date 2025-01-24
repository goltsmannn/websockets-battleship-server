"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GameService_1 = __importDefault(require("./GameService"));
class RoomServices {
    constructor(playerServices_) {
        RoomServices.playerServices = playerServices_;
    }
    static addRoom(player) {
        const roomId = (RoomServices.roomCounter++).toString();
        this.Rooms[roomId] = { roomId, roomUsers: [{ name: player.name, index: player.index }] };
        this.updateRoom();
        return this.Rooms[roomId];
    }
    static addUsersToRoom(player, roomId) {
        if (this.Rooms[roomId].roomUsers.length == 1) {
            this.Rooms[roomId].roomUsers.push({ name: player.name, index: player.index });
        }
        this.updateRoom();
        if (this.Rooms[roomId].roomUsers.length == 2) {
            GameService_1.default.addGame(this.Rooms[roomId].roomUsers[0], this.Rooms[roomId].roomUsers[1]);
        }
        return this.Rooms[roomId];
    }
    static updateRoom() {
        const rooms = Object.values(this.Rooms).filter(room => room.roomUsers.length == 1);
        const request = {
            type: "update_room",
            data: JSON.stringify(rooms),
            id: 0
        };
        this.playerServices.notifyAllUsers(request);
    }
}
RoomServices.Rooms = {};
RoomServices.roomCounter = 0;
exports.default = RoomServices;
