export interface ShipDetails {
    x_0: number,
    y_0: number,
    x_1: number,
    y_1: number,
    cells_left: number,
}

export interface GameDataPreInitiation {
    idGame: string,
    idPlayers: string[],
}
export interface GameDataPostInitiation {
    idGame: string,
    idPlayers: string[],

    turn: string,

    cellsPlayer1: number[][],
    cellsPlayer2: number[][],
    shipsPlayer1: ShipDetails[],
    shipsPlayer2: ShipDetails[],
    cellsLeft1: number,
    cellsLeft2: number,
}