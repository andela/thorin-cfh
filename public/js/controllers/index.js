/* eslint-disable */
angular.module('mean.system')
  .controller('IndexController', ['$scope', 'Global', '$http', '$q', '$location', 'socket', 'game', function ($scope, Global, $http, $q, $location, socket, game ) {
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
      console.log("SCOPE USER",$scope.user);
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
  }]);
