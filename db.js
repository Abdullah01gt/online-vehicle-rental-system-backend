import mongoose from "mongoose";


async function inititate_mongodb_connection(){
   await mongoose.connect("mongodb://localhost:27017/vehicle_rental_system")
            .then((response) => console.log("Database Connected Succesfully!"))

}

export default inititate_mongodb_connection;