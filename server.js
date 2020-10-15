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

const game = {
    players: [],
    started: false,
    prompts: [],
    round: 1,
    host: null,
};

io.on('connection', socket => {
    console.log('Connection made!', socket.id);

    // Send a notification to a waking device (in Play component)
    socket.emit('deviceWake', socket.id);

    socket.on('updatePlayerId', (name, id) => {
        const { players } = game;
        // Get player by name, since id has changed
        const thisPlayer = players.find(player => player.name === name);
        if (!_.isNil(thisPlayer)) {
            thisPlayer.id = id;
            thisPlayer.connected = true;
            io.emit('updatePlayers', players);
        }
    });

    // Join the actual room
    socket.on('joinSocketRoom', (host, name, id) => {
        const { players } = game;

        if (host) {
            if (!!game.host) {
                io.to(id).emit('hostError', 'Someone is already hosting!');
                return
            }
            game.host = id;
            io.to(id).emit('gameHosted');

        } else { // Player tryna join
            if (!game.host) {
                io.to(id).emit('errorJoining', 'Someone needs to host the bish');
                return;
            }

            if (game.started || game.round === 2) {
                io.to(id).emit('errorJoining', 'The game started already!');
                return;
            }

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

            // Send players array to errbody
            io.emit('updatePlayers', players);

            // Player who submitted name goes to /play
            io.to(id).emit('goToPrompt');
        }

    });

    socket.on('submitPrompt', (id, prompt) => {
        const { players, prompts } = game;
        const thisPlayer = players.find(player => player.id === id);
        if (!_.isNil(thisPlayer)) {
            thisPlayer.promptSubmitted = true;
            io.emit('updatePlayers', players);

            prompts.push({ prompt, number: 0 });
            io.emit('updatePrompts', prompts);
        }   
    });

    socket.on('startGame', () => {
        const { prompts, round, players } = game;
        const shuffledPrompts = _.shuffle(prompts);
        game.prompts = shuffledPrompts;
        io.emit('updatePrompts', shuffledPrompts);

        if (round === 2) {
            players.forEach(p => p.promptSubmitted = true);
            io.emit('updatePlayers', players);
        }

        game.started = true;
        io.emit('gameStarted', true);
    });

    socket.on('bootPlayer', id => {
        const { players } = game;
        const playerIndex = players.findIndex(player => player.id === id);
        players.splice(playerIndex, 1);
        io.emit('updatePlayers', players);

        // Tell the client they've been booted
        io.to(id).emit('bootedPlayer');
    });

    socket.on('sendResponse', (id, me, prompt) => {
        const { prompts } = game;
        
        if (me) {
            const thisPrompt = prompts.find(p => p.prompt === prompt);
            thisPrompt.number++;
            io.emit('updatePrompts', prompts);
        }
    });

    socket.on('submitGuess', id => {
        const { players } = game;
        const thisPlayer = players.find(p => p.id === id);
        if (!_.isNil(thisPlayer)) {
            thisPlayer.guessSubmitted = true;
            io.emit('updatePlayers', players);
        }   
    });
    
    socket.on('revealAnswer', () => {
        io.emit('answerRevealed', true);
    });

    socket.on('sendScore', (id, score) => {
        const { players } = game;
        const thisPlayer = players.find(p => p.id === id);
        if (!_.isNil(thisPlayer)) {
            thisPlayer.score += score;
            thisPlayer.guessSubmitted = false;
            io.emit('updatePlayers', players);
        }
    });

    socket.on('nextPrompt', () => {
        const { prompts, players } = game;
        prompts.shift();
        io.emit('updatePrompts', prompts);

        if (!prompts.length) {
            // Set up the next round
            game.round = (game.round === 1) ? 2 : null;
            game.started = false;
            players.forEach(p => {
                p.guessSubmitted = false;
                p.promptSubmitted = false;
            });
            io.emit('updatePlayers', players);
            io.emit('updateRound', game.round);
            io.emit('gameStarted', false);
        } else {
            players.forEach(p => {
                p.guessSubmitted = false;
            });
            io.emit('updatePlayers', players);
        }
        io.emit('answerRevealed', false);
    });

    socket.on('resetGame', () => {
        const { players } = game;
        game.round = 1;
        io.emit('updateRound', game.round);

        game.started = false;
        io.emit('gameStarted', false);

        const updatedPlayers = players.filter(p => p.connected);
        updatedPlayers.forEach(p => {
            p.guessSubmitted = false;
            p.promptSubmitted = false;
            p.score = 0;
        });
        game.players = updatedPlayers;
        io.emit('updatePlayers', updatedPlayers);
    });

    socket.on('disconnect', () => {
        socket.removeAllListeners();
        const { players, host, started, round } = game;

        // Check if it was host who disconnected
        if (socket.id === host) {
            // Blow game up
            game.host = null;
            game.players = [];
            game.prompts = [];
            game.started = false;
            game.round = 1;

            // Disconnect each player
            players.forEach(player => {
                io.to(player.id).emit('bootedPlayer');
            });
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
                    io.emit('updatePlayers', updatedPlayers);
                } else {
                    // If game has already started, keep them in the game
                    thisPlayer.connected = false;
                    io.emit('updatePlayers', players);
                }
            }
        }
    });

});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

