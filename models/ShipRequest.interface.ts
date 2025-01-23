interface Position {
    x: number;
    y: number;
}

interface ShipData {
    positions: Position;
    direction: boolean;
    length: number;
    type: "small" | "medium" | "large" | "huge";
}

export default interface ShipRequest {
    gameId: string;
    ships: ShipData[];
    indexPlayer: number;
}