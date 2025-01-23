"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
