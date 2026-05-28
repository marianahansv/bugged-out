/**
 * provides password hashing and password verification helpers for authentication.
 * this file contains the shared password security logic used by registration,
 * login, and demo data seeding.
 *
 * security features:
 * - generates a unique random salt for each password
 * - uses PBKDF2 hashing with SHA-512
 */

const crypto = require('crypto');
const HASH_ITERATIONS = 100000;

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, HASH_ITERATIONS, 64, 'sha512').toString('hex');
  return { salt, hash };
}

function verifyPassword(password, storedSalt, storedHash) {
  const hash = crypto.pbkdf2Sync(password, storedSalt, HASH_ITERATIONS, 64, 'sha512').toString('hex');
  return hash === storedHash;
}

module.exports = {
  hashPassword,
  verifyPassword,
};
