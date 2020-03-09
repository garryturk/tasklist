const dynamoose = require("dynamoose");

console.log("DynamoDB config: " + process.env.DYNAMODB_CONFIG);

const config = JSON.parse(process.env.DYNAMODB_CONFIG);
if (config.LOCAL == "true") {
  console.log("Using local DynamoDB on " + config.URL);
  dynamoose.local(config.URL);
}

const tasks = dynamoose.model(
  config.TASKS_TABLE,
  {
    taskId: {
      type: Number,
      hashKey: true
    },
    title: {
      type: String,
      required: true
    },
    details: {
      type: String,
      required: true
    },
    status: {
      type: String,
      required: true
    }
  },
  {
    throughput: 5
  }
);

module.exports = { tasks };
