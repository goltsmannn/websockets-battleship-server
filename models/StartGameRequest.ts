export default interface StartGameRequest {
    idGame: string,
    idPlayer: string
}

export interface gameData {
    idGame: string,
    idPlayers: string[],
    turn: string
}