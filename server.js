require('dotenv').config();
const express = require('express');
const https = require('https');
const fs = require('fs');
const socketIO = require('socket.io');
const _ = require('lodash');

const PORT = 4002;

const options = {
    key: fs.readFileSync(process.env.REACT_APP_KEY),
    cert: fs.readFileSync(process.env.REACT_APP_CERT)
};

const app = express();
const server = https.createServer(options, app);
const io = socketIO(server);

const games = [];

io.on('connection', socket => {
    console.log('Connection made!', socket.id);

    // Send a notification to a waking device (in Play component)
    socket.emit('deviceWake', socket.id);

    // Join the actual room
    socket.on('joinSocketRoom', (room, host, name, id) => {

        if (host) {
            socket.join(room);
            console.log(`${room} created!`);
            console.log(`${games.length + 1} total games in progress.`);

            // Default / blank game
            games.push({
                room,
                players: [],
                started: false,
                prompts: [],
                round: 1,
                host: id,
            });

            // Let the host know it's all gucci
            io.to(id).emit('gameHosted', room);

        } else { // Player tryna join
            const game = games.find(game => game.room === room);

            // Check if the room code exists
            if (_.isNil(game)) {
                io.to(id).emit('errorJoining', `${room} is not a valid game code!`);
                return;
            }

            if (!game.host) {
                io.to(id).emit('errorJoining', 'Someone needs to host the bish');
                return;
            }

            if (game.started || game.round === 2) {
                io.to(id).emit('errorJoining', 'The game started already!');
                return;
            }

            const { players } = game;

            if (players.some(player => player.name === name)) {
                io.to(id).emit('errorJoining', 'That name is taken!');
                return;
            }

            players.push({
                name,
                id: socket.id,
                score: 0,
                promptSubmitted: false,
                guessSubmitted: false,
                connected: true,
            });

            // Actually join the bish
            socket.join(room);

            // Send players array to errbody
            io.in(room).emit('updatePlayers', players);

            // Player who submitted name goes to /play
            io.to(id).emit('goToPrompt', room);
        }

    });

    socket.on('submitPrompt', (room, id, prompt) => {
        const game = games.find(game => game.room === room);
        if (!_.isNil(game)) {
            const { players, prompts } = game;
            const thisPlayer = players.find(player => player.id === id);
            if (!_.isNil(thisPlayer)) {
                thisPlayer.promptSubmitted = true;
                io.in(room).emit('updatePlayers', players);

                prompts.push({ prompt, number: 0 });
                io.in(room).emit('updatePrompts', prompts);
            }   
        }
    });

    socket.on('startGame', room => {
        const game = games.find(game => game.room === room);
        if (!_.isNil(game)) {
            const { prompts, round, players } = game;
            const shuffledPrompts = _.shuffle(prompts);
            game.prompts = shuffledPrompts;
            io.in(room).emit('updatePrompts', shuffledPrompts);

            if (round === 2) {
                players.forEach(p => p.promptSubmitted = true);
                io.in(room).emit('updatePlayers', players);
            }

            game.started = true;
            io.in(room).emit('gameStarted', true);
        }   
    });

    socket.on('bootPlayer', (room, id) => {
        const game = games.find(game => game.room === room);
        if (!_.isNil(game)) {
            const { players } = game;
            const playerIndex = players.findIndex(player => player.id === id);
            if (playerIndex !== -1) {
                players.splice(playerIndex, 1);
                io.in(room).emit('updatePlayers', players);

                // Tell the client they've been booted
                io.to(id).emit('bootedPlayer');
            }
        }
    });

    socket.on('sendResponse', (room, id, me, prompt) => {
        const game = games.find(game => game.room === room);
        if (!_.isNil(game)) {
            const { prompts } = game;
            if (me) {
                const thisPrompt = prompts.find(p => p.prompt === prompt);
                thisPrompt.number++;
                io.in(room).emit('updatePrompts', prompts);
            }
        }
    });

    socket.on('submitGuess', (room, id) => {
        const game = games.find(game => game.room === room);
        if (!_.isNil(game)) {
            const { players } = game;
            const thisPlayer = players.find(p => p.id === id);
            if (!_.isNil(thisPlayer)) {
                thisPlayer.guessSubmitted = true;
                io.in(room).emit('updatePlayers', players);
            }
        }   
    });
    
    socket.on('revealAnswer', room => {
        io.in(room).emit('answerRevealed', true);
    });

    socket.on('sendScore', (room, id, score) => {
        const game = games.find(game => game.room === room);
        if (!_.isNil(game)) {
            const { players } = game;
            const thisPlayer = players.find(p => p.id === id);
            if (!_.isNil(thisPlayer)) {
                thisPlayer.score += score;
                thisPlayer.guessSubmitted = false;
                io.in(room).emit('updatePlayers', players);
            }
        }
    });

    socket.on('nextPrompt', room => {
        const game = games.find(game => game.room === room);
        if (!_.isNil(game)) {
            const { prompts, players } = game;
            prompts.shift();
            io.in(room).emit('updatePrompts', prompts);

            if (!prompts.length) {
                // Set up the next round
                game.round = (game.round === 1) ? 2 : null;
                game.started = false;
                players.forEach(p => {
                    p.guessSubmitted = false;
                    p.promptSubmitted = false;
                });
                io.in(room).emit('updatePlayers', players);
                io.in(room).emit('updateRound', game.round);
                io.in(room).emit('gameStarted', false);
            } else {
                players.forEach(p => {
                    p.guessSubmitted = false;
                });
                io.in(room).emit('updatePlayers', players);
            }
            io.in(room).emit('answerRevealed', false);
        }
    });

    socket.on('resetGame', room => {
        const game = games.find(game => game.room === room);
        if (!_.isNil(game)) {
            const { players } = game;
            game.round = 1;
            io.in(room).emit('updateRound', game.round);

            game.started = false;
            io.in(room).emit('gameStarted', false);

            const updatedPlayers = players.filter(p => p.connected);
            updatedPlayers.forEach(p => {
                p.guessSubmitted = false;
                p.promptSubmitted = false;
                p.score = 0;
            });
            game.players = updatedPlayers;
            io.in(room).emit('updatePlayers', updatedPlayers);
        }
    });

    socket.on('disconnect', () => {
        socket.removeAllListeners();
        const game = games.find(g => g.host === socket.id) || games.find(g => g.players.some(p => p.id === socket.id));

        // If they weren't in a game, no one cares
        if (_.isNil(game))
            return;

        const { room, players, host, started, round } = game;

        // Check if it was host who disconnected
        if (socket.id === host) {
            // Disconnect each player
            players.forEach(player => {
                io.to(player.id).emit('bootedPlayer');
            });

            console.log(`${room} game is no more`);
            console.log(`${games.length - 1} total games in progress.`);

            // Delete game
            const gameIndex = games.findIndex(g => g.room === room);
            games.splice(gameIndex, 1);

        } else {
            // If game has already been reset
            if (!game.host)
                return;

            const thisPlayer = players.find(p => p.id === socket.id);
            if (!_.isNil(thisPlayer)) {
                if (!started && round === 1) { // If we're in the starting lobby
                    // Remove them from the game
                    const updatedPlayers = players.filter(p => p.id !== thisPlayer.id);
                    game.players = updatedPlayers;
                    io.in(room).emit('updatePlayers', updatedPlayers);
                } else {
                    // If game has already started, keep them in the game
                    thisPlayer.connected = false;
                    io.in(room).emit('updatePlayers', players);
                }
            }
        }
    });

    socket.on('updatePlayerId', (room, name, id) => {
        const game = games.find(game => game.room === room);
        if (!_.isNil(game)) {
            const { players } = game;
            // Get player by name, since id has changed
            const thisPlayer = players.find(player => player.name === name);
            if (!_.isNil(thisPlayer)) {
                thisPlayer.id = id;
                thisPlayer.connected = true;
                io.in(room).emit('updatePlayers', players);
            }
        }
    });

});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

