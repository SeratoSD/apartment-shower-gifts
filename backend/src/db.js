const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb+srv://sergiotovar13_db_user:OHPMYPaW8FfTPiaW@giftscluster.vccln8j.mongodb.net/apartment-shower?retryWrites=true&w=majority';
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
