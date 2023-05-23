import Player from "./Player";
import Room from "./Room";
import Ball from "./Ball";
import { Position, Velocity } from "./Common";
import { Log } from "./utils";


class Kick {
    kicker: Player;
    kickerPosition: Position;
    room: Room;
    goal: boolean = false;
    positionsTeam: Position[] = [];
    positionsOpponent: Position[] = [];
    ball: Ball;
    ballPosition: Position;
    ballVelocity: Velocity;

    constructor(kicker: Player, room: Room) {
        this.kicker = kicker;
        this.kickerPosition = kicker.position;
        this.room = room;
        this.ball = new Ball(room);
        this.ballPosition = this.ball.position;
        this.ballVelocity = this.ball.velocity;
        this.positionsTeam = this.getTeamPositions(kicker.team);
        this.positionsOpponent = this.getTeamPositions(kicker.team == 1 ? 2 : 1);

        Log.debug(this.toCSV());
    }

    getTeamPositions(team: number): Position[] {
        const teammates = this.room.players.filter((player) => player.team == team && player.id != this.kicker.id);
        const positions = teammates.map((player) => player.position);

        return positions;
    }

    toCSV(): string {
        let csvLine = "";

        csvLine += this.kicker.team;
        csvLine += ", " + this.kickerPosition.x + ", " + this.kickerPosition.y;
        csvLine += ", " + this.ballPosition.x + ", " + this.ballPosition.y;
        csvLine += ", " + this.ballVelocity.x + ", " + this.ballVelocity.y;
        csvLine += ", " + this.goal;

        if (this.positionsTeam.length > 0) 
            csvLine += ", " + this.positionsTeam.map((position) => position.x + ", " + position.y).join(", ");

        if (this.positionsOpponent.length > 0)
            csvLine += ", " + this.positionsOpponent.map((position) => position.x + ", " + position.y).join(", ");

        return csvLine;
    }
}

export default Kick;