const client = require("./client")

// database functions
async function getAllActivities() {
  try {
    const {rows} = await client.query(`
      SELECT *
      FROM activities;
    `);

    return rows;
  } catch (error) {
    throw new error;
  }
}

async function getActivityById(id) {
  try {
    const {rows: [activity]} = await client.query(`
      SELECT *
      FROM activities
      WHERE id = ${id};
    `);
    return activity;
  } catch (error) {
    throw new error;
  }
}

async function getActivityByName(name) {
  try {
    const {rows: [activity]} = await client.query(`
      SELECT *
      FROM activities
      WHERE name ILIKE '${name}';
    `);
    return activity;
  } catch (error) {
    throw new error;
  }
}

async function attachActivitiesToRoutines(routines) {
}

// select and return an array of all activities
async function createActivity({ name, description }) {
  try {
    const {rows: [newActivity]} = await client.query(`
      INSERT INTO activities (name, description)
      VALUES ($1, $2)
      RETURNING *;
    `, [name, description]);
    return newActivity;
  } catch (error) {
    throw new error;
  }

}

// return the new activity
async function updateActivity({ id, ...fields }) {
  const {name, description} = fields;
  const values = [];
  (('name' in fields) && values.push(`name = '${name}'`));
  (('description' in fields) && values.push(`description = '${description}'`));
  
  try {
    const {rows: [updatedActivity]} = await client.query(`
      UPDATE activities
      SET ${values.join(', ')}
      WHERE id = ${id}
      RETURNING *;
    `);

    return updatedActivity;
  } catch (error) {
    throw new error;
  }
}

// don't try to update the id
// do update the name and description
// return the updated activity
module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity
}
