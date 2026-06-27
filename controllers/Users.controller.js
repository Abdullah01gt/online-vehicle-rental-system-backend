import mongoose from "mongoose";
import UserModel from "../models/User.model.js";
import express from "express"
import jsonwebtoken from "jsonwebtoken";
import { upload } from "../config/cloudinaryConfig.js";
import dotenv from "dotenv"

dotenv.config()

const UserRouter = express.Router()

const JWT_SECRET = process.env.JWT_SECRET











// Creating a new User

UserRouter.post("/v1/create", async (req , res) => {
    try{
    

         const user = new UserModel(req.body)
         
         const response = await user.save()
         
         if(response)
         {
          const token = jsonwebtoken.sign(
        { userId: response._id},
        JWT_SECRET,
        { expiresIn: '24h'}
      )
      
            return res.status(200).json({
                 success:true,
                 message:"User created Succesfully",
                 data: response,
                 token: token
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

      const { email_address, password} = req.body
      const user = await UserModel.findOne( {
        email_address: email_address, 
        password: password
      })
      if(!user){
        res.status(401).json({
            success: false,
            message: "Invalid email address and password",
          

        })
      }

      const token = jsonwebtoken.sign(
        { userId: user._id},
        JWT_SECRET,
        { expiresIn: '24h'}
      )
      
      return res.status(200).json({
        success:true,
        message: "User logged in successfully!",
        token: token,
        data: [user]
      })
 // Error has to be fixed....
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



export default UserRouter;



