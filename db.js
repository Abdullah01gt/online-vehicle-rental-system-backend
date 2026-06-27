import mongoose from "mongoose";
import dotenv from "dotenv";


dotenv.config()
const dbUrl = process.env.MONGODB_URI


async function inititate_mongodb_connection(){
   await mongoose.connect(dbUrl)
            .then((response) => console.log("Database Connected Succesfully!"))

}

export default inititate_mongodb_connection;