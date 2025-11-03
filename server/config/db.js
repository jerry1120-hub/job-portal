import mongoose from "mongoose";

// Function to connect to the MongoDB database
const connectDB = async () => {
  try {
    // Event listener for successful connection
    mongoose.connection.on("connected", () => console.log("Database Connected"));

    // Connect to MongoDB
    await mongoose.connect(`${process.env.MONGODB_URI}/job-portal`);
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
};

export default connectDB;
