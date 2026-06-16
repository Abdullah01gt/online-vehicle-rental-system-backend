import express from "express";
import inititate_mongodb_connection from "./db.js";
import UserRouter from "./controllers/Users.controller.js";
import VehicleRouter from "./controllers/Vehicles.Controller.js";
import BookingRouter from "./controllers/Bookings.controller.js";
import cors  from "cors";

const app = express()
const PORT = 3000

// setting up databse Connection
inititate_mongodb_connection()

app.use(express.json())
app.use(cors())

app.use("/users", UserRouter)
app.use("/vehicles",VehicleRouter)
app.use("/bookings",BookingRouter)

app.listen(PORT,()=> {
    console.log("Server Is listening on PORT: " + PORT)
})