import db from "../config/db.js";
import User from "../models/user.js";

// Traceability:
// UC-01 User creates an account.
// UC-02 User logs in.

// Traceability: UC-02 checks stored credentials for login.
// Find user by email and password for login
const findByEmailAndPassword = (email, password) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT userid, user, email, loggedin
      FROM users
      WHERE email = ? AND password = ?
    `;

    db.query(sql, [email, password], (err, results) => {
      if (err) return reject(err);

      if (results.length === 0) {
        return resolve(null);
      }

      const row = results[0];
      const foundUser = new User(
        row.userid,
        row.user,
        row.email,
        row.loggedin
      );

      resolve(foundUser);
    });
  });
};

// Traceability: UC-02 records a successful login event.
// Increment login count after successful login
const incrementLoginCount = (userId) => {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE users SET loggedin = loggedin + 1 WHERE userid = ?";

    db.query(sql, [userId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

// Traceability: UC-01 checks whether the email is already registered.
// Check whether email already exists before registration
const findByEmail = (email) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT userid, user, email, loggedin
      FROM users
      WHERE email = ?
    `;

    db.query(sql, [email], (err, results) => {
      if (err) return reject(err);

      if (results.length === 0) {
        return resolve(null);
      }

      const row = results[0];
      const foundUser = new User(
        row.userid,
        row.user,
        row.email,
        row.loggedin
      );

      resolve(foundUser);
    });
  });
};

// Traceability: UC-01 inserts the newly registered user.
// Create user during registration
// Username is optional at registration in your project, so we insert NULL
const createUser = (email, password) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO users (user, email, password, loggedin)
      VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [null, email, password, 0], (err, result) => {
      if (err) return reject(err);

      const newUser = new User(
        result.insertId,
        null,
        email,
        0
      );

      resolve(newUser);
    });
  });
};

// Optional helper to find user by ID (not currently used but can be useful for session management, etc.)
const findById = (userId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT userid, user, email, loggedin
      FROM users
      WHERE userid = ?
    `;

    db.query(sql, [userId], (err, results) => {
      if (err) return reject(err);

      if (results.length === 0) {
        return resolve(null);
      }

      const row = results[0];
      const foundUser = new User(
        row.userid,
        row.user,
        row.email,
        row.loggedin
      );

      resolve(foundUser);
    });
  });
};

export default {
  findByEmailAndPassword,
  incrementLoginCount,
  findByEmail,
  createUser,
  findById
};