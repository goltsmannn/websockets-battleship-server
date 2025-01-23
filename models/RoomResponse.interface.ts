interface UserData {
    name: string;
    index: string;
}

export default interface RoomResponse {
    roomId: string;
    roomUsers: UserData[];
}