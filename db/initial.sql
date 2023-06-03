CREATE TABLE "PositionKick"(
    "position" UUID NOT NULL,
    "kick" UUID NOT NULL,
    "team" INTEGER NOT NULL
);
CREATE TABLE "Player"(
    "name" CHAR(255) NOT NULL,
    "is_admin" BOOLEAN NOT NULL,
    "muted" BOOLEAN NOT NULL,
    PRIMARY KEY ("name")
);
CREATE TABLE "Game"(
    "id" UUID NOT NULL,
    "game_mode" CHAR(255) NOT NULL,
    "blue_goals" INTEGER NOT NULL,
    "red_goals" INTEGER NOT NULL,
    "timestamp_start" BIGINT NOT NULL,
    "timestamp_end" BIGINT NOT NULL,
    PRIMARY KEY ("id")
);
CREATE TABLE "GameModes"("name" CHAR(255) NOT NULL);
ALTER TABLE
    "GameModes" ADD PRIMARY KEY("name");
CREATE TABLE "Kick"(
    "id" UUID NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "game" UUID NOT NULL,
    "ball_x" REAL NOT NULL,
    "ball_y" REAL NOT NULL,
    "ball_vel_x" REAL NOT NULL,
    "ball_vel_y" REAL NOT NULL,
    "kicker" CHAR(255) NOT NULL,
    "goal" BOOLEAN NOT NULL,
    "type" CHAR(255) NOT NULL,
    "team" INTEGER NOT NULL,
    PRIMARY KEY ("id")
);
CREATE TABLE "GameModeStatistics"(
    "player" CHAR(255) NOT NULL,
    "game_mode" CHAR(255) NOT NULL,
    "goals" BIGINT NOT NULL DEFAULT 0,
    "assists" BIGINT NOT NULL DEFAULT 0,
    "shots" BIGINT NOT NULL DEFAULT 0,
    "saves" BIGINT NOT NULL DEFAULT 0,
    "own_goals" BIGINT NOT NULL DEFAULT 0,
    "wins" BIGINT NOT NULL DEFAULT 0,
    "losses" BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY ("player", "game_mode")
);
CREATE TABLE "Position"(
    "id" UUID NOT NULL,
    "player" CHAR(255) NOT NULL,
    "x" REAL NOT NULL,
    "y" REAL NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "game" UUID NOT NULL,
    PRIMARY KEY ("id")
);
ALTER TABLE
    "Position" ADD CONSTRAINT "position_game_foreign" FOREIGN KEY("game") REFERENCES "Game"("id");
ALTER TABLE
    "Kick" ADD CONSTRAINT "kick_game_foreign" FOREIGN KEY("game") REFERENCES "Game"("id");
ALTER TABLE
    "Kick" ADD CONSTRAINT "kick_kicker_foreign" FOREIGN KEY("kicker") REFERENCES "Player"("name");
ALTER TABLE
    "GameModeStatistics" ADD CONSTRAINT "gamemodestatistics_player_foreign" FOREIGN KEY("player") REFERENCES "Player"("name");
ALTER TABLE
    "GameModeStatistics" ADD CONSTRAINT "gamemodestatistics_game_mode_foreign" FOREIGN KEY("game_mode") REFERENCES "GameModes"("name");
ALTER TABLE
    "PositionKick" ADD CONSTRAINT "positionkick_position_foreign" FOREIGN KEY("position") REFERENCES "Position"("id");
ALTER TABLE
    "Game" ADD CONSTRAINT "game_game_mode_foreign" FOREIGN KEY("game_mode") REFERENCES "GameModes"("name");
ALTER TABLE
    "Position" ADD CONSTRAINT "position_player_foreign" FOREIGN KEY("player") REFERENCES "Player"("name");
ALTER TABLE
    "PositionKick" ADD CONSTRAINT "positionkick_kick_foreign" FOREIGN KEY("kick") REFERENCES "Kick"("id");


INSERT INTO "GameModes"("name") VALUES('waiting');
INSERT INTO "GameModes"("name") VALUES('1v1');
INSERT INTO "GameModes"("name") VALUES('2v2');
INSERT INTO "GameModes"("name") VALUES('3v3');
INSERT INTO "GameModes"("name") VALUES('4v4');