// room.ts
import HaxballJS from "haxball.js";
import dotenv from "dotenv";
import Room from "./Room";
import { createStatsDirectory } from "./utils";

// initialize stats directory if it doesn't exist
createStatsDirectory();

dotenv.config();
const TOKEN = process.env.TOKEN;

HaxballJS.then((HBInit) => {
  // Same as in Haxball Headless Host Documentation
  const roomHaxBall = HBInit({
    roomName: "Test Server",
    maxPlayers: 16,
    public: true,
    noPlayer: true,
    token: TOKEN, // Required
  });

  const room = new Room(roomHaxBall);
});

