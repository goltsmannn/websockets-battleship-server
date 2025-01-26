import {UserData} from "../../models/RoomResponse.interface";
import Request from "../../models/Request.interface";
import PlayerServices from "./PlayerServices";
import ShipRequest, {ShipResponse} from "../../models/ShipRequest.interface";
import WebSocket from "ws";
import {AttackData} from "../../models/AttackRequest.interface";
import {GameDataPostInitiation, GameDataPreInitiation, ShipDetails} from "../../models/GameData.interface";

export default class GameService {

    private static Games: { [key: string]: GameDataPreInitiation } = {};
    private static GameData: { [key: string]: GameDataPostInitiation } = {};
    private static RawGameData: { [key: string]: {[key: string]: ShipResponse} } = {};


    private static playerServices: PlayerServices;
    private static gameCounter = 0;

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

    public static addShips(requestData: ShipRequest) {
        const response = this.processShipData(requestData);
        if (!this.GameData[requestData.gameId]) {
            this.GameData[requestData.gameId] = {
                idGame: response.idGame,
                idPlayers: response.idPlayers,
                turn: requestData.indexPlayer,
                cellsPlayer1: response.cells,
                cellsPlayer2: Array.from({ length: 10 }, () => Array(10).fill(0)),
                shipsPlayer1: response.shipData,
                shipsPlayer2: [],
                cellsLeft1: 20,
                cellsLeft2: 20,
            };
        } else {
            this.GameData[requestData.gameId] = {
                ...this.GameData[requestData.gameId], // Keep existing fields
                cellsPlayer2: response.cells,
                shipsPlayer2: response.shipData,
            }
            const ids = this.GameData[requestData.gameId].idPlayers;

            const ws1 = this.getWsByIndex(ids[0]);
            const ws2 = this.getWsByIndex(ids[1]);
            ws1.send(JSON.stringify(
                {
                    type: "start_game",
                    data: JSON.stringify(this.RawGameData[requestData.gameId][ids[0]]),
                    id: 0,
                }));
            this.sendTurnRequest(this.Games[requestData.gameId], this.GameData[requestData.gameId].turn);
            ws2.send(JSON.stringify(
                {
                    type: "start_game",
                    data: JSON.stringify(this.RawGameData[requestData.gameId][ids[1]]),
                    id: 0,
                }));
        }
    }

    public static attack(request: AttackData) {
        const defenderId = this.Games[request.gameId].idPlayers.filter(id => id !== request.indexPlayer)[0];
        const attackerId = request.indexPlayer;
        const gameData = this.GameData[request.gameId];

        if (defenderId == gameData.turn) {
            throw new Error("Attacking player is not the current player");
        }

        let defendingCells, defendingShips, defendingCellsLeftCounter;
        if(gameData.idPlayers[0] == attackerId) {
            console.log("First one attacking")
            defendingCells = gameData.cellsPlayer2;
            defendingShips = gameData.shipsPlayer2;
            defendingCellsLeftCounter = gameData.cellsLeft2;
        } else {
            console.log("Second one attacking")
            defendingCells = gameData.cellsPlayer1;
            defendingShips = gameData.shipsPlayer1;
            defendingCellsLeftCounter = gameData.cellsLeft1;
        }


        let status;
        if (defendingCells[request.x][request.y] == 0) {
            console.log("Miss");
            this.GameData[request.gameId].turn = defenderId
            status = "miss";
        } else if (defendingCells[request.x][request.y] == 2) {
            console.log("Can't attack dead cells");
            return;
        } else {
            const ship = defendingShips.filter(
                ship => ship.x_0 <= request.x
                && request.x <= ship.x_1
                && ship.y_0 <= request.y
                && request.y <= ship.y_1)[0];
            ship.cells_left -= 1;
            defendingCellsLeftCounter--;

            if (ship.cells_left == 0) {
                status = "kill";
                this.propagateToNeighbors(defendingCells, ship, defenderId, attackerId);
            }
            status = "hit";
            console.log("Hit")
            if(defendingCellsLeftCounter == 0) {
                status = "gameOver";
                const request = {
                    type: "finish",
                    data:
                        JSON.stringify({
                            winPlayer: attackerId,
                        }),
                    id: 0
                }
                this.notifyBothPlayers(request, "", defenderId, attackerId);
                this.playerServices.Players[attackerId].wins++;
                this.playerServices.updateWinners(this.playerServices.Players[attackerId]);
            }
            console.log(defendingCellsLeftCounter);
        }

        const response: Request = {
            type: "attack",
            data: {
                position: {
                    x: request.x,
                    y: request.y,
                },
                currentPlayer: attackerId,
                status: status,
            },
            id: 0
        };

        if(gameData.idPlayers[0] == attackerId) {
             gameData.cellsLeft2 = defendingCellsLeftCounter;
        } else {
            gameData.cellsLeft1 = defendingCellsLeftCounter;
        }
        if (status != "game_over") {
            this.notifyBothPlayers(response, "", attackerId, defenderId);
        }
        if (status == "miss") {
            this.sendTurnRequest(this.Games[request.gameId], defenderId);
        }

    }



