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

//     window.onload = () => {
//       connectPeople();
//       $scope.userGames()
//     };

    connectPeople = () => {
      console.log('This function sets the user online');
      socket.emit('connectedUser', $scope.global.user.username);
    };
    $window.onload = connectPeople();

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
      if (result.includes(window.user.username)) {
        const index = result.indexOf(window.user.username);
        if (index < 0) {
          result.splice(0, 1);
        }
        result.splice(index, 1);
      }
      $scope.users = result;
    });

    $scope.addInvitee = (selectedUser) => {
      if (
        selectedUser != undefined &&
        selectedUser !== $scope.global.user.username
      ) {
        const gameLink = $location.$$absUrl;
        const messageData = {
          gameLink,
          user: selectedUser
        };
        socket.emit('invitePlayer', messageData);
      }
    };

    socket.on('invitation', message => {
      messageArray.push(message);
      $scope.notifications = messageArray;
      $scope.messageLength = messageArray.length;
    });

    $scope.inviteTab = false;
    $scope.playerTab = true;
    $scope.inviteModal = false;
    $scope.showPlayerTab = () => {
      $scope.inviteTab = false;
      $scope.playerTab = true;
    };

    $scope.showInviteTab = () => {
      if (window.user) {
        $scope.inviteTab = true;
        $scope.playerTab = false;
      }
      $scope.inviteModal = true;
    };

    $scope.userGames = () => {
      useGames();
    };

    $scope.abandonGame = function () {
      window.location = '/'; //eslint-disable-line
    };
  }
]);
