import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key-change-this-in-production';
const JWT_EXPIRATION = '1d'; // Token expiration time

export const jwttoken = {
  sign: (payload) => {
    try {
      return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
    } catch (error) {
      console.error('failed to authenticate token:', error);
      throw new Error('Failed to authenticate token');
    }
  },

  verify: (token) => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      console.error('failed to authenticate token:', error);
      throw new Error('Failed to authenticate token');
    }
  },
};