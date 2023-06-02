import Player from "./Player";
import Room from "./Room";
import Ball from "./Ball";
import { Position, Velocity, crossProduct } from "./Common";


type KickType = "kickoff" | "pass" | "shot" | "defense" | "defense + pass" | "normal";

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
    type: KickType = "normal";
    timestamp: number = Date.now();

    constructor(kicker: Player, room: Room) {
        this.kicker = kicker;
        this.kickerPosition = kicker.position;
        this.room = room;
        this.ball = new Ball(room);
        this.ballPosition = this.ball.position;
        this.ballVelocity = this.ball.velocity;
        this.positionsTeam = this.getTeamPositions(kicker.team);
        this.positionsOpponent = this.getTeamPositions(kicker.team == 1 ? 2 : 1);

        this.checkPreviousKickIsPass();
        this.checkIfShot(); 
        this.checkIfKickoff();
        this.checkIfDefense();
    }

    getTeamPositions(team: number): Position[] {
        const teammates = this.room.players.filter((player) => player.team == team && player.id != this.kicker.id);
        const positions = teammates.map((player) => player.position);

        return positions;
    }

    checkPreviousKickIsPass(): void {
        const timestampOffset = 2000;
        const previousKick = this.room.gameKicks[this.room.gameKicks.length - 1];
        if (previousKick != null) {
            if (
                previousKick.kicker != this.kicker && 
                previousKick.kicker.team == this.kicker.team &&
                this.timestamp - previousKick.timestamp < timestampOffset
            ) {
                if (previousKick.type == "defense") {
                    previousKick.type = "defense + pass";
                } else {
                    previousKick.type = "pass";
                }

                previousKick.kicker.passes += 1;
            }
        }
    }

    checkIfShot(): void {
        // if ball is moving towards kicker's goal, it's not a shot
        if ((this.ballVelocity.x > 0 && this.kicker.team == 2) || (this.ballVelocity.x < 0 && this.kicker.team == 1)) 
            return;

        // let's check if ball vector is inside goal angle
        // get pitch dimensions
        const teamSideScalar = this.kicker.team == 1 ? 1 : -1;
        const pitch = this.room.getPitchDimensions();

        // kicks from the first quarter of the pitch are not shots
        if (
            (this.kicker.team == 1 && this.ballPosition.x < - pitch.width / 4) || 
            (this.kicker.team == 2 && this.ballPosition.x > pitch.width / 4)
        ) return;

        const positionTopPost = {
            x: teamSideScalar * pitch.width / 2,
            y: -pitch.goalWidth / 2
        }
        const positionBottomPost = {
            x: teamSideScalar * pitch.width / 2,
            y: pitch.goalWidth / 2
        }

        const vectorBallTopPost = {
            x: positionTopPost.x - this.ballPosition.x,
            y: positionTopPost.y - this.ballPosition.y
        }

        const vectorBallBottomPost = {
            x: positionBottomPost.x - this.ballPosition.x,
            y: positionBottomPost.y - this.ballPosition.y
        }

        // now let's check if ball vector is inside goal angle
        // we can use the cross product to check if the ball vector is
        // inbetween the top and bottom post vectors
        // if VectorBallBottomPost x ballVelocity and ballVelocity x VectorBallTopPost
        // have the same sign, then the ball is inside the goal angle
        if (
            crossProduct(vectorBallTopPost, this.ballVelocity) * crossProduct(vectorBallTopPost, vectorBallBottomPost) >= 0 &&
            crossProduct(vectorBallBottomPost, this.ballVelocity) * crossProduct(vectorBallBottomPost, vectorBallTopPost) >= 0
        ) {
            this.type = "shot";
            this.kicker.shots += 1;
        }
    }

    checkIfKickoff(): void {
        // this offset is to account for when the kicker doesn't kick the ball imeediately
        // after the kickoff, and dribles it a bit
        const offset = 5
        if (
            Math.abs(this.ball.position.x) <= offset &&
            Math.abs(this.ball.position.y) <= offset
        ) this.type = "kickoff";
    }

    checkIfDefense(): void {
        const previousKick = this.room.gameKicks[this.room.gameKicks.length - 1];
        if (
            previousKick != null &&
            previousKick.type == "shot" && 
            previousKick.kicker.team != this.kicker.team &&
            this.kickerInsidePenaltyBox()
        ) {
            this.type = "defense";
            this.kicker.saves += 1;
        }
    }

    sameTeamKick(otherKick: Kick): boolean {
        return this.kicker.team == otherKick.kicker.team;
    }

    kickerInsidePenaltyBox(): boolean {
        // this will in fact be a virtual penalty box since the visual one 
        // is too short in width.
        // to include more kicks that are actually defenses, we will prolong the 
        // penalty box width
        const offset = 20;

        const pitch = this.room.getPitchDimensions();

        if (
            (this.kickerPosition.x > 0 && this.kicker.team == 1) ||
            (this.kickerPosition.x < 0 && this.kicker.team == 2)
        ) return false;

        const innerLimit = pitch.width / 2 - (pitch.penaltyBoxWidth + offset);
        const outerLimit = pitch.width / 2;
        const upperLimit = pitch.penaltyBoxHeight / 2;
        const lowerLimit = -pitch.penaltyBoxHeight / 2;

        if (
            Math.abs(this.kickerPosition.x) >= innerLimit && Math.abs(this.kickerPosition.x) <= outerLimit &&
            this.kickerPosition.y <= upperLimit && this.kickerPosition.y >= lowerLimit
        ) return true;

        return false;
    }

    toCSV(): string {
        let fields = [
            this.timestamp,
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