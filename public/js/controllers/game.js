angular //eslint-disable-line
  .module('mean.system')
  .controller('GameController', [
    '$scope',
    'game',
    'Global',
    '$timeout',
    '$location',
    'MakeAWishFactsService',
    '$dialog',
    '$http',
    'socket',
    '$firebaseArray',
    function (
      $scope,
      game,
      Global,
      $timeout,
      $location,
      MakeAWishFactsService,
      $dialog,
      $http,
      socket,
      $firebaseArray
    ) {
      $scope.global = Global;
      $scope.hasPickedCards = false;
      $scope.winningCardPicked = false;
      $scope.showTable = false;
      $scope.showGameModal = true;
      $scope.modalShown = false;
      $scope.game = game;

      // Get email address from search box
      $scope.getUserEmail = function (user) {
        return user.email;
      };
      $scope.userInfo = {};
      $scope.messageInvite = '';

      $scope.resetForm = () => {
        $scope.user = {};
      };

      // Make request to sever if email is valid
      $scope.getUserInfo = (user, searchForm) => {
        if (searchForm.$dirty) {
          $scope.resetForm();
          $http({
            method: 'POST',
            url: '/api/search/users',
            data: {
              email: $scope.getUserEmail(user)
            }
          }).then((response) => {
            $scope.userInfo = response.data;
            game.message = $scope.userInfo.message;
          }, error => error);
        }
        return null;
      };

      // Send invite to users that have signed up
      $scope.sendGameInvite = () => {
        if (game.message === 'User successfully found') {
          $http({
            method: 'POST',
            url: '/api/mailer',
            data: {
              link: $location.$$absUrl,
              email: $scope.userInfo.user.email
            }
          }).then((response) => {
            game.message = '';
            $scope.messageInvite = response.data.message;
            game.inviteMessage = $scope.messageInvite;
            $timeout(() => {
              game.inviteMessage = '';
            }, 3000);
          }, error => error);
        } else {
          game.message = '';
        }
      };

      // Function to close modal
      $scope.closeModal = () => {
        game.message = '';
      };

      $scope.pickedCards = [];
      let makeAWishFacts = MakeAWishFactsService.getMakeAWishFacts();
      $scope.makeAWishFact = makeAWishFacts.pop();

      $scope.pickCard = function (card) {
        if (!$scope.hasPickedCards) {
          if ($scope.pickedCards.indexOf(card.id) < 0) {
            $scope.pickedCards.push(card.id);
            if (game.curQuestion.numAnswers === 1) {
              $scope.sendPickedCards();
              $scope.hasPickedCards = true;
            } else if (
              game.curQuestion.numAnswers === 2 &&
              $scope.pickedCards.length === 2
            ) {
              // delay and send
              $scope.hasPickedCards = true;
              $timeout($scope.sendPickedCards, 300);
            }
          } else {
            $scope.pickedCards.pop();
          }
        }
      };

      $scope.pointerCursorStyle = function () {
        if (
          $scope.isCzar() &&
          $scope.game.state === 'waiting for czar to decide'
        ) {
          return { cursor: 'pointer' };
        }
        return {};
      };

      $scope.showAppModal = true;

      $scope.sendPickedCards = function () {
        game.pickCards($scope.pickedCards);
        $scope.showTable = true;
      };

      $scope.cardIsFirstSelected = function (card) {
        if (game.curQuestion.numAnswers > 1) {
          return card === $scope.pickedCards[0];
        }
        return false;
      };

      $scope.cardIsSecondSelected = function (card) {
        if (game.curQuestion.numAnswers > 1) {
          return card === $scope.pickedCards[1];
        }
        return false;
      };

      $scope.firstAnswer = ($index) => {
        if ($index % 2 === 0 && game.curQuestion.numAnswers > 1) {
          return true;
        }
        return false;
      };

      $scope.secondAnswer = function ($index) {
        if ($index % 2 === 1 && game.curQuestion.numAnswers > 1) {
          return true;
        }
        return false;
      };

      $scope.showFirst = function (card) {
        return (
          game.curQuestion.numAnswers > 1 && $scope.pickedCards[0] === card.id
        );
      };

      $scope.showSecond = function (card) {
        return (
          game.curQuestion.numAnswers > 1 && $scope.pickedCards[1] === card.id
        );
      };

      $scope.isCzar = function () {
        return game.czar === game.playerIndex;
      };

      $scope.isPlayer = function ($index) {
        return $index === game.playerIndex;
      };

      $scope.isCustomGame = function () {
        return !/^\d+$/.test(game.gameID) && game.state === 'awaiting players';
      };

      $scope.isPremium = function ($index) {
        return game.players[$index].premium;
      };

      $scope.currentCzar = function ($index) {
        return $index === game.czar;
      };

      $scope.winningColor = function ($index) {
        if (game.winningCardPlayer !== -1 && $index === game.winningCard) {
          return $scope.colors[game.players[game.winningCardPlayer].color];
        }
        return '#f9f9f9';
      };

      $scope.pickWinning = function (winningSet) {
        if ($scope.isCzar()) {
          game.pickWinning(winningSet.card[0]);
          $scope.winningCardPicked = true;
        }
      };

      $scope.winnerPicked = function () {
        return game.winningCard !== -1;
      };


      $scope.$watch('game.state', () => {
        if (!$scope.isCzar() && game.state === 'black card') {
          $scope.waitingForCzarToPick = 'Wait! The Czar is picking a card';
        } else {
          $scope.waitingForCzarToPick = '';
        }
      });


      $scope.continue = () => {
        if ($scope.isCzar()) {
          game.continue();
        }
      };


      $scope.cardMixer = () => {
        if ($scope.isCzar() && game.state === 'black card') {
          document.querySelector('#myCard').classList.toggle('flip');
          $timeout(() => {
            document.querySelector('#myCard').classList.toggle('flip');
            $scope.continue();
          }, 2000);
        }
      };

      $scope.startGame = function () {
        game.startGame();
      };

      $scope.abandonGame = function () {
        if ($scope.global.user) {
          socket.emit('connectedUser', $scope.global.user.username);
        }
        window.location = '/'; //eslint-disable-line
      };

      // Catches changes to round to update when no players pick card
      // (because game.state remains the same)
      $scope.$watch('game.round', () => {
        $scope.hasPickedCards = false;
        $scope.showTable = false;
        $scope.winningCardPicked = false;
        $scope.makeAWishFact = makeAWishFacts.pop();
        if (!makeAWishFacts.length) {
          makeAWishFacts = MakeAWishFactsService.getMakeAWishFacts();
        }
        $scope.pickedCards = [];
      });

      // In case player doesn't pick a card in time, show the table
      $scope.$watch('game.state', () => {
        if (
          game.state === 'waiting for czar to decide' &&
          $scope.showTable === false
        ) {
          $scope.showTable = true;
        }

        // Check if game has ended and save the game data
        if (game.state === 'game ended' && game.playerIndex === 0) {
          const {
            players, gameID, gameWinner, round
          } = game;
          const gameStarter = players[0].username;
          const winner = players[gameWinner].username;
          const token = localStorage.getItem('card-game-token'); //eslint-disable-line

          $http({
            method: 'POST',
            url: `/api/games/${gameID}/start`,
            data: {
              players,
              winner,
              gameStarter,
              roundsPlayed: round
            },
            headers: {
              'Content-Type': 'application/json',
              'card-game-token': `${token}`
            }
          }).then(
            (successResponse) => {
              $scope.gameMessage = successResponse.data.msg;
            },
            (failureResponse) => {
              $scope.gameMessage = 'Game not saved';
            }
          );
        }
      });
      const chatContent = document.getElementById('chat-content'); //eslint-disable-line
      const startChatService = () => {
        const ref = firebase.database().ref().child('chats') //eslint-disable-line
          .child(`${game.gameID}`);
        $scope.chats = $firebaseArray(ref);
        $scope.chats.$watch((e) => {
          setTimeout(() => {
            if (e.event === 'child_added') {
              if (chatContent.scrollHeight > parseInt(window.getComputedStyle(chatContent).height.split('px')[0])) { //eslint-disable-line
                chatContent.scrollTop = chatContent.scrollHeight - parseInt(window.getComputedStyle(chatContent).height.split('px')[0]); //eslint-disable-line
              }
            }
          }, 300);
        });
      };

      $scope.resetForm = () => {
        $('#input').emojioneArea().data('emojioneArea').setText(''); //eslint-disable-line
      };

      $scope.$watch('game.gameID', function () { //eslint-disable-line
        if (game.gameID) {
          const chat = $('#input').emojioneArea({ //eslint-disable-line
            pickerPosition: 'top',
            placeholder: 'Type something here ...',
            events: {
              keydown: (editor, event) => {
                if (event.keyCode === 13) {
                  const message = chat.emojioneArea()
                    .data('emojioneArea').getText();
                  $scope.sendChatMessage(message);
                  $scope.resetForm();
                }
              }
            }
          });
          startChatService();
        }
        if (game.gameID && game.state === 'awaiting players') {
          if (!$scope.isCustomGame() && $location.search().game) {
            // If the player didn't successfully enter the request room,
            // reset the URL so they don't think they're in the requested room.
            $location.search({});
          } else if ($scope.isCustomGame() && !$location.search().game) {
            /*
          Once the game ID is set, update the URL
          if this is a game with friends,
          */
            // where the link is meant to be shared.
            $location.search({ game: game.gameID });
            if (!$scope.modalShown) {
              setTimeout(() => {
                //eslint-disable-line
                const link = document.URL; //eslint-disable-line
                const txt = 'Give the following link to your ' +
                  'friends so they can join your game: ';
                $('.how-to-play h1').css({ //eslint-disable-line
                  'font-size': '22px'
                }).text(txt); //eslint-disable-line
                $('.how-to-play p').css({ //eslint-disable-line
                  'text-align': 'center',
                  'font-size': '22px',
                  'background': 'white', //eslint-disable-line
                  'color': 'black' //eslint-disable-line
                }).text(link);
              }, 200);
              $scope.modalShown = true;
            }
          }
        }

        $scope.sendChatMessage = function (message) {
          if (message) {
            $scope.chats.$add({
              image: game.players[game.playerIndex].avatar,
              message,
              date: Date.now(),
              user: game.players[game.playerIndex].username
            });
            $scope.resetForm();
          }
        };
      });

      const tour = () => {
        const running = introJs();  // eslint-disable-line
        running.setOptions({
          showStepNumbers: true,
          disableInteraction: true,
          showBullets: true,
          skipLabel: 'Exit',
          showProgress: true,
          overlayOpacity: 2

        });
        const timeout = setTimeout(() => {
          running.start();
          clearTimeout(timeout);
        }, 500);
        localStorage.setItem('tour', false);  // eslint-disable-line
      };

      const runme = () => (localStorage.tour === 'true' ? tour() : null); // eslint-disable-line

      // Function hides modal on app.html page
      $scope.hideAppModal = () => {
        socket.emit('showOnlineUsers');
        $scope.showGameModal = false;
        if ($location.search().game && !/^\d+$/.test($location.search().game)) {
          console.log('joining custom game');
          game.joinGame('joinGame', $location.search().game);
          runme();
        } else if ($location.search().custom) {
          game.joinGame('joinGame', null, true);
          runme();
        } else {
          game.joinGame();
          runme();
        }
      };

      if (
        $location.search().game &&
        !/^\d+$/.test($location.search().game) !== undefined
      ) {
        game.usersOnline();
        $scope.showGameModal = false;
        game.joinGame('joinGame', $location.search().game);
      }

      $scope.startsme = () => tour();
    }]);
