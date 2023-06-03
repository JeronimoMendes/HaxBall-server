import { v4 as uuidv4 } from 'uuid';
import { createGame, updateGame } from './db/db';

class Game {
    gameMode: string;
    start: number = Date.now();
    end: number = 0;
    redGoals: number = 0;
    blueGoals: number = 0;
    id: string = uuidv4();

    constructor(gameMode: string) {
        this.gameMode = gameMode;

        createGame(this);
    }

    endGame(): void {
        this.end = Date.now();
        updateGame(this);
    }
}

export default Game;