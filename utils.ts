import * as fs from 'fs';
import RoomObject from 'haxball.js'
import PlayerObject from 'haxball.js'
import Player from './Player';

export const loadMap = (mapName: string) => {
    const map = fs.readFileSync(`./stadiums/${mapName}.hbs`, 'utf-8');
    return map;
}

export const drawPlayersOnTeams = (room: RoomObject, playersList: Player[], winningTeam?: Player[]) => {
    const isPair = playersList.length % 2 == 0; 
    const numberOfPlayersPerTeam = isPair ? playersList.length / 2 : (playersList.length - 1) / 2;

    const playersToPlay = isPair ? playersList : playersList.slice(0, -1);

    playersToPlay.sort(() => Math.random() - 0.5);
    if (winningTeam) {
        winningTeam.map((player) => {
            player.team = 1
        })

        // remove drawn players from drawing list
        playersList.filter((player) => !winningTeam.includes(player))

        if (winningTeam.length < numberOfPlayersPerTeam) {
            // choose two random players from the list
            const toAddToWinningTeam = playersList.slice(0, 2);
            toAddToWinningTeam.map((player) => {player.team = 1})

            // remove drawn players from drawing list
            playersList.filter((player) => !toAddToWinningTeam.includes(player))
        }

        playersList.slice(0, numberOfPlayersPerTeam).map((player) => {player.team = 1})
    } else {
        playersList.slice(0, numberOfPlayersPerTeam).map((player) => {player.team = 1})
        playersList.slice(numberOfPlayersPerTeam).map((player) => {player.team = 2})
    }
}
