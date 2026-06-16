import mongoose from "mongoose";
import UserModel from "../models/User.model.js";
import express from "express"

const UserRouter = express.Router()




// Creating a new User

UserRouter.post("/v1/create", async (req , res) => {
    try{
         const user = new UserModel(req.body)
         console.log(user)
         const response = await user.save()
         console.log(response)
         if(response)
         {
            return res.status(200).json({
                 success:true,
                 message:"User created Succesfully",
                 data: response
         })
        }
    }catch(error){
              return res.status(400).json({
                success: false,
                message: "Failed to Create User",
                error: error.message
              })
    }
})

// Getting The list of all users

UserRouter.get("/v1/", async (req, res) => {
    try{
      const response = await UserModel.find()
      if(response){
        res.status(200).json({
            success: true,
            message: "User's Fetched Successfully",
            data: response,

        })
      }
    }catch(error){
             return res.status(400).json({
                success: false,
                message: "Failed to fetch Users",
                error: error.message
              })
    }
} )

// Getting a Single user
UserRouter.post("/v1/user", async (req, res) => {
    try{
      const response = await UserModel.find(req.body)
      if(response){
        res.status(200).json({
            success: true,
            message: "User Fetched Successfully",
            data: response,

        })
      }
    }catch(error){
             return res.status(400).json({
                success: false,
                message: "Failed to fetch User",
                error: error.message
              })
    }
} )


// Updating a  user

UserRouter.patch("/v1/update/:userId", async (req, res) => {
    const { userId } = req.params;

    try{
        if(userId){
            const response = await UserModel.findByIdAndUpdate({
                _id: new mongoose.Types.ObjectId(userId)
            },
        req.body,
    {
        returnDocument: "after",
        runValidators: "true"
    });
    return res.status(201).json({
        success: true,
        message: "User updated successfully",
        data: response
    })
        }
    }catch(error){
        return res.status(400).json({
                success: false,
                message: "Failed to Update User",
                error: error.message
              })
    }
})

// Deleting A User

export default UserRouter;



