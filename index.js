import express from "express";
import inititate_mongodb_connection from "./db.js";
import UserRouter from "./controllers/Users.controller.js";
import VehicleRouter from "./controllers/Vehicles.Controller.js";
import BookingRouter from "./controllers/Bookings.controller.js";
import cors  from "cors";
import ReviewRouter from "./controllers/Reviews.controller.js";
import AdminRouter from "./controllers/Admin.controller.js";
import dotenv from "dotenv";




dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000
const FRONTEND_URL = process.env.FRONTEND_URL



// setting up databse Connection
inititate_mongodb_connection()

app.use(express.json())
app.use(cors({
  origin: FRONTEND_URL , 
  methods: ["GET", "POST", "PUT", "DELETE" ,"PATCH"],
  credentials: true
}));
app.use("/users", UserRouter)
app.use("/vehicles",VehicleRouter)
app.use("/bookings",BookingRouter)
app.use("/reviews",ReviewRouter)
app.use("/admin",AdminRouter)

app.listen(PORT,()=> {
    console.log("Server Is listening on PORT: " + PORT)
})