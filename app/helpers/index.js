/**
 * Class Helper Contains helper functions
 */
export default class Helper {
  /**
       * Group Games by their winners
       * @param {Array} gamesArray - All games played
       * @param {String} winner - The game winner
       * @returns {Object} - The grouped leaderboard
       */
  static groupByWinner(gamesArray, winner) {
    const grouped = gamesArray.reduce((acc, obj) => {
      const key = obj[winner];
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(obj);
      return acc;
    }, {});
    return grouped;
  }

  /**
       * Sort the leaderboard to start with top winners
       * @param {Object} obj - The leaderboard object
       * @returns {Object} - The sorted leaderboard
       */
  static sortLeaderboard(obj) {
    const sortable = Object.keys(obj).map(arrayKey => obj[arrayKey]);
    sortable.sort((a, b) => {
      let comparison = 0;
      if (b.length > a.length) {
        comparison = 1;
      } else if (b.length < a.length) {
        comparison = -1;
      }
      return comparison;
    });
    const leaderBoard = sortable.reduce((acc, item) => {
      const key = item[0].winner;
      acc[key] = item;
      return acc;
    }, {});
    return leaderBoard;
  }

  /**
       * Calculate the donations for a user
       * @param {Array} donations - The user's donations
       * @returns {String} - The sum of donations
       */
  static calculateDonation(donations) {
    const donationSum = donations.reduce((acc, donation) => {
      const amount = parseInt(donation.amount.split('$')[1], 10);
      acc += amount;
      return acc;
    }, 0);
    return `$${donationSum}`;
  }

  /**
       * Get usernames of players
       * @param {Array} players - The game players
       * @returns {Array} - The array of player usernames
       */
  static getPlayers(players) {
    const playersNames = players.reduce((acc, player) => {
      acc.push(player.username);
      return acc;
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

