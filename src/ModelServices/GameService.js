"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ShipRequest_interface_1 = require("../../models/ShipRequest.interface");
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
            turn: ""
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
        if (!this.GameLayouts[requestData.gameId]) {
            this.GameLayouts[requestData.gameId] = [];
        }
        this.GameLayouts[requestData.gameId].push(requestData);
        if (this.GameLayouts[requestData.gameId].length == 2) {
            const gameData = this.GameLayouts[requestData.gameId];
            const ws1 = this.playerServices.Players[gameData[0].indexPlayer].ws;
            const request = {
                type: "start_game",
                data: JSON.stringify(gameData[0]),
                id: 0
            };
            ws1.send(JSON.stringify(request));
            const ws2 = this.playerServices.Players[gameData[1].indexPlayer].ws;
            request.data = JSON.stringify(gameData[1]);
            ws2.send(JSON.stringify(request));
            this.Games[requestData.gameId].turn = gameData[0].indexPlayer; // Making the first player who completed his ships attack
            this.sendTurnRequest(this.Games[requestData.gameId], gameData[0].indexPlayer);
            this.gameCells[requestData.gameId] = [];
            for (const layout of gameData) {
                const myShips = Array.from({ length: 10 }, () => Array(10).fill(0));
                for (const ship of layout.ships) {
                    let len = ShipRequest_interface_1.ShipType[ship.type];
                    if (!ship.direction) {
                        for (let i = 0; i < len; i++) {
                            myShips[ship.position.x + i][ship.position.y] = 1;
                        }
                    }
                    else {
                        for (let i = 0; i < len; i++) {
                            myShips[ship.position.x][ship.position.y + i] = 1;
                        }
                    }
                }
                this.gameCells[requestData.gameId].push({ cells: myShips, cellsLeft: 20, idGame: requestData.gameId, idPlayer: layout.indexPlayer });
            }
        }
    }
    static attack(request) {
        const gameLayout = this.GameLayouts[request.gameId];
        const gameData = this.Games[request.gameId];
        const attacking = this.playerServices.Players[request.indexPlayer];
        const defending = this.playerServices.Players[gameData.idPlayers.filter((id) => id != attacking.index)[0]];
        if (attacking.index !== gameData.turn) {
            throw new Error("Not your turn to attack");
        }
        const defendingLayout = gameLayout.filter((layout) => layout.indexPlayer == defending.index)[0];
        const defendingCells = this.gameCells[request.gameId].filter((cell) => cell.idPlayer == defending.index)[0];
        if (defendingCells.cells[request.x][request.y] == 0) {
            console.log("Missed");
            this.sendTurnRequest(gameData, defending.index);
        }
        else if (defendingCells.cells[request.x][request.y] == 2) {
            console.log("Already attacked");
        }
        else {
            console.log("Hit");
            defendingCells.cells[request.x][request.y] = 1;
            defendingCells.cellsLeft--;
            if (defendingCells.cellsLeft == 0) {
                console.log("Game Over");
            }
        }
    }
    static notifyBothPlayers(request, amendFieldName, player1index, player2index) {
        const ws1 = this.playerServices.Players[player1index].ws;
        const ws2 = this.playerServices.Players[player2index].ws;
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
        this.Games[gameData.idGame].turn = turnIndex;
        this.notifyBothPlayers(request, "", gameData.idPlayers[0], gameData.idPlayers[1]);
    }
    ;
}
GameService.Games = {};
GameService.GameLayouts = {};
GameService.gameCells = {};
GameService.gameCounter = 0;
GameService.cnt = 0;
exports.default = GameService;