    public static giveTurn(request: Request) {
        const gameId = (request as any).data!.gameId;
        const otherPlayer = this.Games[gameId].idPlayers.filter(id => id !== (request as any).data!.currentPlayer)[0];
        this.GameData[gameId].turn = otherPlayer;
        this.sendTurnRequest(this.Games[gameId], otherPlayer);
    }
    // HELPER METHODS






    private static getWsByIndex(index: string) {
        return this.playerServices.Players[index].ws;
    }

    private static notifyBothPlayers(request:Request, amendFieldName: string, player1index: string, player2index: string) {
        const ws1 = this.getWsByIndex(player1index);
        const ws2 = this.getWsByIndex(player2index);

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

    private static sendTurnRequest(gameData: GameDataPreInitiation, turnIndex: string) {
        const request: Request= {
            type: "turn",
            data:
                {
                    currentPlayer: turnIndex
                }
            ,
            id: 0
        }
        this.notifyBothPlayers(request, "", gameData.idPlayers[0], gameData.idPlayers[1]);
    };

    private static processShipData(requestData: ShipRequest) {
        let shipData: ShipDetails[] = [];
        let cells: number[][] = Array.from({ length: 10 }, () => Array(10).fill(0));


        for (const ship of requestData.ships) {

            const length = ship.length;

            let entry: ShipDetails = {
                x_0: ship.position.x,
                y_0: ship.position.y,
                x_1: ship.position.x + (ship.direction ? 0 : length-1),
                y_1: ship.position.y + (ship.direction ? length-1 : 0),
                cells_left: length,
            };
            shipData.push(entry);

            for (let x = entry.x_0; x <= entry.x_1; x++) {
                for (let y = entry.y_0; y <= entry.y_1; y++) {
                    try {
                        cells[x][y] = 1;

                    } catch (err) {
                        console.log(x,y);
                    }
                }
            }
        }

        this.RawGameData[requestData.gameId]= {};
        this.RawGameData[requestData.gameId][requestData.indexPlayer] = {
            ships: requestData.ships,
            currentPlayerIndex: requestData.indexPlayer,
        }; // for return requests later



        return {
            idGame: requestData.gameId,
            idPlayers: [requestData.indexPlayer, this.Games[requestData.gameId].idPlayers.filter(id => id !== requestData.indexPlayer)[0]],
            cells: cells,
            shipData: shipData,
        }

    }

    private static propagateToNeighbors(cells: number[][], ship: ShipDetails, defenderId: string, attackerId: string) {
        const x0 = ship.x_0;
        const y0 = ship.y_0;
        const x1 = ship.x_1;
        const y1 = ship.y_1;

        for (let x = x0 - 1; x <= x1 + 1; x++) {
            for (let y = y0 - 1; y <= y1 + 1; y++) {
                if (x < 0 || x >= 10 || y < 0 || y >= 10) {
                    continue;
                }
                if (cells[x][y] == 0) {
                    cells[x][y] = 2;
                    const response: Request = {
                        type: "attack",
                        data: {
                            position: {
                                x: x,
                                y: y,
                            },
                            currentPlayer: attackerId,
                            status: "miss",
                        },
                        id: 0
                    };

                    this.notifyBothPlayers(response, "", attackerId, defenderId);
                }
            }
        }
    }


}