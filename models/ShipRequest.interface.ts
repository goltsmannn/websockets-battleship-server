interface Position {
    x: number;
    y: number;
}

export const ShipType = {
    'small': 1,
    'medium': 2,
    'large': 3,
    'huge': 4
}

export interface ShipData {
    position: Position;
    direction: boolean;
    length: number;
    type: "small" | "medium" | "large" | "huge";
}

export default interface ShipRequest {
    gameId: string;
    ships: ShipData[];
    indexPlayer: string;
}

export interface ShipResponse {
    ships: ShipData[];
    currentPlayerIndex: string;
}