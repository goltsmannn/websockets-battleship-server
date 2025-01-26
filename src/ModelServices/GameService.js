"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GameService {
    constructor(playerServices_) {
        if (GameService.cnt > 0) {
            throw new Error("Cannot have more than one instance of GameService");
        }
        GameService.cnt++;
        GameService.playerServices = playerServices_;
    }
    static addGame(player1, player2) {
        const gameId = (this.gameCounter++).toString();
        this.Games[gameId] = {
            idGame: gameId,
            idPlayers: [player1.index, player2.index],
        };
        const request = {
            type: "create_game",
            data: {
                idGame: gameId,
                idPlayer: ""
            },
            id: 0
        };
        this.notifyBothPlayers(request, "idPlayer", player1.index, player2.index);
        return this.Games[gameId];
    }
    static addShips(requestData) {
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
        }
        else {
            this.GameData[requestData.gameId] = Object.assign(Object.assign({}, this.GameData[requestData.gameId]), { cellsPlayer2: response.cells, shipsPlayer2: response.shipData });
            const ids = this.GameData[requestData.gameId].idPlayers;
            const ws1 = this.getWsByIndex(ids[0]);
            const ws2 = this.getWsByIndex(ids[1]);
            ws1.send(JSON.stringify({
                type: "start_game",
                data: JSON.stringify(this.RawGameData[requestData.gameId][ids[0]]),
                id: 0,
            }));
            this.sendTurnRequest(this.Games[requestData.gameId], this.GameData[requestData.gameId].turn);
            ws2.send(JSON.stringify({
                type: "start_game",
                data: JSON.stringify(this.RawGameData[requestData.gameId][ids[1]]),
                id: 0,
            }));
        }
    }
    static attack(request) {
        const defenderId = this.Games[request.gameId].idPlayers.filter(id => id !== request.indexPlayer)[0];
        const attackerId = request.indexPlayer;
        const gameData = this.GameData[request.gameId];
        if (defenderId == gameData.turn) {
            throw new Error("Attacking player is not the current player");
        }
        let defendingCells, defendingShips, defendingCellsLeftCounter;
        if (gameData.idPlayers[0] == attackerId) {
            console.log("First one attacking");
            defendingCells = gameData.cellsPlayer2;
            defendingShips = gameData.shipsPlayer2;
            defendingCellsLeftCounter = gameData.cellsLeft2;
        }
        else {
            console.log("Second one attacking");
            defendingCells = gameData.cellsPlayer1;
            defendingShips = gameData.shipsPlayer1;
            defendingCellsLeftCounter = gameData.cellsLeft1;
        }
        let status;
        if (defendingCells[request.x][request.y] == 0) {
            console.log("Miss");
            this.GameData[request.gameId].turn = defenderId;
            status = "miss";
        }
        else if (defendingCells[request.x][request.y] == 2) {
            console.log("Can't attack dead cells");
            return;
        }
        else {
            const ship = defendingShips.filter(ship => ship.x_0 <= request.x
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
            console.log("Hit");
            if (defendingCellsLeftCounter == 0) {
                status = "gameOver";
                const request = {
                    type: "finish",
                    data: JSON.stringify({
                        winPlayer: attackerId,
                    }),
                    id: 0
                };
                this.notifyBothPlayers(request, "", defenderId, attackerId);
                this.playerServices.Players[attackerId].wins++;
                this.playerServices.updateWinners(this.playerServices.Players[attackerId]);
            }
            console.log(defendingCellsLeftCounter);
        }
        const response = {
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
        if (gameData.idPlayers[0] == attackerId) {
            gameData.cellsLeft2 = defendingCellsLeftCounter;
        }
        else {
            gameData.cellsLeft1 = defendingCellsLeftCounter;
        }
        if (status != "game_over") {
            this.notifyBothPlayers(response, "", attackerId, defenderId);
        }
        if (status == "miss") {
            this.sendTurnRequest(this.Games[request.gameId], defenderId);
        }
    }
    static giveTurn(request) {
        const gameId = request.data.gameId;
        const otherPlayer = this.Games[gameId].idPlayers.filter(id => id !== request.data.currentPlayer)[0];
        this.GameData[gameId].turn = otherPlayer;
        this.sendTurnRequest(this.Games[gameId], otherPlayer);
    }
    // HELPER METHODS
    static getWsByIndex(index) {
        return this.playerServices.Players[index].ws;
    }
    static notifyBothPlayers(request, amendFieldName, player1index, player2index) {
        const ws1 = this.getWsByIndex(player1index);
        const ws2 = this.getWsByIndex(player2index);
        if (amendFieldName) {
            ws1.send(JSON.stringify(Object.assign(Object.assign({}, request), { data: JSON.stringify(Object.assign(Object.assign({}, request.data), { [amendFieldName]: player1index })) })));
            ws2.send(JSON.stringify(Object.assign(Object.assign({}, request), { data: JSON.stringify(Object.assign(Object.assign({}, request.data), { [amendFieldName]: player2index })) })));
        }
        else {
            ws1.send(JSON.stringify(Object.assign(Object.assign({}, request), { data: JSON.stringify(request.data) })));
            ws2.send(JSON.stringify(Object.assign(Object.assign({}, request), { data: JSON.stringify(request.data) })));
        }
    }
    static sendTurnRequest(gameData, turnIndex) {
        const request = {
            type: "turn",
            data: {
                currentPlayer: turnIndex
            },
            id: 0
        };
        this.notifyBothPlayers(request, "", gameData.idPlayers[0], gameData.idPlayers[1]);
    }
    ;
    static processShipData(requestData) {
        let shipData = [];
        let cells = Array.from({ length: 10 }, () => Array(10).fill(0));
        for (const ship of requestData.ships) {
            const length = ship.length;
            let entry = {
                x_0: ship.position.x,
                y_0: ship.position.y,
                x_1: ship.position.x + (ship.direction ? 0 : length - 1),
                y_1: ship.position.y + (ship.direction ? length - 1 : 0),
                cells_left: length,
            };
            shipData.push(entry);
            for (let x = entry.x_0; x <= entry.x_1; x++) {
                for (let y = entry.y_0; y <= entry.y_1; y++) {
                    try {
                        cells[x][y] = 1;
                    }
                    catch (err) {
                        console.log(x, y);
                    }
                }
            }
        }
        this.RawGameData[requestData.gameId] = {};
        this.RawGameData[requestData.gameId][requestData.indexPlayer] = {
            ships: requestData.ships,
            currentPlayerIndex: requestData.indexPlayer,
        }; // for return requests later
        return {
            idGame: requestData.gameId,
            idPlayers: [requestData.indexPlayer, this.Games[requestData.gameId].idPlayers.filter(id => id !== requestData.indexPlayer)[0]],
            cells: cells,
            shipData: shipData,
        };
    }
    static propagateToNeighbors(cells, ship, defenderId, attackerId) {
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
                    const response = {
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
GameService.Games = {};
GameService.GameData = {};
GameService.RawGameData = {};
GameService.gameCounter = 0;
GameService.cnt = 0;
exports.default = GameService;
