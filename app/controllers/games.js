import gameModel from '../models/game';

/**
 *
 * @param {object} req - The HTTP request
 * @param {object} res - The HTTP response
 * @returns {void}
 */
const saveGame = (req, res) => {
  const {
    players, winner, gameStarter, roundsPlayed, _id
  } = req.body;
  const gameID = req.params.id;
  const gameEntry = new gameModel({
    players,
    gameID,
    winner,
    gameStarter,
    roundsPlayed,
    _id
  });

  gameEntry
    .save()
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
};

export default saveGame;
