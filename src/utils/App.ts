import Request from "../../models/Request.interface";
import {WebSocket} from "ws";
import Player, {isPlayerData} from "../../models/Player.interface";
import PlayerServices from "../ModelServices/PlayerServices";

class App {

    ws: WebSocket;
    playerServices: PlayerServices;

    constructor(playerServices: PlayerServices, ws: WebSocket) {
        this.ws = ws;
        this.playerServices = playerServices;
    }

    public dispatchRequest(req: Request) {
      //  req.data = JSON.parse(req.data);
        switch (req.type) {
            case "reg":
                this.registerPlayer(req);
                break;
            case "update_winners":
                this.updateWinners(req);
                break
            case "create_room":
                this.createRoom(req);
                break;
            case "create_game":
                this.createGame(req);
                break;
            case "update_room":
                this.updateRoom(req);
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
        console.log(this.ws);
        this.ws.send(JSON.stringify(response));
    }

    private updateWinners(req: Request) {
        return;
    }

    private createGame(req: Request) {

    }

    private updateRoom(req: Request) {

    }

    private createRoom(req: Request) {

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