import dotenv from 'dotenv';
import { Pool, PoolClient } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import Game from '../Game';
import Kick from '../Kick';
import Player, { PlayerSerialized, PlayerStats } from '../Player';
import { inDevelopment } from '../utils';

dotenv.config();

const originalPoolQuery = Pool.prototype.query;
// @ts-ignore
Pool.prototype.query = async function query(...args) {
    try {
        // @ts-ignore
        return await originalPoolQuery.apply(this, args);
        // @ts-ignore
    } catch(e) {Error.captureStackTrace(e); throw e;}
}

const dbName = inDevelopment ? process.env.DB_NAME_DEV : process.env.DB_NAME;
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: dbName,
    host: process.env.DB_HOST,
}

export const pool = new Pool ({
    max: 20,
    connectionString: `postgres://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}/${dbConfig.database}`,
    idleTimeoutMillis: 30000
});

async function createPlayer(player: Player) {
    const client = await pool.connect();
    client.query(
        `INSERT INTO "Player" (
            name,
            is_admin,
            muted
        ) VALUES (
            $1,
            $2,
            $3
        )`,
        [player.name, player.isAdmin, player.muted]
    )

    const gameModes = ['1v1', '2v2', '3v3', '4v4', 'waiting'];
    for (const gameMode of gameModes) 
        createGameModeStatistics(player, gameMode, client);

    client.release();
}

async function getPlayer(name: string): Promise<PlayerSerialized> {
    const client = await pool.connect();

    const { rows } = await client.query(
        `SELECT * FROM "Player" WHERE name = $1`,
        [name]
    )

    client.release();

    if (rows.length === 0) {
        return Promise.reject(null);
    }

    const player: PlayerSerialized = {
        name: rows[0].name,
        isAdmin: rows[0].is_admin,
        muted: rows[0].muted
    }

    return player;
}

async function updatePlayer(player: Player) {
    const client = await pool.connect();

    client.query(
        `UPDATE "Player" SET
            is_admin = $1,
            muted = $2
        WHERE name = $3`,
        [player.isAdmin, player.muted, player.name]
    )

    client.release();
}

async function createGameModeStatistics(player: Player, gameMode: string, client: PoolClient) {
    client.query(
        `INSERT INTO "GameModeStatistics" (
            player,
            game_mode,
            goals,
            assists,
            shots,
            saves,
            own_goals
        ) VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7
        )`,
        [
            player.name,
            gameMode,
            0,
            0,
            0,
            0,
            0,
        ]
    )
}

async function createKick(kick: Kick) {
    const client = await pool.connect();

    const timestamp = Date.now();
    client.query(
        `INSERT INTO "Kick" (
            id,timestamp,game,ball_x,ball_y,ball_vel_x,ball_vel_y,kicker,goal,type,team
        ) VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11
        )`,
        [
            kick.id,
            timestamp,
            kick.gameID,
            kick.ball.position.x,
            kick.ball.position.y,
            kick.ball.velocity.x,
            kick.ball.velocity.y,
            kick.kicker.name,
            kick.goal,
            kick.type,
            kick.kicker.team,
        ]
    )

    const queryCreatePosition = `INSERT INTO "Position" (id, player, x, y, timestamp, game) VALUES ($1, $2, $3, $4, $5, $6)`;
    const allPlayerPositions = kick.positionsTeam.concat(kick.positionsOpponent);
    for (const playerPosition of allPlayerPositions) {
        const positionUUID = uuidv4();
        client.query(
            queryCreatePosition,
            [
                positionUUID,
                playerPosition.player.name,
                playerPosition.x,
                playerPosition.y,
                timestamp,
                kick.gameID,
            ]
        )

        client.query(
            `INSERT INTO "PositionKick" (position, kick, team) VALUES ($1, $2, $3)`,
            [ positionUUID, kick.id, playerPosition.player.team ]
        )
    }

    const positionUUID = uuidv4();
    client.query(
        queryCreatePosition,
        [ positionUUID, kick.kicker.name, kick.kickerPosition.x, kick.kickerPosition.y, timestamp, kick.gameID]
    )

    client.query(
        `INSERT INTO "PositionKick" (position, kick, team) VALUES ($1, $2, $3)`,
        [ positionUUID, kick.id, kick.kicker.team ]
    )

    client.release();
}


async function updateKick(kick: Kick) {
    const client = await pool.connect();

    client.query(
        `UPDATE "Kick" SET
            goal = $1
        WHERE id = $2`,
        [kick.goal, kick.id]
    )

    client.release();
}


