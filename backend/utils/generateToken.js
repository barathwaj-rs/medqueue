const jwt = require("jsonwebtoken");

function generateToken(userId) {
  const payload = { id: userId };
  const secret = process.env.JWT_SECRET;
  const options = { expiresIn: "30d" };

  return jwt.sign(payload, secret, options);
}

module.exports = generateToken;
