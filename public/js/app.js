angular
  .module('mean', [
    'ngCookies',
    'ngResource',
    'ui.bootstrap',
    'ui.route',
    'mean.system',
    'mean.directives'
  ])
  .config([
    '$routeProvider',
    function ($routeProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'views/index.html'
        })
        .when('/app', {
          templateUrl: '/views/app.html'
        })
        .when('/privacy', {
          templateUrl: '/views/privacy.html'
        })
        .when('/bottom', {
          templateUrl: '/views/bottom.html'
        })
        .when('/signin', {
          templateUrl: '/views/signin.html'
        })
        .when('/signup', {
          templateUrl: '/views/signup.html'
        })
        .when('/profile', {
          templateUrl: '/views/profile.html',
          controller: 'IndexController',
          authenticated: true
        })
        .when('/choose-avatar', {
          templateUrl: '/views/choose-avatar.html'
        })
        .otherwise({
          redirectTo: '/'
        });
    }
  ])
  .config([
    '$locationProvider',
    function ($locationProvider) {
      $locationProvider.hashPrefix('!');
    }
  ])
  .run([
    '$rootScope',
    function ($rootScope) {
      $rootScope.safeApply = function (fn) {
        const phase = this.$root.$$phase;
        if (phase === '$apply' || phase === '$digest') {
          if (fn && typeof fn === 'function') {
            fn();
          }
        } else {
          this.$apply(fn);
        }
      };
    }
  ])
  .run([ /* eslint no-undef: "off" */
    'DonationService',
    function (DonationService) {
      window.userDonationCb = function (donationObject) {
        DonationService.userDonated(donationObject);
      };
    }
  ])
  .run([
    '$rootScope',
    '$location',
    function ($rootScope, $location) {
      $rootScope.$on('$routeChangeStart', (event, next, current) => {
        if (next.$$route.authenticated) {
          const userAuth = localStorage.getItem('card-game-token');
          if (!userAuth) {
            $location.path('/');
          }
        }
      });
    }
  ]);

angular.module('mean.system', []);
angular.module('mean.directives', []);
