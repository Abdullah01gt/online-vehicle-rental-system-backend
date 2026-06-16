import mongoose from "mongoose";
import BookingModel from "../models/Booking.model.js";
import express from "express"

const BookingRouter = express.Router()




// Creating a new Booking

BookingRouter.post("/v1/create", async (req , res) => {
    try{
         const booking = new BookingModel(req.body)
         console.log(booking)
         
         const { vehicle_id, booking_start, booking_end } = req.body;

          const vehicleId = req.body.vehicle_id
         const fromDate = new Date(booking_start)
         const returnDate = new Date(booking_end)

         const holdBooking = await BookingModel.findOne({
            vehicle_id: vehicle_id,
            booking_start: { $lte: returnDate},
            booking_end: { $gte: fromDate },
            booking_status: "booked"
         })
         
         if(holdBooking){
            return res.status(400).json({
                success: false,
                available:false,
                message: "Failed to Create Booking",
                error: "These Dates were already Booked!"
              })
         }
         const response = await booking.save()
         console.log(response)
         if(response)
         {
            return res.status(200).json({
                 success:true,
                 available:true,
                 message:"Booking created Succesfully",
                 data: response
         })
        }
    }catch(error){
              return res.status(400).json({
                success: false,
                message: "Failed to Create Booking",
                error: error.message
              })
    }
})

// Getting The list of all bookings

BookingRouter.get("/v1/", async (req, res) => {
    try{
      const response = await BookingModel.find()
      if(response){
        res.status(200).json({
            success: true,
            message: "Booking's Fetched Successfully",
            data: response,

        })
      }
    }catch(error){
             return res.status(400).json({
                success: false,
                message: "Failed to fetch Bookings",
                error: error.message
              })
    }
} )

// Getting the bookings of a single user or a single car
BookingRouter.post("/v1/booking", async (req, res) => {
    try{
      const response = await BookingModel.find(req.body)
      if(response){
        res.status(200).json({
            success: true,
            message: "Booking Fetched Successfully",
            data: response,

        })
      }
    }catch(error){
             return res.status(400).json({
                success: false,
                message: "Failed to fetch Booking",
                error: error.message
              })
    }
} )


// Canceling a  booking

BookingRouter.patch("/v1/update/:bookingId", async (req, res) => {
    const { bookingId } = req.params;

    try{
        if(bookingId){
            const response = await BookingModel.findByIdAndUpdate({
                _id: new mongoose.Types.ObjectId(bookingId)
            },
        req.body,
    {
        returnDocument: "after",
        runValidators: "true"
    });
    return res.status(201).json({
        success: true,
        message: "Booking updated successfully",
        data: response
    })
        }
    }catch(error){
        return res.status(400).json({
                success: false,
                message: "Failed to Update Booking",
                error: error.message
              })
    }
})

// Deleting A booking

export default BookingRouter;



