import mongoose from "mongoose"

const User = new mongoose.Schema({
    user_name:{
        type: String,
        required: true,
    },
     email_address:{
        type: String,
        required: true,
        unique:true,
    },
    password:{
        type: String,
        required: true,
    },
   
    date_of_birth:{
        type: Date,
        required: true
    },
    gender:{
        type: String,
        enum:["male", "female", "other"],
        required: true
    },
    driving_license_id:{
        type: String,
        required: true,
        unique: true,
    },
   
    address:{
        type: String,
        required: true,
    },
    contact_number: {
        type: Number,
        required: true,
        unique: true
    },
    user_role:{
        type: String,
        enum: ["user", "owner", "admin"],
        default: "user",
    }
},{timestamps: true})

const UserModel = mongoose.model("users",User)

export default UserModel 