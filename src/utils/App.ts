import Request from "../../models/Request.interface";
import {WebSocket} from "ws";
import Player, {isPlayerData} from "../../models/Player.interface";
import PlayerServices from "../ModelServices/PlayerServices";
import RoomServices from "../ModelServices/RoomServices";

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
        switch (req.type) {
            case "reg":
                this.registerPlayer(req);
                break;
            case "create_room":
                this.createRoom(req);
                break;
            case "create_game":
                this.createGame(req);
                break;
            case "add_ships":
                this.addShips(req);
                break;
            case "start_game":
                this.startGame(req);
                break;
            case "attack":
                this.attack(req);
                break;
            case "randomAttack":
                this.randomAttack(req);
                break;
            case "turn":
                this.turn(req);
                break;
            case "finish":
                this.finish(req);
                break;
            default:
                throw new Error("Invalid reg type");
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
    }

    private createGame(req: Request) {

    }


    private createRoom(req: Request) {
        const player = this.playerServices.findPlayerByWs(this.ws);
        if (!player) {
            throw new Error("Error while locating player by WS connection");
        }
        RoomServices.addRoom(player);
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