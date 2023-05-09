import * as fs from 'fs';
import RoomObject from 'haxball.js'
import PlayerObject from 'haxball.js'

export const loadMap = (mapName: string) => {
    const map = fs.readFileSync(`./stadiums/${mapName}.hbs`, 'utf-8');
    return map;
}

export const drawPlayersOnTeams = (room: RoomObject, playersList: PlayerObject[]) => {
  console.log("Drawing players into teams")
  const isPair = playersList.length % 2 == 0; 

  const playersToPlay = isPair ? playersList : playersList.slice(0, -1);
  
  let i = 1;
  playersToPlay.map((player) => {
    room.setPlayerTeam(player.id, i)
    console.log(player.name + " drawn to team " + i);
    i = (i == 1) ? 2 : 1;
  })
}
