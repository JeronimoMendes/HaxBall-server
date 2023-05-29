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
        let fields = [
            this.room.currentGameID,
            this.kicker.name,
            this.kicker.team,
            this.kickerPosition.x,
            this.kickerPosition.y,
            this.ballPosition.x,
            this.ballPosition.y,
            this.ballVelocity.x,
            this.ballVelocity.y,
            this.goal
        ]

        if (this.positionsTeam.length > 0) 
            this.positionsTeam.map((position) => fields.push(position.x, position.y));

        if (this.positionsOpponent.length > 0)
            this.positionsOpponent.map((position) => fields.push(position.x, position.y));

        return fields.join(",");
    }
}

export default Kick;