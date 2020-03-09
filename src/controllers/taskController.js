const taskModel = require("../models/taskModel");

// Logic to allow latest id to be used in controller logic
let latest;

const getLatestId = function() {
  if (!latest) {
    latest = taskModel.getHighestId();
  }

  return latest;
};

// Array of valid status values
const VALID_STATUS = ["todo", "completed"];

const getTasks = function(req, res) {
  taskModel.getTasks(function(result) {
    res.set("Content-Type", "application/json");
    res.status(result.status).json(result.body);
  });
};

const createTask = async function(req, res) {
  const { title, details, status } = req.body;
  const task = {};
  task.title = title;
  task.details = details;
  task.status = status;

  // Valid arguments if both title/details exist and if status is one of the allowed values
  if (title && details && VALID_STATUS.includes(status)) {
    taskModel.createTask(task, function(result) {
      res.set("Content-Type", "application/json");
      // Dummy URL obviously!
      res.set(
        "Location",
        `http://api.garrylist.com/tasks/${result.body.userId}`
      );
      res.status(result.status).json(result.body);
    });
  } else {
    console.log("Error creating task");
    res.set("Content-Type", "application/json");
    res.status(400).json({ Result: "Empty parameter" });
  }
};

const getTask = function(req, res) {
  const id = parseInt(req.params.taskid);

  if (isNaN(id)) {
    res.set("Content-Type", "application/json");
    res.status(400).json({ error: "invalid task id" });
  } else {
    taskModel.getTask(id, function(result) {
      res.set("Content-Type", "application/json");
      res.status(result.status).json(result.body);
    });
  }
};

const updateTask = function(req, res) {
  const id = parseInt(req.params.taskid);

  const { title, details, status } = req.body;
  const task = {};
  task.taskId = id;
  if (title) task.title = title;
  if (details) task.details = details;
  if (status) task.status = status;

  // Valid arguments if the id is a number and at least one of the other fields is present/valid
  if (!isNaN(id) && (title || details || VALID_STATUS.includes(status))) {
    taskModel.updateTask(task, function(result) {
      res.set("Content-Type", "application/json");
      res.status(result.status).json(result.body);
    });
  } else {
    res.set("Content-Type", "application/json");
    res.status(400).json({ Result: "Empty parameter" });
  }
};

const deleteTask = function(req, res) {
  const id = parseInt(req.params.taskid);

  if (isNaN(id)) {
    res.set("Content-Type", "application/json");
    res.status(400).json({ error: "invalid task id" });
  } else {
    taskModel.deleteTask(id, function(result) {
      res.set("Content-Type", "application/json");
      res.status(result.status).json(result.body);
    });
  }
};

const getLatestTask = function(req, res) {
  const taskId = getLatestId();

  if (!taskId || taskId == 0) {
    res.status(404).json({ error: "no latest task" });
  } else {
    taskModel.getTask(taskId, function(result) {
      res.set("Content-Type", "application/json");
      res.status(result.status).json(result.body);
    });
  }
};
module.exports = {
  getTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  getLatestTask
};
