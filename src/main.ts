// room.ts
import HaxballJS from "haxball.js";
import dotenv from "dotenv";
import Room from "./Room";
import { createStatsDirectory } from "./utils";

// initialize stats directory if it doesn't exist
createStatsDirectory();

dotenv.config();
const TOKEN = process.env.TOKEN;
const ROOM_NAME = process.env.ROOM_NAME;

HaxballJS.then((HBInit) => {
  // Same as in Haxball Headless Host Documentation
  const roomHaxBall = HBInit({
    roomName: ROOM_NAME,
    maxPlayers: 16,
    public: true,
    noPlayer: true,
    token: TOKEN, // Required
    password: "123",
  });

  const room = new Room(roomHaxBall);
});

