

/** Class Validate. */
class Validate {
  /**
   * verify the validateSigup body
   *
   * @param {Object} req HTTP request object
   * @param {Object} res HTTP response object
   *  @param {Object} next HTTP response object
   *
   * @returns {void}
   */
  static Signup(req, res, next) {
    // check input to see if user
    // filled the correct inforamtion for signup route
    req.sanitizeBody('username');
    req.checkBody(
      'username',
      'You must supply a username!'
    )
      .notEmpty();
    req.checkBody(
      'email',
      'That Email is not valid!'
    )
      .isEmail();
    req.sanitizeBody('email')
      .normalizeEmail({
        remove_dots: false,
        remove_extension: false,
        gmail_remove_subaddress: false
      });
    req.checkBody(
      'password',
      'Password Cannot be Blank!'
    )
      .notEmpty();
    req.checkBody(
      'imageUr',
      'Oops! You have to upload an image'
    );
    const errors = req.validationErrors();
    if (errors) {
      const errorMessage = errors.map(err => err.msg);
      res.status(400).json({
        message: 'Signup Errors',
        errorMessage
      });
      return; // stop the fn from running
    }
    next(); // there were no errors!
  }

  /**
   * verify the game data
   *
   * @param {Object} req HTTP request object
   * @param {Object} res HTTP response object
   *  @param {Object} next HTTP response object
   *
   * @returns {void}
   */
  static gameValidation(req, res, next) {
    // Check if all fields are present in the game data
    req.checkBody('players', 'players must be an array').isArray().notEmpty();
    req.checkBody('winner', 'winner must be a string').isString();
    req.checkBody('roundsPlayed', 'roundsPlayed must be an integer').isInt();
    req.checkBody('gameStarter', 'gameStarter must be a string').isString();

    const results = req.validationErrors();

    if (results) {
      const errors = [];
      results.map(result => errors.push(result.msg));
      return res.status(400).json({
        message: 'Failure, Game not saved',
        errors
      });
    }
    next();
  }
}


export default Validate;
