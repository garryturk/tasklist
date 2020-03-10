const app = require("../app");
const taskModel = require("../src/models/taskModel");
const chai = require("chai");
const should = chai.should();
const chaiHttp = require("chai-http");
chai.use(chaiHttp);

describe("/tasks", () => {
  it("should create a new task", async function() {
    let res = await chai
      .request(app)
      .post("/tasks")
      .send({
        title: "First test task",
        details: "This is the first test task",
        status: "todo"
      });

    res.status.should.equal(202);
    res.type.should.equal("application/json");
    res.body.should.include.keys("taskId");
    res.body.title.should.eql("First test task");
    res.body.details.should.eql("This is the first test task");
    res.body.status.should.eql("todo");
  });

  it("should retrieve all tasks", async function() {
    // Populate some tasks to retrieve
    let temp = await chai
      .request(app)
      .post("/tasks")
      .send({
        title: "First test task",
        details: "This is the first test task",
        status: "todo"
      });

    const firstId = temp.body.taskId;

    temp = await chai
      .request(app)
      .post("/tasks")
      .send({
        title: "Second test task",
        details: "This is the second test task",
        status: "completed"
      });

    const secondId = temp.body.taskId;

    // Validate both tasks were retrieved
    let res = await chai.request(app).get("/tasks");
    res.status.should.equal(200);
    res.type.should.equal("application/json");
    res.body.should.deep.contain({
      taskId: firstId,
      title: "First test task",
      details: "This is the first test task",
      status: "todo"
    });

    res.body.should.deep.contain({
      taskId: secondId,
      title: "Second test task",
      details: "This is the second test task",
      status: "completed"
    });
  });

  it("should not create an incomplete task", async function() {
    let res = await chai
      .request(app)
      .post("/tasks")
      .send({
        title: "First test task",
        details: "This is the first test task"
      });

    // Task has no status field
    res.status.should.equal(400);
    res.type.should.equal("application/json");
    res.body.Result.should.eql("Empty parameter");
  });
});

describe("/tasks/taskid", () => {
  it("should retrieve a task", async function() {
    // Create a task to be retrieved
    let temp = await chai
      .request(app)
      .post("/tasks")
      .send({
        title: "Next test task",
        details: "This is the next test task",
        status: "todo"
      });

    const taskId = temp.body.taskId;

    let res = await chai.request(app).get("/tasks/" + taskId);
    res.status.should.equal(200);
    res.type.should.equal("application/json");
    res.body.should.deep.contain({
      taskId: taskId,
      title: "Next test task",
      details: "This is the next test task",
      status: "todo"
    });
  });

  it("should retrieve the latest task", async function() {
    // Create task to be retrieved
    let temp = await chai
      .request(app)
      .post("/tasks")
      .send({
        title: "Latest test task",
        details: "This is the latest test task",
        status: "todo"
      });

    const taskId = temp.body.taskId;

    let res = await chai.request(app).get("/tasks/latest");
    res.status.should.equal(200);
    res.type.should.equal("application/json");
    res.body.should.deep.contain({
      taskId: taskId,
      title: "Latest test task",
      details: "This is the latest test task",
      status: "todo"
    });
  });

  it("should update a task", async function() {
    // Create task to be updated
    let temp = await chai
      .request(app)
      .post("/tasks")
      .send({
        title: "Next test task",
        details: "This is the next test task",
        status: "todo"
      });

    const taskId = temp.body.taskId;

    temp = await chai
      .request(app)
      .put("/tasks/" + taskId)
      .send({
        title: "Updated test task"
      });

    // Now retrieve the updated task
    let res = await chai.request(app).get("/tasks/" + taskId);
    res.status.should.equal(200);
    res.type.should.equal("application/json");
    res.body.should.deep.contain({
      taskId: taskId,
      title: "Updated test task",
      details: "This is the next test task",
      status: "todo"
    });
  });

  it("should delete a task", async function() {
    // Create task to be deleted
    let temp = await chai
      .request(app)
      .post("/tasks")
      .send({
        title: "Doomed test task",
        details: "This is the doomed test task",
        status: "todo"
      });

    const taskId = temp.body.taskId;

    let res = await chai.request(app).delete("/tasks/" + taskId);

    res.status.should.equal(200);
    res.type.should.equal("application/json");
    res.body.result.should.equal("deleted");
  });

  it("should not delete a non-existant task", async function() {
    // Create task to be deleted
    let temp = await chai
      .request(app)
      .post("/tasks")
      .send({
        title: "Doomed test task",
        details: "This is the doomed test task",
        status: "todo"
      });

    const taskId = temp.body.taskId;

    // Delete the task - this should succeed
    let res = await chai.request(app).delete("/tasks/" + taskId);

    res.status.should.equal(200);
    res.type.should.equal("application/json");

    // Now try to delete that task again
    res = await chai.request(app).delete("/tasks/" + taskId);
    res.status.should.equal(404);
    res.body.error.should.equal("task not found");
    res.type.should.equal("application/json");
  });
});
