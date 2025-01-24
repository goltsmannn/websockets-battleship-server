import Request from "../../models/Request.interface";
import {WebSocket} from "ws";
import Player, {isPlayerData} from "../../models/Player.interface";
import PlayerServices from "../ModelServices/PlayerServices";
import RoomServices from "../ModelServices/RoomServices";
import {AuthorizationError, MultiTabConnectionError} from "../Errors/PlayerErrors";
import GameService from "../ModelServices/GameService";
import roomServices from "../ModelServices/RoomServices";

class App {

    ws: WebSocket;
    playerServices: PlayerServices;
    roomService: RoomServices;
    gameService: GameService;

    constructor(playerServices: PlayerServices, roomService: RoomServices, gameService: GameService, ws: WebSocket) {
        this.ws = ws;
        this.playerServices = playerServices;
        this.roomService = roomService;
        this.gameService = gameService;
    }

    public dispatchRequest(req: Request) {
        //  req.data = JSON.parse(req.data);
        if (req.type === "reg") {
            this.registerPlayer(req);
        } else {
            const player = this.playerServices.findPlayerByWs(this.ws);
            if (!player) {
                throw new Error("Error while locating player by WS connection");
            }

            if (req.type === "create_room") {
                this.createRoom(req, player);
            } else if (req.type === "add_user_to_room") {
                this.addUserToRoom(req, player);
            } else if (req.type === "add_ships") {
                this.addShips(req, player);
            } else if (req.type === "start_game") {
                this.startGame(req);
            } else if (req.type === "attack") {
                this.attack(req);
            } else if (req.type === "randomAttack") {
                this.randomAttack(req);
            } else if (req.type === "turn") {
                this.turn(req);
            } else if (req.type === "finish") {
                this.finish(req);
            } else {
                throw new Error("Invalid request type");
            }
        }
    }

    private registerPlayer(req: Request) {
        if (!isPlayerData(req.data)) {
            const response: Request = {type: "reg", id: req['id'], data: {
                name: "",
                index: "",
                error: true,
                errorText: "Invalid data"
                }};
            this.ws.send(JSON.stringify({response}));
        }
        try {
            const player: Player = this.playerServices.addPlayer((req.data as Player).name, (req.data as Player).password, this.ws);
            const response: Request = {type: "reg",
                data: JSON.stringify({
                    name: player.name,
                    index: player.index,
                    error: false,
                    errorText: "",
                }),
                id: req['id']};
            this.ws.send(JSON.stringify(response));

        } catch (err) {
            if (err instanceof AuthorizationError) {
                console.log(err.message);
                this.ws.send("");
            } else if (err instanceof MultiTabConnectionError) {
                console.log(err.message);
                this.ws.send("");
            } else {
                this.ws.send("");
            }
        }
    }

    private createRoom(req: Request, player: Player) {
        roomServices.addRoom(player!);
    }


    private addUserToRoom(req: Request, player: Player) {
        const roomId = req.data.hasOwnProperty("indexRoom") ? (req.data as any).indexRoom : undefined;
        if (!roomId) {
            throw new Error("Missing data in json req");
        } else {
            roomServices.addUsersToRoom(player!, roomId);
        }
    }

    private addShips(req: Request, player: Player) {
        let gameId, indexPlayer, ships;
        if  (req.data.hasOwnProperty('gameId')
            && req.data.hasOwnProperty('indexPlayer')
            && req.data.hasOwnProperty('ships')
        ) {
            gameId = (req.data as any).gameId;
            indexPlayer = (req.data as any).indexPlayer;
            ships = (req.data as any).ships;
        } else {
            throw new Error("Missing data in json req");
        }
        GameService.addShips({gameId, ships, indexPlayer});
    }

    private finish(req: Request) {

    }

    private turn(req: Request) {

    }

    private randomAttack(req: Request) {

    }

    private startGame(req: Request) {

    }
    private attack(req: Request) {

    }
}

export default App;