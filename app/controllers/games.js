import gameModel from '../models/game';

const saveGame = (req, res) => {
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
};

export default saveGame;