async function createGame(game: Game) {
    const client = await pool.connect();

    client.query(
        `INSERT INTO "Game" (id,game_mode,blue_goals,red_goals,timestamp_start,timestamp_end) VALUES ($1,$2,$3,$4,$5,$6)`,
        [ game.id, game.gameMode, game.blueGoals, game.redGoals, game.start, game.end]
    )

    client.release();
}


async function updateGame(game: Game) {
    const client = await pool.connect();

    client.query(
        `UPDATE "Game" SET
            blue_goals = $1,
            red_goals = $2,
            timestamp_end = $3
        WHERE id = $4`,
        [ game.blueGoals, game.redGoals, game.end, game.id ]
    )

    client.release();
}


async function incrementGoals(player: Player, gameMode: string) {
    const client = await pool.connect();

    client.query(
        `UPDATE "GameModeStatistics" SET
            goals = goals + 1
        WHERE player = $1 AND game_mode = $2`,
        [ player.name, gameMode ]
    )

    client.release();
}


async function incrementOwnGoals(player: Player, gameMode: string) {
    const client = await pool.connect();

    client.query(
        `UPDATE "GameModeStatistics" SET
            own_goals = own_goals + 1
        WHERE player = $1 AND game_mode = $2`,
        [ player.name, gameMode ]
    )

    client.release();
}



async function incrementAssists(player: Player, gameMode: string) {
    const client = await pool.connect();

    client.query(
        `UPDATE "GameModeStatistics" SET
            assists = assists + 1
        WHERE player = $1 AND game_mode = $2`,
        [ player.name, gameMode ]
    )

    client.release();
}


async function incrementShots(player: Player, gameMode: string) {
    const client = await pool.connect();

    client.query(
        `UPDATE "GameModeStatistics" SET
            shots = shots + 1
        WHERE player = $1 AND game_mode = $2`,
        [ player.name, gameMode ]
    )
        
    client.release();
}

async function incrementPasses(player: Player, gameMode: string) {
    const client = await pool.connect();

    client.query(
        `UPDATE "GameModeStatistics" SET
            passes = passes + 1
        WHERE player = $1 AND game_mode = $2`,
        [ player.name, gameMode ]
    )

    client.release();
}


async function incrementSaves(player: Player, gameMode: string) {
    const client = await pool.connect();

    client.query(
        `UPDATE "GameModeStatistics" SET
            saves = saves + 1
        WHERE player = $1 AND game_mode = $2`,
        [ player.name, gameMode ]
    )

    client.release();
}


async function incrementLosses(player: Player, gameMode: string) {
    const client = await pool.connect();

    client.query(
        `UPDATE "GameModeStatistics" SET
            losses = losses + 1
        WHERE player = $1 AND game_mode = $2`,
        [ player.name, gameMode ]
    )

    client.release();
}


async function incrementWins(player: Player, gameMode: string) {
    const client = await pool.connect();

    client.query(
        `UPDATE "GameModeStatistics" SET
            wins = wins + 1
        WHERE player = $1 AND game_mode = $2`,
        [ player.name, gameMode ]
    )

    client.release();
}


async function getPlayerStats(player: Player, gameMode?: string): Promise<PlayerStats> {
    const client = await pool.connect();

    let query = `SELECT
            SUM(goals) AS goals, SUM(assists) AS assists,
            SUM(shots) AS shots, SUM(passes) AS passes, SUM(saves) AS saves,
            SUM(wins) AS wins, SUM(losses) AS losses, SUM(own_goals) AS own_goals
            FROM "GameModeStatistics" WHERE player = $1`;
    let queryArgs = [ player.name ];

    if (gameMode) {
        query = `SELECT * FROM "GameModeStatistics" WHERE player = $1 AND game_mode = $2`;
        queryArgs = [ player.name, gameMode ];
    } 

    const res = await client.query(
        query,
        queryArgs
    )

    client.release();

    if (res.rows.length === 0) {
        return Promise.reject(null);
    }

    const playerStats = {
        goals: parseInt(res.rows[0].goals),
        assists: parseInt(res.rows[0].assists),
        shots: parseInt(res.rows[0].shots),
        passes: parseInt(res.rows[0].passes),
        saves: parseInt(res.rows[0].saves),
        wins: parseInt(res.rows[0].wins),
        losses: parseInt(res.rows[0].losses),
        ownGoals: parseInt(res.rows[0].own_goals),
    };

    return playerStats;
}


export {
    createGame, createKick, createPlayer,
    getPlayer, getPlayerStats, incrementAssists,
    incrementGoals, incrementLosses, incrementOwnGoals, incrementPasses,
    incrementSaves,
    incrementShots, incrementWins, updateGame, updateKick, updatePlayer
};
