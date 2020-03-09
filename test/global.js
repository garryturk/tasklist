const app = require("../app");
const sinon = require("sinon");
const taskModel = require("../src/models/taskModel");

before(async function() {
  sinon.stub(console, "log");
});

after(async function() {
  console.log.restore();
});

beforeEach(async function() {
  try {
    await taskModel.deleteTask(1, () => {});
    await taskModel.deleteTask(2, () => {});
  } catch (err) {
    console.log(err);
  }
});
