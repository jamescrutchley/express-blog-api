const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();


//auth middleware logic:
// no token - mark req.user as null
// invalid/expired token - mark req.user as null
// valid token - set user fields
// proceed

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    req.user = null;
  }

  // if (token == null || req.user === null) {
  //     return next(); // Proceed to the next middleware without attempting to verify the token
  // }

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) {
      req.user = null; // Set req.user to null if there's an error during token verification
      return next(); // Proceed to the next middleware without triggering an error response
    }

    req.user = {
      userId: user.sub,
      username: user.username,
      isAdmin: user.admin || false, 
    };

    next();
  });
}

module.exports = authenticateToken;
