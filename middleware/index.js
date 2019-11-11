let jwt = require('jsonwebtoken');

// get token from x-access-token or authorization in headers
// see if it starts with 'Bearer' then slice it off starting at index 7

// if there's a token then verify using the token and secret key, options are err and decoded
// if there's an err return json with success false, invalid token message
// otherwise set req.decoded to be decoded

// if there's no token return json with success false and no token message

const checkToken = (req, res, next) => {
  let token = req.headers['x-access-token'] || req.headers['authorization'];
  console.log("========token in the BE==========", token)
  // Remove Bearer from string
  if (token && token.startsWith('Bearer')) {
    token = token.slice(7, token.length);
  }

  if (token) {
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        })
      } else {
        req.decoded = decoded;
        next();
      }
    })
  } else {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    })
  }
}

const unknownEndpoint = (req, res) => {
  res.status(404).send({  error: 'unknown endpoint' });
};

module.exports = {
  checkToken,
  unknownEndpoint
}