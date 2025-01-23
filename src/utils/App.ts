import Request from "../../models/Request.interface";
import {WebSocket} from "ws";
import Player, {isPlayerData} from "../../models/Player.interface";
import PlayerServices from "../ModelServices/PlayerServices";
import RoomServices from "../ModelServices/RoomServices";
import {AuthorizationError, MultiTabConnectionError} from "../Errors/PlayerErrors";

class App {

    ws: WebSocket;
    playerServices: PlayerServices;
    roomService: RoomServices;

    constructor(playerServices: PlayerServices, roomService: RoomServices, ws: WebSocket) {
        this.ws = ws;
        this.playerServices = playerServices;
        this.roomService = roomService;
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
                this.createRoom(req);
            } else if (req.type === "add_user_to_room") {
                this.addUserToRoom(req);
            } else if (req.type === "create_game") {
                this.createGame(req);
            } else if (req.type === "add_ships") {
                this.addShips(req);
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

    private createRoom(req: Request) {
        const player = this.playerServices.findPlayerByWs(this.ws);
        RoomServices.addRoom(player!);
    }


    private addUserToRoom(req: Request) {
        const player = this.playerServices.findPlayerByWs(this.ws);
        const roomId = (req.data as object).hasOwnProperty("indexRoom") ? (req.data as any).indexRoom : undefined;
        if (!roomId) {
            console.log("Missing data in json req");
        } else {
            RoomServices.addUsersToRoom(player!, roomId);
        }
    }

    private createGame(req: Request) {

    }

    private finish(req: Request) {

    }

    private turn(req: Request) {

    }

    private randomAttack(req: Request) {

    }

    private startGame(req: Request) {

    }

    private addShips(req: Request) {

    }
    private attack(req: Request) {

    }
}

export default App;