import mongoose from "mongoose";
import VehicleModel from "../models/Vehicle.model.js";
import express from "express"

const VehicleRouter = express.Router()




// Creating a new Vehicle

VehicleRouter.post("/v1/create", async (req , res) => {
    try{
         const vehicle = new VehicleModel(req.body)
         console.log(vehicle)
         const response = await vehicle.save()
         console.log(response)
         if(response)
         {
            return res.status(200).json({
                 success:true,
                 message:"Vehicle created Succesfully",
                 data: response
         })
        }
    }catch(error){
              return res.status(400).json({
                success: false,
                message: "Failed to Create Vehicle",
                error: error.message
              })
    }
})

// Getting The list of all Vehicles

VehicleRouter.get("/v1/", async (req, res) => {
    try{
      const response = await VehicleModel.find()
      if(response){
        res.status(200).json({
            success: true,
            message: "Vehicle's Fetched Successfully",
            data: response,

        })
      }
    }catch(error){
             return res.status(400).json({
                success: false,
                message: "Failed to fetch Vehicles",
                error: error.message
              })
    }
} )

// Getting a Single Vehicle
VehicleRouter.post("/v1/", async (req, res) => {
    try{
      const response = await VehicleModel.find(req.body)
      if(response){
        res.status(200).json({
            success: true,
            message: "Vehicle Fetched Successfully",
            data: response,

        })
      }
    }catch(error){
             return res.status(400).json({
                success: false,
                message: "Failed to fetch Vehicle",
                error: error.message
              })
    }
} )


// Updating a  Vehicle

VehicleRouter.patch("/v1/update/:vehicleId", async (req, res) => {
    const { vehicleId } = req.params;

    try{
        if(vehicleId){
            const response = await VehicleModel.findByIdAndUpdate({
                _id: new mongoose.Types.ObjectId(vehicleId)
            },
        req.body,
    {
        returnDocument: "after",
        runValidators: "true"
    });
    return res.status(201).json({
        success: true,
        message: "Vehicle updated successfully",
        data: response
    })
        }
    }catch(error){
        return res.status(400).json({
                success: false,
                message: "Failed to Update Vehicle",
                error: error.message
              })
    }
})

// Deleting A Vehicle

export default VehicleRouter;



