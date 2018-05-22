
import gameModel from '../models/game';
import Helper from '../helpers/index';

/**
 * class Game - Represents a game
 */
class Game {
  /**
   * Save a game when it ends
   *
   * @param {object} req - The HTTP request
   * @param {object} res - The HTTP response
   * @returns {void}
  */
  static saveGame(req, res) {
    const {
      players, winner, gameStarter, roundsPlayed,
    } = req.body;
    const gameID = req.params.id;

    const gameEntry = new gameModel({
      players,
      gameID,
      winner,
      gameStarter,
      roundsPlayed,
    });

    gameEntry.save()
      .then((game) => {
        res.status('201').json({
          msg: 'Success, Game saved',
          game
        });
      })
      .catch((error) => {
        res.status('400').json({
          msg: 'Failure, Game not saved',
          error
        });
      });
  }

  /**
 * Get the history of games played
 *
 * @param {object} req - The HTTP request
 * @param {object} res - The HTTP response
 * @returns {void}
*/
  static gameHistory(req, res) {
    const { page, limit, offset } = Helper.setupPagination(req);
    gameModel.count()
      .then((count) => {
        const pagination = Helper.pagination(page, count, limit);
        gameModel.find((error, games) => {
          if (error) {
            return res.status(500).json({
              msg: 'Games History could not be retrieved',
              error
            });
          }
          pagination.pageSize = games.length;

          const gameLog = games.map(game => ({
            game,
            playersNames: Helper.getPlayers(game.players)
          }));

          return res.status(200).json({
            message: 'Games have been successfully retrieved',
            games: gameLog,
            pagination
          });
        }).skip(offset).limit(+limit);
      }).catch(error => res.status(500).json({
        message: 'Games History could not be retrieved',
        error
      }));
  }

  /**
 * Get the leaderboard for the game
 *
 * @param {object} req - The HTTP request
 * @param {object} res - The HTTP response
 * @returns {void}
*/
  static gameLeaderboard(req, res) {
    gameModel.find(
      {}, 'gameID winner roundsPlayed, playedAt -_id',
      (err, games) => {
        if (err) {
          return res.status(500).json({
            message: 'Leaderboard could not be gotten',
            err
          });
        }
        const groupedBoard = Helper.groupByWinner(games, 'winner');
        const leaderboard = Helper.sortLeaderboard(groupedBoard);

        return res.status(200).json({
          message: 'Leaderboard successfully retrieved',
          leaderboard
        });
      }
    );
  }
}

export default Game;
