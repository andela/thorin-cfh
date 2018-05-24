/* eslint-disable */
import mongoose from 'mongoose';
import Game from './game';
import Player from './player';

require('console-stamp')(console, 'm/dd HH:MM:ss');


const User = mongoose.model('User');
const avatars = require(`${__dirname}/../../app/controllers/avatars.js`).all();

// Valid characters to use to generate random private game IDs
const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';

module.exports = function (io) {
  let game;
  const allGames = {};
  const allPlayers = {};
  const gamesNeedingPlayers = [];
  let userMessage = '';
  let gameID = 0;
  let onlineUsers = [];

  io.sockets.on('connection', (socket) => {
    console.log(`${socket.id} Connected`);
    const gameWithoutPlayers = gamesNeedingPlayers.findIndex(game => game.players.length === 0);
    // Check if a user is to start a game or join a game
    if (gamesNeedingPlayers.length === 0 || gameWithoutPlayers >= 0) {
      userMessage = 'Start Game';
    } else {
      userMessage = 'Join Game';
    };
    socket.emit('id', { id: socket.id, message: userMessage });

    socket.on('pickCards', (data) => {
      console.log(socket.id, 'picked', data);
      if (allGames[socket.gameID]) {
        allGames[socket.gameID].pickCards(data.cards, socket.id);
      } else {
        console.log(
          'Received pickCard from',
          socket.id, 'but game does not appear to exist!'
        );
      }
    });

    socket.on('pickWinning', (data) => {
      if (allGames[socket.gameID]) {
        allGames[socket.gameID].pickWinning(data.card, socket.id);
      } else {
        console.log(
          'Received pickWinning from',
          socket.id, 'but game does not appear to exist!'
        );
      }
    });

      // store online users
    socket.on('connectedUser', data => {
      if (onlineUsers.find(user => user.username === data)) {
        const index = onlineUsers.findIndex(value => value.username === data);
        if (index < 0) {
          onlineUsers.splice(0, 1);
        }
        onlineUsers.splice(index, 1);
      }
      const user = {
        userId: socket.id,
        username: data
      };
      onlineUsers.push(user);
      io.sockets.emit('people', onlineUsers);
      console.log('connect', onlineUsers);
    });

    socket.on('showOnlineUsers', () => {
      io.sockets.emit('people', onlineUsers);
    });

    socket.on('removeUser', data => {
      const index = onlineUsers.findIndex(value => value.username === data);
      if (index < 0) {
        onlineUsers.splice(0, 1);
      }
      onlineUsers.splice(index, 1);
      io.sockets.emit('people', onlineUsers);
    });

    // send invite to player
    socket.on('invitePlayer', data => {
      if (onlineUsers.find(user => user.username === data.user)) {
        const socketId = onlineUsers.find(user => user.username === data.user)
          .userId;
        if (socketId !== undefined) {
          io
            .to(socketId)
            .emit('invitation', {
              userCard: data.userCard,
              message: {
              html: `You have been Invited to play a game.<br/> Click on this <span class="invite-link"><a style="color: red;" href=${
                data.gameLink
              } target="_blank">link to join</a></span>`
            },
            });
        }
      }
    });


    socket.on('joinGame', (data) => {
      if (!allPlayers[socket.id]) {
        joinGame(socket, data);
      }
    });

    socket.on('joinNewGame', (data) => {
      exitGame(socket);
      joinGame(socket, data);
      console.log("SOCKET DATA", data)
    });

    socket.on('startGame', () => {
      if (allGames[socket.gameID]) {
        const thisGame = allGames[socket.gameID];
        console.log(
          'comparing', thisGame.players[0].socket.id,
          'with', socket.id
        );
        if (thisGame.players.length >= thisGame.playerMinLimit) {
          gamesNeedingPlayers.forEach((game, index) => {
            if (game.gameID === socket.gameID) {
              return gamesNeedingPlayers.splice(index, 1);
            }
          });
          thisGame.prepareGame();
          thisGame.sendNotification('The game has begun!');
        }
      }
    });

    socket.on('leaveGame', (data) => {
      io.sockets.emit('connectedUsers', (data));
      exitGame(socket);
    });

    socket.on('disconnect', () => {
      exitGame(socket);
    });

    socket.on('pickBlackCards', () => {
      allGames[socket.gameID].continue(allGames[socket.gameID]);
    });
  });

  const joinGame = function (socket, data) {
    const player = new Player(socket);
    data = data || {};
    player.userID = data.userID || 'unauthenticated';
    if (data.userID !== 'unauthenticated') {
      User.findOne({
        _id: data.userID
      }).exec((err, user) => {
        if (err) {
          console.log('err', err);
          return err; // Hopefully this never happens.
        }
        if (!user) {
          // If the user's ID isn't found (rare)
          player.username = 'Guest';
          player.avatar = avatars[Math.floor(Math.random() * 4) + 12];
        } else {
          player.username = user.username;
          player.premium = user.premium || 0;
          player.avatar = user.imageUrl ||
          avatars[Math.floor(Math.random() * 4) + 12];
        }
        getGame(player, socket, data.room, data.createPrivate);
      });
    } else {
      // If the user isn't authenticated (guest)
      player.username = 'Guest';
      player.avatar = avatars[Math.floor(Math.random() * 4) + 12];
      getGame(player, socket, data.room, data.createPrivate);
    }
  };

  const getGame = function (player, socket, requestedGameId, createPrivate) {
    requestedGameId = requestedGameId || '';
    createPrivate = createPrivate || false;
    console.log(socket.id, 'is requesting room', requestedGameId);
    if (requestedGameId.length && allGames[requestedGameId]) {
      console.log('Room', requestedGameId, 'is valid');
      const game = allGames[requestedGameId];
      // Ensure that the same socket doesn't try to join the same game
      // This can happen because we rewrite the browser's URL to reflect
      // the new game ID, causing the view to reload.
      // Also checking the number of players, so node doesn't crash when
      // no one is in this custom room.
      if (game.state === 'awaiting players' && (!game.players.length ||
        game.players[0].socket.id !== socket.id)) {
        // Put player into the requested game
        console.log('Allowing player to join', requestedGameId);
        allPlayers[socket.id] = true;
        game.players.push(player);
        socket.join(game.gameID);
        socket.gameID = game.gameID;
        game.assignPlayerColors();
        game.assignGuestNames();
        game.sendUpdate();
        game.sendNotification(`${player.username} has joined the game!`);
        if (game.players.length >= game.playerMaxLimit) {
          gamesNeedingPlayers.shift();
          game.prepareGame();
        }
      } else {
        //Send an error message back to this user saying the game has already started
        socket.to(socket.id).emit('complete');
      }
    } else {
      // Put players into the general queue
      console.log('Redirecting player', socket.id, 'to general queue');
      if (createPrivate) {
        createGameWithFriends(player, socket);
      } else {
        fireGame(player, socket);
      }
    }
  };

  const fireGame = function (player, socket) {
    let game;
    if (gamesNeedingPlayers.length <= 0) {
      gameID += 1 ;
      const gameIDStr = gameID.toString();
      game = new Game(gameIDStr, io);
      allPlayers[socket.id] = true;
      game.players.push(player);
      allGames[gameID] = game;
      gamesNeedingPlayers.push(game);
      socket.join(game.gameID);
      socket.gameID = game.gameID;
      console.log(socket.id, 'has joined newly created game', game.gameID);
      game.assignPlayerColors();
      game.assignGuestNames();
      game.sendUpdate();
    } else {
      game = gamesNeedingPlayers[0];
      allPlayers[socket.id] = true;
      game.players.push(player);
      console.log(socket.id, 'has joined game', game.gameID);
      socket.join(game.gameID);
      socket.gameID = game.gameID;
      game.assignPlayerColors();
      game.assignGuestNames();
      game.sendUpdate();
      game.sendNotification(`${player.username} has joined the game!`);
      if (game.players.length >= game.playerMaxLimit) {
        gamesNeedingPlayers.shift();
        game.prepareGame();
      }
    }
  };

  const createGameWithFriends = function (player, socket) {
    let isUniqueRoom = false;
    let uniqueRoom = '';
    // Generate a random 6-character game ID
    while (!isUniqueRoom) {
      uniqueRoom = '';
      for (let i = 0; i < 6; i++) {
        uniqueRoom += chars[Math.floor(Math.random() * chars.length)];
      }
      if (!allGames[uniqueRoom] && !(/^\d+$/).test(uniqueRoom)) {
        isUniqueRoom = true;
      }
    }
    console.log(socket.id, 'has created unique game', uniqueRoom);
    const game = new Game(uniqueRoom, io);
    allPlayers[socket.id] = true;
    game.players.push(player);
    allGames[uniqueRoom] = game;
    socket.join(game.gameID);
    socket.gameID = game.gameID;
    game.assignPlayerColors();
    game.assignGuestNames();
    game.sendUpdate();
  };

  const exitGame = function (socket) {
    console.log(socket.id, 'has disconnected');
    if (allGames[socket.gameID]) { // Make sure game exists
      const game = allGames[socket.gameID];
      console.log(socket.id, 'has left game', game.gameID);
      delete allPlayers[socket.id];
      if (game.state === 'awaiting players' ||
        game.players.length - 1 >= game.playerMinLimit) {
        game.removePlayer(socket.id);
      } else {
        game.stateDissolveGame();
        for (let j = 0; j < game.players.length; j++) {
          game.players[j].socket.leave(socket.gameID);
        }
        game.killGame();
        delete allGames[socket.gameID];
      }
    }
    socket.leave(socket.gameID);
  };
};
