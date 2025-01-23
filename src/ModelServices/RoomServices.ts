import PlayerServices from "./PlayerServices";
import RoomResponse from "../../models/RoomResponse.interface";
import Player from "../../models/Player.interface";
import Request from "../../models/Request.interface";


class RoomServices {

    private static playerServices: PlayerServices;
    private static Rooms: { [key: string]: RoomResponse } = {};
    private static roomCounter = 0;

    constructor (playerServices_: PlayerServices) {
        RoomServices.playerServices = playerServices_;
    }

    static addRoom(player: Player): RoomResponse {
        const roomId: string = (RoomServices.roomCounter++).toString();
        this.Rooms[roomId] = <RoomResponse>{roomId, roomUsers: [{name: player.name, index: player.index}]};
        this.updateRoom();
        return this.Rooms[roomId];
    }

    static addUsersToRoom(player: Player, roomId: string): RoomResponse {
        if (this.Rooms[roomId].roomUsers.length == 1) {
            this.Rooms[roomId].roomUsers.push({name: player.name, index: player.index});
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
        }
        this.playerServices.notifyAllUsers(request);
    }




}

export default RoomServices;