// const { getRoutineActivitiesByRoutine } = require('./routine_activities');
const client = require('./client');

async function getRoutineById(id){
  try {
    const {rows: [routine]} = await client.query(`
      SELECT *
      FROM routines
      WHERE id = ${id};
    `);
    return routine;
  } catch (error) {
    throw new error
  }
}

async function getRoutinesWithoutActivities(){
  try {
    const {rows} = await client.query(`
      SELECT *
      FROM routines;
    `);

    return rows;
  } catch (error) {
    throw new error
  }
}

async function getAllRoutines() {
  try {
    const {rows: [...routines]} = await client.query(`
      SELECT *
      FROM routines;
    `);

    const {rows: [...activities]} = await client.query(`
      SELECT *
      FROM activities;
    `);

    const {rows: [...routine_activities]} = await client.query(`
      SELECT *
      FROM routine_activities;
    `);

    const {rows: [...users]} = await client.query(`
      SELECT *
      FROM users
      WHERE id IN (${routines.map(
        (routine) => routine.creatorId
      ).join(', ')});
    `)

    routines.map(
      (routine) => {
        routine.activities = [];
        routine_activities.map((ra) => {
          if (ra.routineId === routine.id) {
            const activity = activities.find(act => act.id === ra.activityId)
            routine.activities.push({
              id: activity.id,
              name: activity.name,
              description: activity.description,
              duration: ra.duration,
              count: ra.count,
              routineId: routine.id,
              routineActivityId: ra.id
            })
          }
        })
        const name = users.find(user => user.id === routine.creatorId).username;
        routine.creatorName = name;
    })

    return routines;
  } catch (error) {
    throw new error;
  }
}

async function getAllRoutinesByUser({username}) {
  try {
    const routines = await getAllRoutines();
    const userRoutines = [];
    routines.forEach((routine) => {
      if (routine.creatorName === username) {
        userRoutines.push(routine)
      }
    });
    return userRoutines;
  } catch (error) {
    throw new error;
  }
}

async function getPublicRoutinesByUser({username}) {
  try {
    const userRoutines = await getAllRoutinesByUser({username});
    const publicUserRoutines = [];
    userRoutines.forEach((routine) => {
      if (routine.isPublic) {
        publicUserRoutines.push(routine);
      }
    });
    return publicUserRoutines;
  } catch (error) {
    throw new error;
  }
}

async function getAllPublicRoutines() {
  try {
    const routines = await getAllRoutines();
    
    routines.map((routine, index) => {
      if (!routine.isPublic) {
        routines.splice(index, 1)
      }
    });
    
    return routines;
  } catch (error) {
    throw new error;
  }
}

async function getPublicRoutinesByActivity({id}) {
  try {
    let activityId = id;
    let publicRoutines;
    publicRoutines = await getAllPublicRoutines();
    publicRoutines.map((routine) => {
      for (let i = 0; i < routine.activities.length; i++) {
        if (routine.activities[i].id === activityId) {
          return routine;
        }
      }
    });
    // console.log("Test run ", testrun, " db function result:", publicRoutines);
    return publicRoutines;
  } catch (error) {
    throw new error;
  }
}

async function createRoutine({creatorId, isPublic, name, goal}) {
  try {
    const {rows: [newRoutine]} = await client.query(`
      INSERT INTO routines ("creatorId", "isPublic", name, goal)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `, [creatorId, isPublic, name, goal])

    return newRoutine;
  } catch(error) {
    throw new error
  }
}

async function updateRoutine({id, ...fields}) {
  const {isPublic, name, goal} = fields;
  const values = [];
  (('isPublic' in fields) && values.push(`"isPublic" = ${isPublic}`));
  (('name' in fields) && values.push(`name = '${name}'`));
  (('goal' in fields) && values.push(`goal = '${goal}'`));

  try {
    const {rows: [routine]} = await client.query(`
      UPDATE routines
      SET ${values.join(',')}
      WHERE id = ${id}
      RETURNING *;
    `)

    return routine;
  } catch (error) {
    throw new error;
  }
}

async function destroyRoutine(id) {
  try {
    const {rows} = await client.query(`
      DELETE FROM routine_activities
      WHERE "routineId" = ${id};

      DELETE FROM routines
      WHERE id = ${id};
    `);
    return rows;
  } catch (error) {
    throw new error;
  }
}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine
}