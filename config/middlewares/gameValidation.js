const gameValidation = (req, res, next) => {
  req.checkBody('players', 'players must be an array').isArray().notEmpty();
  req.checkBody('winner', 'winner must be a string').isString();
  req.checkBody('roundsPlayed', 'roundsPlayed must be an integer').isInt();
  req.checkBody('gameStarter', 'gameStarter must be a string').isString();

  const results = req.validationErrors();

  if (results) {
    const errors = [];
    results.map(result => errors.push(result.msg));
    return res.status(400).json({
      msg: 'Failure, Game not saved',
      errors
    });
  }
  next();
};

export default gameValidation;
