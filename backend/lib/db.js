import mongoose from "mongoose";

export const connectDB = async ()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log(`database connection successful`)
    } catch (error) {
        console.log("error while connecting the database:",error);
        process.exit(1);
    }
}