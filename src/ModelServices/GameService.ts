import Player from "../../models/Player.interface";
import {UserData} from "../../models/RoomResponse.interface";
import Request from "../../models/Request.interface";
import PlayerServices from "./PlayerServices";
import ShipRequest, {ShipType} from "../../models/ShipRequest.interface";
import StartGameRequest from "../../models/StartGameRequest";
import WebSocket from "ws";
import {AttackData} from "../../models/AttackRequest.interface";
import {gameData} from "../../models/StartGameRequest";
import GameBoardInterface from "../../models/GameBoard.interface";

export default class GameService {

    private static Games: { [key: string]: gameData } = {};
    private static GameLayouts: { [key: string]: ShipRequest[] } = {};
    private static gameCells: { [key: string]: GameBoardInterface[] } = {};
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
        this.Games[gameId] = {
            idGame: gameId,
            idPlayers: [player1.index, player2.index],
            turn: ""
        }

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

            this.Games[requestData.gameId].turn = gameData[0].indexPlayer; // Making the first player who completed his ships attack
            this.sendTurnRequest(this.Games[requestData.gameId], gameData[0].indexPlayer);
            this.gameCells[requestData.gameId] = [];
            for(const layout of gameData) {
                const myShips: number[][] = Array.from({ length: 10 }, () => Array(10).fill(0));

                for (const ship of layout.ships) {
                    let len = ShipType[ship.type];

                    if (!ship.direction) {
                        for (let i = 0; i < len; i++) {
                            myShips[ship.position.x + i][ship.position.y] = 1;
                        }
                    } else {
                        for (let i = 0; i < len; i++) {
                            myShips[ship.position.x][ship.position.y + i] = 1;
                        }
                    }
                }
                this.gameCells[requestData.gameId].push(
                    {cells: myShips, cellsLeft: 20, idGame: requestData.gameId, idPlayer: layout.indexPlayer}
                );
            }
        }
    }

    static attack(request: AttackData) {
        const gameLayout: ShipRequest[] = this.GameLayouts[request.gameId];
        const gameData = this.Games[request.gameId];

        const attacking = this.playerServices.Players[request.indexPlayer];
        const defending = this.playerServices.Players[
            gameData.idPlayers.filter((id) => id != attacking.index)[0]];

        if (attacking.index !== gameData.turn) {
            throw new Error("Not your turn to attack");
        }

        const defendingLayout = gameLayout.filter((layout) => layout.indexPlayer == defending.index)[0];
        const defendingCells = this.gameCells[request.gameId].filter((cell) => cell.idPlayer == defending.index)[0];

        if (defendingCells.cells[request.x][request.y] == 0) {
            console.log("Missed");
            this.sendTurnRequest(gameData, defending.index);
        } else if (defendingCells.cells[request.x][request.y] == 2) {
            console.log("Already attacked");
        } else {
            console.log("Hit");
            defendingCells.cells[request.x][request.y] = 1;
            defendingCells.cellsLeft--;
            if (defendingCells.cellsLeft == 0) {
                console.log("Game Over");
            }
        }
    }

    private static notifyBothPlayers(request:Request, amendFieldName: string, player1index: string, player2index: string) {
        const ws1 = this.playerServices.Players[player1index].ws;
        const ws2 = this.playerServices.Players[player2index].ws;
        if (amendFieldName) {
            ws1.send(JSON.stringify({...request,
                data: JSON.stringify({...(request.data as object), [amendFieldName]: player1index})
            }));
            ws2.send(JSON.stringify({...request,
                data: JSON.stringify({...(request.data as object), [amendFieldName]: player2index})
            }));
        } else {
            ws1.send(JSON.stringify({...request, data: JSON.stringify(request.data)}));
            ws2.send(JSON.stringify({...request, data: JSON.stringify(request.data)}));
        }
    }

    private static sendTurnRequest(gameData: gameData, turnIndex: string) {
        const request: Request= {
            type: "turn",
            data:
                {
                    currentPlayer: turnIndex
                }
            ,
            id: 0
        }
        this.Games[gameData.idGame].turn = turnIndex;
        this.notifyBothPlayers(request, "", gameData.idPlayers[0], gameData.idPlayers[1]);
    };
}