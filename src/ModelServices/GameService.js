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
        this.Games[gameId] = [];
        this.Games[gameId].push({ idGame: gameId, idPlayer: player1.index });
        this.Games[gameId].push({ idGame: gameId, idPlayer: player2.index });
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
            console.log('b');
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
        }
    }
    static notifyBothPlayers(request, amendFieldName, player1index, player2index) {
        const ws1 = this.playerServices.Players[player1index].ws;
        const ws2 = this.playerServices.Players[player2index].ws;
        ws1.send(JSON.stringify(Object.assign(Object.assign({}, request), { data: JSON.stringify(Object.assign(Object.assign({}, request.data), { [amendFieldName]: player1index })) })));
        ws2.send(JSON.stringify(Object.assign(Object.assign({}, request), { data: JSON.stringify(Object.assign(Object.assign({}, request.data), { [amendFieldName]: player2index })) })));
    }
}
GameService.Games = {};
GameService.GameLayouts = {};
GameService.gameCounter = 0;
GameService.cnt = 0;
exports.default = GameService;
