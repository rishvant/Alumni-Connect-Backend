import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI);
        console.log("Mongodb connected successfully");
    }
    catch (err) {
        console.log("Error:", err);
    }
}

export default connectDB;