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
          localStorage.setItem('tour', false);
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
                    localStorage.setItem('tour', true);
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
      $scope.userGames()
    };

    $scope.userGames = () => {
      useGames();
    };

    $scope.abandonGame = function () {
      if ($scope.global.user) {
        socket.emit('connectedUser', $scope.global.user.username);
      }
      window.location = '/';
    };

    const useGames = () => {
      let userGameDetails = [];
      const username = window.user.username;
      const token = localStorage.getItem('card-game-token');
      axios.get(`/api/profile/${username}`, {
        headers: {"card-game-token": token} 
      })
        .then((res) => {
          if(res.data.message){
            $scope.global.message = res.data.message;
          }else{
            console.log($scope.global.user);
            $scope.global.userGameInfo = res.data.games;
            $scope.global.pointsWon = res.data.point;
          }
        })
        .catch((error) => {
          $scope.global.error= error.data;
        })
      if (window.user === null) {
        localStorage.setItem('tour', true);
      }
    };
  }
]);
