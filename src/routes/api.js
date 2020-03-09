const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

router
  .route("/tasks")
  .get(taskController.getTasks)
  .post(taskController.createTask);

router.route("/tasks/latest").get(taskController.getLatestTask);

router
  .route("/tasks/:taskid")
  .get(taskController.getTask)
  .put(taskController.updateTask)
  .delete(taskController.deleteTask);

module.exports = router;
