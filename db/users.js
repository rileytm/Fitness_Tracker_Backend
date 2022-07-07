const client = require("./client");
const bcrypt = require('../node_modules/bcrypt');
const SALT = 10;
// database functions

// user functions
async function createUser({ username, password }) {
  const hashedPassword = await bcrypt.hash(password, SALT);

  try {
    const {rows: [user]} = await client.query(`
      INSERT INTO users (username, password)
      VALUES ($1, $2)
      RETURNING *;
    `, [username, hashedPassword]);

    delete user.password;
    return user;
  } catch (error) {
    throw new error;
  }
}

async function getUser({ username, password }) {
  try {
    const user = await getUserByUsername(username);
    if (!user) return;
    const userPassword = user.password;
    const passwordMatch = await bcrypt.compare(password, userPassword);
    if (!passwordMatch) return;
    delete user.password;
    return user;
    } catch (error) {
    throw new error;
  }
}

async function getUserById(userId) {
  try {
    const {rows: [user]} = await client.query(`
    SELECT *
    FROM users
    WHERE id = ${userId};
    `);

    delete user.password;
    return user;
  } catch (error) {
    throw new error;
  }
}

async function getUserByUsername(userName) {
  try {
    const {rows: [user]} = await client.query(`
    SELECT *
    FROM users
    WHERE username = ($1);
    `, [userName]);
    return user;
  } catch (error) {
    throw new error;
  }
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername
};
