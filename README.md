# xG Haxball Server

The goal of this small project is to gather data on the web game [Haxball](haxball.com) and to train an xG model.

## Features
- Player statistics (goals, own goals, wins, games, etc...)
- Multiple game modes (1v1, 2v2, etc...)
- Data gathering (kicks)
- Translations
- Points system 
- Voting system

## Starting the server
Obtain a server token [here](https://www.haxball.com/headlesstoken) and paste in the `.env` file like so:
```
TOKEN=your-token
ROOM_NAME=your-name
DB_USER=db-user
DB_PASSWORD=db-password
DB_NAME=db-name
DB_NAME_DEV=db-name-dev
DB_HOST=db-host
PASSWORD=password  # in dev mode room password
LANGUAGE=[en|pt]  # check translations file for supported languages
```
To start the server run:
```
npm start
```
This will run the server in "production" mode.

To start the server in development mode, showing debug logs and preveting data corruption, run:
```
npm run dev
```

## Contributing
Feel free to open any issues or pull requests. This is a low priority project and so be aware that I may not react to it immediatly.
