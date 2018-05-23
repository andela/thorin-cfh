/* eslint-disable */
angular.module('mean.system')
    .controller('dashboardController', ['$scope', 'Global', '$http', '$q', '$window',
        ($scope, Global, $http, $q, $window) => {
            $scope.global = Global;
            $scope.pageNumber = 1;
            $scope.pagination = null;
            $scope.leaderboardPage = 1;
            $scope.gameLogPage = 1;
            $scope.showGameOptions = false;

            const token = localStorage.getItem("card-game-token");

            $scope.getGameLog = (page) => {
                $scope.showGameLog = true;
                $scope.showLeaderboard = false;
                $scope.showDonations = false;
                $scope.gameLogPage = page;

                $("#leader-board").removeClass("active-tab");
                $("#donation").removeClass("active-tab");
                $("#game-log").addClass("active-tab");

                $http({
                    method: 'GET',
                    url: `/api/games/history?page=${page}`,
                    headers: {
                        'Content-Type': 'application/json',
                        'card-game-token': `${token}`
                    }
                }).then(
                    (successResponse) => {
                        $scope.games = successResponse.data.games;
                        const logPagination = successResponse.data.pagination;
                        if ($scope.gameLogPage === 1) {
                            $scope.hidePrev = true;
                        } else {
                            $scope.hidePrev = false;
                        }
                        $scope.minPage = ($scope.gameLogPage - 1) * logPagination.limit + 1;
                        $scope.maxPage = ($scope.gameLogPage - 1) * logPagination.limit + logPagination.pageSize;
                        $scope.count = logPagination.dataCount;
                        $scope.logPages = [];
                        for (let i = 1; i <= logPagination.pageCount; i++) {
                            $scope.logPages.push(i);
                        }
                        if ($scope.gameLogPage === $scope.logPages.slice(-1)[0]) {
                            $scope.hideNext = true;
                        } else {
                            $scope.hideNext = false;
                        }
                    },
                    (failureResponse) => {
                        $scope.gameLogMessage = failureResponse;
                    }
                );
            }

            $scope.getLeaderboard = () => {
                $scope.showGameLog = false;
                $scope.showDonations = false;
                $scope.showLeaderboard = true;

                $("#game-log").removeClass("active-tab");
                $("#donation").removeClass("active-tab");
                $("#leader-board").addClass("active-tab");

                $http({
                    method: 'GET',
                    url: `/api/leaderboard`,
                    headers: {
                        'Content-Type': 'application/json',
                        'card-game-token': `${token}`
                    }
                }).then(
                    (successResponse) => {
                        $scope.leaderboard = successResponse.data.leaderboard;
                    },
                    (failureResponse) => {
                        $scope.leaderboardMessage = failureResponse;
                    }
                );
            }

            $scope.getDonations = () => {
                $scope.showGameLog = false;
                $scope.showLeaderboard = false;
                $scope.showDonations = true;

                $("#game-log").removeClass("active-tab");
                $("#leader-board").removeClass("active-tab");
                $("#donation").addClass("active-tab");
                $http({
                    method: 'GET',
                    url: `/api/donations?page=${$scope.pageNumber}`,
                    headers: {
                        'Content-Type': 'application/json',
                        'card-game-token': `${token}`
                    }
                }).then(
                    (successResponse) => {
                        if (successResponse.data.userDonations.length === 0) {
                            $scope.noDonations = true;
                        } else {
                            $scope.noDonations = false;
                            $scope.donations = successResponse.data.userDonations;
                        }
                    },
                    (failureResponse) => {
                        $scope.donationsMessage = failureResponse;
                    }
                );
            }

            $scope.toggleGameOptions = () => {
                $scope.showGameOptions = !$scope.showGameOptions;
            }

            $window.onload = $scope.getGameLog($scope.gameLogPage);
        }]);
