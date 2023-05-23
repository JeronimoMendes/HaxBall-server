import * as fs from 'fs';
import Player from './Player';

export const loadMap = (mapName: string) => {
    const map = fs.readFileSync(`./stadiums/${mapName}.hbs`, 'utf-8');
    return map;
}

export const drawPlayersOnTeams = (room: RoomObject, playersList: Player[], winningTeam?: Player[]) => {
    const isPair = playersList.length % 2 == 0; 
    let numberOfPlayersPerTeam = isPair ? playersList.length / 2 : (playersList.length - 1) / 2;
    numberOfPlayersPerTeam = numberOfPlayersPerTeam > 4 ? 4 : numberOfPlayersPerTeam;
    

    const playersToPlay = isPair ? playersList : playersList.slice(0, -1);

    playersToPlay.sort(() => Math.random() - 0.5);
    if (winningTeam !== undefined && winningTeam.length > 0) {
        // winning team starts again as red
        // choose numberOfPlayersPerTeam randomly from winning team
        winningTeam.sort(() => Math.random() - 0.5);

        // make sure to reduce winning team size if game mode decreases number of players
        winningTeam = winningTeam.slice(0, numberOfPlayersPerTeam);

        // remove drawn players from drawing list
        playersList = playersList.filter((player) => !winningTeam?.includes(player))

        // in case there are not enough players in the winning team
        if (winningTeam.length < numberOfPlayersPerTeam) {
            const playersLeft = numberOfPlayersPerTeam - winningTeam.length;
            const toAddToWinningTeam = playersList.slice(0, playersLeft);
            winningTeam = winningTeam.concat(toAddToWinningTeam);

            // remove drawn players from drawing list
            playersList = playersList.filter((player) => !toAddToWinningTeam.includes(player))
        }

        winningTeam.map((player) => {
            if (player.team != 1) player.team = 1;
        })

        // remaining players go to blue team
        // give priority to players that have not played yet
        // by sorting them by team, 0 first, then 1, then 2
        // sort by lowest team number first
        playersList.sort((a, b) => a.team - b.team);

        // reset team to 0 for all players
        playersList.map((player) => {
            if (player.team != 0) player.team = 0;
        });

        playersList.slice(0, numberOfPlayersPerTeam).map((player) => {
            if (player.team != 2) player.team = 2;
        })
    } else {
        playersList.slice(0, numberOfPlayersPerTeam).map((player) => {
            player.team = 1
        })
        playersList.slice(numberOfPlayersPerTeam, numberOfPlayersPerTeam * 2).map((player) => {player.team = 2})
    }
}

export const createStatsDirectory = () => {
    // create stats directory if it doesn't exist
    if (!fs.existsSync('./stats')) {
        fs.mkdirSync('./stats');
    }

    if (!fs.existsSync('./stats/players.json')) {
        fs.writeFileSync('./stats/players.json', '{}');
    }
}

export class Log {
    static info(message: string) {
        console.log(`\x1b[32m[INFO][${new Date().toUTCString()}] ${message}\x1b[0m`);
    }

    static debug(message: string) {
        if (process.env.NODE_ENV == 'development')
            console.log(`\x1b[33m[DEBUG][${new Date().toUTCString()}] ${message}\x1b[0m`);
    }

    static error(message: string) {
        // print message with color red
        const formattedMessage = `\x1b[31m[ERROR][${new Date().toUTCString()}] ${message}\x1b[0m`;
        console.log(formattedMessage);
        console.error(formattedMessage);
    }
}

export const writeCSV = (data: string, fileName: string) => {
    Log.info(`Writing ${fileName}.csv`);
    fs.appendFile(`./stats/${fileName}.csv`, data, (err) => {
        if (err) {
            Log.error(err.message);
        }
    });
}