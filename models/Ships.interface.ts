export default interface Ship {
    gameId: string,
    ships:
        [
            {
                position: {
                    x: number,
                    y: number,
                },
                direction: boolean,
                length: number,
                type: "small"|"medium"|"large"|"huge",
            }
        ],
    indexPlayer: string, /* id of the player in the current game session, send for each one*/
}