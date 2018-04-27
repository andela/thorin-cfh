/* eslint-disable */
if (window.location.hash == '#_=_') window.location.hash = '#!';

// Decode token to determine if user is logged in and token hasn't expired
const token = localStorage.getItem('card-game-token');
const checkAuthenticationStatus = (token) => {
  const decoded = jwt_decode(token);
  try {
    const timeLeft = decoded.exp - (Date.now() / 1000);
    if (timeLeft <= 0) {
      // token has expired, user isn't logged in
      return localStorage.setItem('card-game-token', '');
    }
  } catch (e) {
    // error in decoding token, user isn't logged in
    return localStorage.setItem('card-game-token', '');
  }
  window.user = decoded.user;

  if (window.location.pathname === "/auth/google/callback"
    || window.location.pathname === "/auth/facebook/callback"
    || window.location.pathname === "/auth/twitter/callback"
    || window.location.pathname === "/auth/github/callback"){
    window.location = '/';
  }
  
};

checkAuthenticationStatus(token);