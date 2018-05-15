/* eslint-disable */
angular.module('mean.system').controller('IndexController', [
  '$scope',
  'Global',
  '$http',
  '$q',
  '$location',
  'socket',
  'game',
  ($scope, Global, $http, $q, $location, socket, game) => {
    $scope.global = Global;

    let messageArray = [];

    $scope.playAsGuest = function() {
      game.joinGame();
      $location.path('/app');
    };

    window.onload = () => {
      connectPeople();
    };

    connectPeople = () => {
      socket.emit('connectedUser', $scope.global.user.username);
    };

    $scope.removeUserOnline = () => {
      socket.emit('removeUser', $scope.global.user.username);
    }
    $scope.showError = function() {
      if ($location.search().error) {
        return $location.search().error;
      }
      return false;
    };

    $scope.login = () => {
      return $q.all([$http.post('/api/auth/login', $scope.user)]).then(
        successResponse => {
          $scope.global.authenticated = true;
          $scope.global.user = successResponse[0].data.data.user;
          localStorage.setItem(
            'card-game-token',
            successResponse[0].data.data.token
          );
          window.user = successResponse[0].data.data.user;
          $location.path('/');
          socket.emit('connectedUser', window.user.username);
        },
        errorResponse => {
          $scope.global.authenticated = false;
          $scope.global.user = null;
          $scope.error = 'Invaild Email or Password';
        }
      );
    };

    const progressBar = data => {
      let elem = (document.getElementById('move').style.width = data);
    };

    $scope.submit = () => {
      const file = document.getElementById('file').files[0];
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', 'cghgame');
      $http.post('/api/auth/checkuser', $scope.user).then(
        res => {
          if (res.status === 200) {
            axios
              .post(
                'https://api.cloudinary.com/v1_1/skybound/image/upload',
                fd,
                {
                  onUploadProgress: progressEvent => {
                    const level = `${Math.round(
                      progressEvent.loaded / progressEvent.total * 100
                    )}%`;
                    $scope.progress = level;
                    progressBar($scope.progress);
                  }
                }
              )
              .then(res => {
                $scope.user.imageUrl = res.data.secure_url;
                $scope.user.publicId = res.data.public_id;
                $http.post('/api/auth/signup', $scope.user).then(
                  res => {
                    $scope.data = res.data;
                    $scope.global.authenticated = true;
                    $scope.global.user = $scope.data.user;
                    localStorage.setItem('card-game-token', $scope.data.token);
                    window.user = $scope.data.user;
                    $location.path('/');
                    socket.emit('connectedUser', window.user.username);
                  },
                  error => {
                    $scope.error = error.data;
                    $scope.global.authenticated = false;
                    $scope.global.user = null;
                    window.user = null;
                    $scope.error = error.data.message;
                  }
                );
              })
              .catch(err => {
                $scope.error = 'Unable to upload. Check your internet';
              });
          }
        },
        error => {
          $scope.error = error.data.error.toString();
        }
      );
    };

    $scope.imageUpload = event => {
      let files = event.target.files;
      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        const reader = new FileReader();
        reader.onload = $scope.imageIsLoaded;
        reader.readAsDataURL(file);
      }
    };

    $scope.imageIsLoaded = e => {
      $scope.$apply(() => {
        $scope.img = e.target.result;
      });
    };

    $scope.disableSubmit = () => {
      document.getElementById('submit').disabled = true;
      function activateButton(element) {
        if (element.checked) {
          document.getElementById('submit').disabled = false;
        } else {
          document.getElementById('submit').disabled = true;
        }
      }
    };

    $scope.selected = undefined;

    socket.on('people', clients => {
      const result = clients.map(value => value.username);
      $scope.users = result;
    });

    $scope.addInvitee = () => {
      if ($scope.selected != undefined && $scope.selected !== $scope.global.user.username) {
        const gameLink = $location.$$absUrl;
        const messageData = {
          gameLink,
          user: $scope.selected
        };
        socket.emit('invitePlayer', messageData);
      }
    };

    socket.on('invitation', message => {
      messageArray.push(message);
      $scope.notifications = messageArray;
      $scope.messageLength = messageArray.length;
    });

    window.onload = () => {
      useGames();
    };

    $scope.userGames = () => {
      useGames();
    };

    const useGames = () => {
      let userGameDetails = [];
      if (window.user !== null) {
        $http.get('/api/usergames').then((res) => {
          if (res.data.code === 200) {
            userGameDetails = res.data.data
              .map(value => {
                return {
                  gameId: value.gameID,
                  playedAt: value.playedAt,
                  userGame: value.players
                    .map(value => {
                      return { username: value.username, points: value.points };
                    })
                    .filter(
                      user => user.username === $scope.global.user.username
                    )
                };
              })
              .filter(user => user.userGame.length > 0);

            pointsWon = userGameDetails
              .reduce((list, point) => {
                return list.concat(point.userGame[0]);
              }, [])
              .reduce((points, point) => {
                return points + point.points;
              }, 0);

            $scope.global.userGameInfo = userGameDetails;
            $scope.global.pointsWon = pointsWon;
          }
        });
      }
    };
  }
]);
