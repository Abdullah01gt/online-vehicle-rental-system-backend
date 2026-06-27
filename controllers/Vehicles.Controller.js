import mongoose from "mongoose";
import VehicleModel from "../models/Vehicle.model.js";
import express from "express"
import { upload } from "../config/cloudinaryConfig.js";

const VehicleRouter = express.Router()




// Creating a new Vehicle

VehicleRouter.post("/v1/create",upload.single('image_url'), async (req , res) => {
    try{

        const newVehicle = {
        brand_name: req.body.brand_name,
        model_name:  req.body.model_name,   
        model_year: req.body.model_year,
        vehicle_type: req.body.vehicle_type,
        registration_number:  req.body.registration_number,
        available_region:  req.body.available_region,
        per_day_rent: req.body.per_day_rent,
        image_url: req.file.path,
        owner_id:  req.body.owner_id,
        owner_name: req.body.owner_name,
        owner_contact_number: req.body.owner_contact_number,
        availablity_status: req.body.availablity_status,
    }
         const vehicle = new VehicleModel(newVehicle)
         
         const response = await vehicle.save()
        
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
  try {
   
    const response = await VehicleModel.aggregate([
     
      { 
        $match: req.body 
      },

      
      {
        $lookup: {
          from: "reviews",          
          localField: "_id",          
          foreignField: "vehicle_id", 
          as: "rawReviews"           
        }
      },

      
      {
        $addFields: {
          reviewCount: { $size: "$rawReviews" },
          averageRating: {
            $cond: {
              if: { $gt: [{ $size: "$rawReviews" }, 0] },
              then: { $round: [{ $avg: "$rawReviews.rating" }, 1] }, 
              else: 0
            }
          },
          reviewsList: "$rawReviews" 
        }
      }
    ]);

   
    return res.status(200).json({
      success: true,
      message: "Vehicle Fetched Successfully with Ratings",
      data: response,
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to fetch Vehicle",
      error: error.message
    });
  }
});


VehicleRouter.post("/v1/search", async (req, res) => {
  try {
    const { searchQuery } = req.body;

    
    if (!searchQuery || searchQuery.trim() === "") {
      const allVehicles = await VehicleModel.find({ availablity_status: "available" });
      return res.status(200).json({ success: true, data: allVehicles });
    }

   
    const sanitizedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    
    const regex = new RegExp(sanitizedQuery, 'i');

    const searchConditions = [
      { brand_name: regex },
      { model_name: regex },
      { available_region: regex },
      { vehicle_type: regex }
    ];
    
    const parsedYear = Number(searchQuery.trim());
    if (!isNaN(parsedYear)) {
      searchConditions.push({ model_year: parsedYear });
    }
    
    const results = await VehicleModel.find({
      availablity_status: "available",
      $or: searchConditions

      
    });

    return res.status(200).json({
      success: true,
      message: `${results.length} vehicles matched your search filters.`,
      data: results
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred while executing search.",
      error: error.message
    });
  }
});



VehicleRouter.post("/v1/admincontrol", async (req, res) => {
  try {
   
    const targetStatuses = req.body.statuses; 

   
    const vehicles = await VehicleModel.find({
      availablity_status: { $in: targetStatuses }
    });
    console.log(vehicles)

    
    return res.status(200).json({
      success: true,
      message: "Vehicles fetched successfully",
      data: vehicles
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch filtered vehicles",
      error: error.message
    });
  }
});


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
    console.log(response)
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



export default VehicleRouter;



