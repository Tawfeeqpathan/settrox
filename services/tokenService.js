const jwt = require('jsonwebtoken');
require('dotenv').config();
const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'yourAccessTokenSecret';
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY || 'yourRefreshTokenSecret';
const ACCESS_TOKEN_EXPIRATION = '15m';
const REFRESH_TOKEN_EXPIRATION = '7d';

exports.generateAccessToken = (payload) => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRATION });
};

exports.generateRefreshToken = (payload) => {
  return jwt.sign(payload, REFRESH_SECRET_KEY, { expiresIn: REFRESH_TOKEN_EXPIRATION });
};
