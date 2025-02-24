import mongoose from "mongoose";

let connectionString = process.env.MONGO_CONNECTION_STRING;
let databaseName = process.env.MONGO_DATABASE;

if (!connectionString)
  throw new Error("missing MONGO_CONNECTION_STRING environment variable");
if (!databaseName)
  throw new Error("missing MONGO_DATABASE environment variable");

async function connectWithMongo() {
  let connection;
  try {
    connection = await mongoose.connect(`${connectionString}/${databaseName}`);
    console.log(`successfully connected with mongodb ${databaseName} database`);
  } catch (err) {
    console.error("unable to connect to the database");
    console.error(err);

    throw err;
  }
}

export { connectWithMongo };
