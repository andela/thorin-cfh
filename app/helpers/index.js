/**
 * Class Helper Contains helper functions
 */
export default class Helper {
  /**
       * Group Games by their winners
       * @param {Array} games - All games played
       * @param {String} winner - The game winner
       * @returns {Object} - The grouped leaderboard
       */
  static groupByWinner(games, winner) {
    const grouped = games.reduce((groupedGame, game) => {
      const key = game[winner];
      if (!groupedGame[key]) {
        groupedGame[key] = [];
      }
      groupedGame[key].push(game);
      return groupedGame;
    }, {});
    return grouped;
  }

  /**
       * Sort the leaderboard to start with top winners
       * @param {Object} board - The leaderboard object
       * @returns {Object} - The sorted leaderboard
       */
  static sortLeaderboard(board) {
    const sortableBoard = Object.keys(board).map(key => board[key]);
    sortableBoard.sort((firstItem, secondItem) => {
      let comparison = 0;
      if (secondItem.length > firstItem.length) {
        comparison = 1;
      } else if (secondItem.length < firstItem.length) {
        comparison = -1;
      }
      return comparison;
    });
    const leaderBoard = sortableBoard.reduce((finalBoard, item) => {
      const key = item[0].winner;
      finalBoard[key] = item;
      return finalBoard;
    }, {});
    return leaderBoard;
  }

  /**
       * Calculate the donations for a user
       * @param {Array} allDonations - The user's donations
       * @returns {String} - The sum of donations
       */
  static calculateDonation(allDonations) {
    const donationSum = allDonations.reduce((donations, donation) => {
      const amount = parseInt(donation.amount.split('$')[1], 10);
      donations += amount;
      return donations;
    }, 0);
    return `$${donationSum}`;
  }

  /**
       * Get usernames of players
       * @param {Array} players - The game players
       * @returns {Array} - The array of player usernames
       */
  static getPlayersNames(players) {
    const playersNames = players.reduce((allPlayers, player) => {
      allPlayers.push(player.username);
      return allPlayers;
    }, []);
    return playersNames;
  }
  /**
       * Set up pagination variables
       * @param {Object} req - The HTTP response
       * @returns {Object} - The setup
       */
  static setupPagination(req) {
    const setup = {};
    setup.page = req.query.page > 0 ? req.query.page : 1;
    setup.limit = req.query.limit > 0 ? req.query.limit : 10;
    setup.offset = (setup.page - 1) * setup.limit;
    return setup;
  }

  /**
       * Pagination
       * @param {Number} page - The current page
       * @param {Number} count - The total number of data
       * @param {Number} limit - The data limit for each page
       * @returns {Object} - The pagination object
       */
  static pagination(page, count, limit) {
    const pagination = {};
    pagination.dataCount = count;
    pagination.page = page;
    pagination.pageCount = Math.ceil(count / limit);
    pagination.limit = limit;
    return pagination;
  }
}

