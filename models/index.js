import mongoose from 'mongoose';

export default async function dbConnection(){
    try {
        await mongoose.connect(process.env.DATABASE_URI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error(error);
        console.error("MongoDB connection failed");
        process.exit(1);
    }
}


