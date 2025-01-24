import Request from "./Request.interface";

export interface AttackData {
    gameId: string,
    x: number,
    y: number,
    indexPlayer: string
}


export interface AttackRequest extends Request{
    data: AttackData
}