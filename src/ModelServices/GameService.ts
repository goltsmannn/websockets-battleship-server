import {GameRequest} from "../../models/Game.interface";
import Ship from "../../models/Ships.interface";
import Player from "../../models/Player.interface";
import {UserData} from "../../models/RoomResponse.interface";
import Request from "../../models/Request.interface";
import PlayerServices from "./PlayerServices";

export default class GameService {

    private static Games: { [key: string]: GameRequest[] } = {};
    private static gameCounter = 0;
    private static playerServices: PlayerServices;

    constructor (playerServices_: PlayerServices) {
        GameService.playerServices = playerServices_;
    }

    static addGame(player1: UserData, player2: UserData) {
        const gameId = (this.gameCounter++).toString();
        this.Games[gameId].push(<GameRequest>{idGame: gameId, idPlayer: player1.index});
        this.Games[gameId].push(<GameRequest>{idGame: gameId, idPlayer: player2.index});

        const request: Request = {
            type: "create_game",
            data: {
                idGame: gameId,
                idPlayer: ""
            },
            id: 0
        }

        this.notifyBothPlayers(request, "player1", player1.index, player2.index);

        return this.Games[gameId];
    }

    private static notifyBothPlayers(request:Request, amendFieldName: string, player1index: string, player2index: string) {
        const ws1 = this.playerServices.Players[player1index].ws;
        const ws2 = this.playerServices.Players[player2index].ws;
        ws1.send(JSON.stringify({...request, data: {...(request.data as object), [amendFieldName]: player1index}}));
        ws2.send(JSON.stringify({...request, data: {...(request.data as object), [amendFieldName]: player2index}}));
    }
}