const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
  
    if (token == null) {
        req.user = null;
    }
  
    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
    
      req.user = {
        userId: user.sub,
        username: user.username,
        isAdmin: user.admin || false, // Assuming 'admin' is a property in the user object
      };
    
      next();
    });
  }

  module.exports = authenticateToken;