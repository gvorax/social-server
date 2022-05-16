const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDb connected');
  } catch (error) {
    console.error(error.message,"MongoDB error");

    process.exit(1);
  }
};

module.exports = connectDB;
