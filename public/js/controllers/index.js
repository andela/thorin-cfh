/* eslint-disable */
angular.module('mean.system')
  .controller('IndexController', ['$scope', 'Global', '$http', '$q', '$location', 'socket', 'game', 
 ($scope, Global, $http, $q, $location, socket, game ) => {
    $scope.global = Global;

    $scope.playAsGuest = function () {
      game.joinGame();
      $location.path('/app');
    };

    $scope.showError = function () {
      if ($location.search().error) {
        return $location.search().error;
      }
      return false;
    };

    $scope.login = () => {
      //console.log("SCOPE USER",$scope.user);
      return $q.all([
        $http.post('/api/auth/login', $scope.user)
      ])
        .then((successResponse) => {
          $scope.global.authenticated = true;
          $scope.global.user = successResponse[0].data.data.user;
          localStorage.setItem('card-game-token', successResponse[0].data.data.token);
          window.user = successResponse[0].data.data.user;
          $location.path('/');
        }, (errorResponse) => { 
          $scope.global.authenticated = false;
          $scope.global.user = null;
          window.location = '/#!/signin?error=invalid';
        });
    };


    $scope.submit = () => {
      const file = document.getElementById('imageUr').files[0];
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', 'cghgame');
      $http.post('/api/auth/checkuser', $scope.user)
      .then((res) => { 
        //console.log(res.status)
        if (res.status === 200) {
            axios
            .post(
              'https://api.cloudinary.com/v1_1/skybound/image/upload',
              fd
            )
            .then((res) => {
              $scope.user.imageUrl = res.data.secure_url;
              $scope.user.publicId = res.data.public_id;
              //console.log($scope.user);
              $http.post('/api/auth/signup', $scope.user)
                .then(
                  (res) => {
                    $scope.data = res.data;
                    $scope.global.authenticated = true;
                    $scope.global.user = $scope.data.user;
                    localStorage.setItem('card-game-token', $scope.data.token);
                    window.user = $scope.data.user;
                    $location.path('/');
                  },
                  (error) => {
                    $scope.error = error.data;
                    $scope.global.authenticated = false;
                    $scope.global.user = null;
                    window.user = null;
                    window.location = '/#!/signup?error=invalid';
                    alert(error.data.message)
                  }
                );
            })
            .catch((err) => {
              alert('Unable to upload. Check your internet', err);
            });
          }
      },(error) =>  { 
        $scope.error = error.data.error

      })

    };    



    $scope.imageUpload = function (event) {
      var files = event.target.files;
      for (var i = 0; i < files.length; i++) {
          var file = files[i];
          var reader = new FileReader();
          reader.onload = $scope.imageIsLoaded;
          reader.readAsDataURL(file);
      }
  }

  $scope.imageIsLoaded = function (e) {
      $scope.$apply(function () {
          $scope.img = e.target.result;            
      });
  }




  }]);