const dyn = require("./dynamodb");

let latest = 0;

// Retrieve the highest task id on initial module load
// This is a bit hacky just to share state between model and controller
// Also wouldnt scale to huge lists
dyn.tasks.scan().exec(function(err, tasks) {
  if (tasks) {
    tasks.forEach(task => {
      if (task.taskId > latest) latest = task.taskId;
    });
  }
});

const getHighestId = function() {
  return latest;
};

const getTasks = async function(callback) {
  const response = {};
  let tasks;
  try {
    tasks = await dyn.tasks.scan().exec();
  } catch (err) {
    response.status = 500;
    response.body = { error: "internal error" };
    callback(response);
  }

  response.status = 200;
  response.body = tasks;
  callback(response);
};

const createTask = async function(task, callback) {
  const response = {};

  // Increment internal count of current highest task id, avoid a rescan
  latest = latest + 1;

  task.taskId = latest;

  try {
    await dyn.tasks.create(task);
  } catch (err) {
    console.log("Error saving to DynamoDB");
    console.log(err);
    response.status = 400;
    response.body = { error: "internal error" };
    callback(response);
  }

  response.status = 202;
  response.body = task;
  callback(response);
};

const getTask = async function(id, callback) {
  const response = {};
  let task;

  try {
    task = await dyn.tasks.get({ taskId: id });
  } catch (err) {
    response.status = 500;
    response.body = { error: "internal error" };
    callback(response);
  }

  if (!task) {
    response.status = 404;
    response.body = { error: "task not found" };
  } else {
    response.status = 200;
    response.body = task;
  }
  callback(response);
};

const updateTask = async function(task, callback) {
  const response = {};

  // The task parameter has the fields to be updated so this can be passed straight to Dynamoose
  // the  other attributes remain unchanged
  try {
    await dyn.tasks.update(task);
  } catch (err) {
    console.log(err);
    response.status = 500;
    response.body = { error: "internal error" };
    callback(response);
  }

  response.status = 200;
  response.body = task;
  callback(response);
};

const deleteTask = async function(id, callback) {
  const response = {};

  let task;

  try {
    task = await dyn.tasks.get({ taskId: id });
  } catch (err) {
    response.status = 500;
    response.body = { error: "internal error" };
    callback(response);
  }

  if (!task) {
    response.status = 404;
    response.body = { error: "task not found" };
    callback(response);
  }

  try {
    await dyn.tasks.delete({ taskId: id });
  } catch (err) {
    console.log("Error deleting from DynamoDB");
    console.log(err);
    response.status = 500;
    response.body = { error: "internal error" };
    callback(response);
  }

  response.status = 200;
  response.body = { result: "deleted" };
  callback(response);
};

module.exports = {
  getHighestId,
  getTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask
};
