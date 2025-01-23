import {createHash} from "crypto";
import WebSocket from "ws";

export default interface Player {
    name: string;
    password: string;
    index: string,
    wins: number,
    ws: WebSocket,
}

export const isPlayerData = (data: any): data is Player => {
    return typeof data.name === 'string' && typeof data.password === 'string';
};

export const createId = (name: string, password: string): string => {
    return createHash('sha256').update(name + password).digest('hex');
}