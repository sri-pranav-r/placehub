const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Folder where the built-in development database keeps its files (git-ignored)
const DATA_DIR = path.join(__dirname, '..', '.data', 'mongo');

// Starts the built-in MongoDB (mongodb-memory-server) with its data stored on disk,
// so restarts keep data and logins. A restart can begin while the previous run's
// database is still shutting down and holding its lock, so retry for a few seconds.
async function startBuiltInMongo() {
  const { MongoMemoryServer } = require('mongodb-memory-server');
  fs.mkdirSync(DATA_DIR, { recursive: true });
  for (let attempt = 1; ; attempt++) {
    try {
      return await MongoMemoryServer.create({ instance: { dbPath: DATA_DIR, storageEngine: 'wiredTiger' } });
    } catch (err) {
      if (attempt >= 10) throw err;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

// Connects to MONGO_URI. If MONGO_URI is "memory" (or missing), uses the built-in
// development database so the project runs without installing MongoDB.
async function connectDB() {
  let uri = process.env.MONGO_URI;
  let mongo = null;

  if (!uri || uri === 'memory') {
    mongo = await startBuiltInMongo();
    uri = mongo.getUri('placementdb');
    console.log(`Using the built-in development MongoDB (data kept in ${path.relative(process.cwd(), DATA_DIR)})`);
  }

  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${mongoose.connection.name}`);
  // `mongo` is the built-in database process (null for a real MongoDB), so scripts can stop it
  return { builtIn: Boolean(mongo), mongo };
}

module.exports = connectDB;
