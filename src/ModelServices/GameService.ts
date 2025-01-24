import Player from "../../models/Player.interface";
import {UserData} from "../../models/RoomResponse.interface";
import Request from "../../models/Request.interface";
import PlayerServices from "./PlayerServices";
import ShipRequest from "../../models/ShipRequest.interface";
import StartGameRequest from "../../models/StartGameRequest";
import WebSocket from "ws";

export default class GameService {

    private static Games: { [key: string]: StartGameRequest[] } = {};
    private static GameLayouts: { [key: string]: ShipRequest[] } = {};
    private static gameCounter = 0;
    private static playerServices: PlayerServices;
    private static cnt = 0;

    constructor (playerServices_: PlayerServices) {
        if (GameService.cnt > 0) {
            throw new Error("Cannot have more than one instance of GameService");
        }
        GameService.cnt++;
        GameService.playerServices = playerServices_;
    }

    static addGame(player1: UserData, player2: UserData) {
        const gameId = (this.gameCounter++).toString();
        this.Games[gameId] = [];
        this.Games[gameId].push(<StartGameRequest>{idGame: gameId, idPlayer: player1.index});
        this.Games[gameId].push(<StartGameRequest>{idGame: gameId, idPlayer: player2.index});

        const request: Request = {
            type: "create_game",
            data: {
                idGame: gameId,
                idPlayer: ""
            },
            id: 0
        }

        this.notifyBothPlayers(request, "idPlayer", player1.index, player2.index);

        return this.Games[gameId];
    }

    static addShips(requestData: ShipRequest) {
        if(!this.GameLayouts[requestData.gameId]) {
            this.GameLayouts[requestData.gameId] = [];
        }
        this.GameLayouts[requestData.gameId].push(requestData);
        if (this.GameLayouts[requestData.gameId].length == 2) {
            console.log('b');
            const gameData = this.GameLayouts[requestData.gameId];

            const ws1: WebSocket = this.playerServices.Players[gameData[0].indexPlayer].ws;
            const request: Request = {
                type: "start_game",
                data: JSON.stringify(gameData[0]),
                id: 0
            }
            ws1.send(JSON.stringify(request));

            const ws2: WebSocket = this.playerServices.Players[gameData[1].indexPlayer].ws;
            request.data = JSON.stringify(gameData[1]);
            ws2.send(JSON.stringify(request));
        }
    }

    private static notifyBothPlayers(request:Request, amendFieldName: string, player1index: string, player2index: string) {
        const ws1 = this.playerServices.Players[player1index].ws;
        const ws2 = this.playerServices.Players[player2index].ws;
        ws1.send(JSON.stringify({...request,
            data: JSON.stringify({...(request.data as object), [amendFieldName]: player1index})
        }));
        ws2.send(JSON.stringify({...request,
            data: JSON.stringify({...(request.data as object), [amendFieldName]: player2index})
        }));    }
}