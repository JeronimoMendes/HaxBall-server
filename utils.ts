import * as fs from 'fs';
import RoomObject from 'haxball.js'
import PlayerObject from 'haxball.js'
import Player from './Player';

export const loadMap = (mapName: string) => {
    const map = fs.readFileSync(`./stadiums/${mapName}.hbs`, 'utf-8');
    return map;
}

export const drawPlayersOnTeams = (room: RoomObject, playersList: Player[], winningTeam?: Player[]) => {
    // reset teams
    playersList.map((player) => {player.team = 0})

    const isPair = playersList.length % 2 == 0; 
    const numberOfPlayersPerTeam = isPair ? playersList.length / 2 : (playersList.length - 1) / 2;

    const playersToPlay = isPair ? playersList : playersList.slice(0, -1);

    playersToPlay.sort(() => Math.random() - 0.5);
    if (winningTeam !== undefined && winningTeam.length > 0) {
        // winning team starts again as red
        // choose numberOfPlayersPerTeam randomly from winning team
        winningTeam.sort(() => Math.random() - 0.5);
        const newRedTeam = winningTeam.slice(0, numberOfPlayersPerTeam + 1);

        newRedTeam.map((player) => {
            player.team = 1
        })

        // remove drawn players from drawing list
        playersList = playersList.filter((player) => !newRedTeam.includes(player))

        // in case there are not enough players in the winning team
        if (winningTeam.length < numberOfPlayersPerTeam) {
            // choose two random players from the list
            const toAddToWinningTeam = playersList.slice(0, 2);
            toAddToWinningTeam.map((player) => {player.team = 1})

            // remove drawn players from drawing list
            playersList = playersList.filter((player) => !toAddToWinningTeam.includes(player))
        }

        // remaining players go to blue team
        playersList.slice(0, numberOfPlayersPerTeam + 1).map((player) => {player.team = 2})
    } else {
        playersList.slice(0, numberOfPlayersPerTeam).map((player) => {player.team = 1})
        playersList.slice(numberOfPlayersPerTeam).map((player) => {player.team = 2})
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
