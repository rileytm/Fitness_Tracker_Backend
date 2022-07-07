const client = require('./client')

async function getRoutineActivityById(id){
  try {
    const {rows: [routine]} = await client.query(`
    SELECT *
    FROM routine_activities
    WHERE id = ${id};
    `);
    return routine;
  } catch (error) {
    throw new error;
  }
}

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
    try {
      const {rows: [addedActivityRoutine]} = await client.query(`
      INSERT INTO routine_activities ("routineId", "activityId", count, duration)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
      `, [routineId, activityId, count, duration]);
      return addedActivityRoutine;
    } catch (error) {
      throw new error;
    }
}

async function getRoutineActivitiesByRoutine({id}) {
  try {
    const {rows} = await client.query(`
      SELECT *
      FROM routine_activities
      WHERE "routineId" = ${id};
    `);

    return rows;
  } catch (error) {
    throw new error;
  }
}

async function updateRoutineActivity ({id, ...fields}) {
  const {duration, count} = fields;
  const values = [];
  (('duration' in fields) && values.push(`duration = ${duration}`));
  (('count' in fields) && values.push(`count = ${count}`));

  try {
    const {rows: [updatedRoutineActivity]} = await client.query(`
      UPDATE routine_activities
      SET ${values.join(', ')}
      WHERE id = ${id}
      RETURNING *;
    `);
    
    return updatedRoutineActivity;
  } catch (error) {
    throw new error;
  }
}

async function destroyRoutineActivity(id) {
  try {
    const {rows: [deletedRoutine]} = await client.query(`
      DELETE FROM routine_activities
      WHERE id = ${id}
      RETURNING *;
    `);
    return deletedRoutine;
  } catch (error) {
    throw new error;
  }
}

async function canEditRoutineActivity(routineActivityId, userId) {
  try {
    const routineActivity = await getRoutineActivityById(routineActivityId);
    const {rows: [routineCreator]} = await client.query(`
      SELECT "creatorId"
      FROM routines
      WHERE id = ${routineActivity.routineId};
    `);

    return (routineCreator.creatorId === userId);
  } catch (error) {
    throw new error;
  }
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity
};
