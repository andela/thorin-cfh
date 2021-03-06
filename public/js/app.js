/*eslint-disable */
angular.module('mean', ['ngSanitize', 'ngAnimate', 'ngCookies', 'ngResource', 'ui.bootstrap',
'ngRoute', 'firebase', 'mean.system', 'mean.directives'])
  .config(['$routeProvider',
      function($routeProvider) {
          $routeProvider.
          when('/', {
            templateUrl: 'views/index.html'
          }).
          when('/app', {
            templateUrl: '/views/app.html',
          }).
          when('/privacy', {
            templateUrl: '/views/privacy.html',
          }).
          when('/bottom', {
            templateUrl: '/views/bottom.html'
          }).
          when('/signin', {
            templateUrl: '/views/signin.html'
          }).
          when('/signup', {
            templateUrl: '/views/signup.html'
          }).
          when('/profile', {
          templateUrl: '/views/profile.html',
          authenticated: true
        }).
        when('/dashboard', {
          templateUrl: '/views/dashboard.html'
        }).when('/choose-avatar', {
            templateUrl: '/views/choose-avatar.html'
          })
          .when('/profile', {
          templateUrl: '/views/profile.html',
          authenticated: true
        }).
        when('/team', {
          templateUrl: 'views/team.html'
        }).
          otherwise({
            redirectTo: '/'
          });
      }
  ]).config(['$locationProvider',
    function($locationProvider) {
        $locationProvider.hashPrefix("!");
    }
  ]).run(['$rootScope', function($rootScope) {
  $rootScope.safeApply = function(fn) {
    var phase = this.$root.$$phase;
    if(phase == '$apply' || phase == '$digest') {
        if(fn && (typeof(fn) === 'function')) {
            fn();
        }
    } else {
        this.$apply(fn);
      }
    };
  }]).run(['DonationService', function (DonationService) {
    window.userDonationCb = function (donationObject) {
      DonationService.userDonated(donationObject);
    };
  }]);

angular.module('mean.system', []);
angular.module('mean.directives', []);
