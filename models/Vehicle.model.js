import mongoose from "mongoose";

const Vehicle = new mongoose.Schema({
    brand_name:{
        type: String,
        required: true
    },
    model_name:{
        type: String,
        required: true
    },
    model_year:{
        type: Number,
        required: true
    },
    vehicle_type:{
        type: String,
        enum: ["sedan", "xuv", "suv", "jeep", "traveller_van"],
        required: true
    },  
    per_day_rent:{
        type: Number,
        required: true
    },
    owner_name:{
        type: String,
        required: true
    },
    registration_number:{
        type: String,
        required: true
    },
    available_region:{
        type: String,
        required: true
    },
    availablity_status:{
        type: Boolean,
        default: true,
       
    },
    ratings:{
        type: Array,
    },
    is_deleted:{
        type: Boolean,
        default: false
    }

},{timestamps:true})

const VehicleModel = mongoose.model("vehicles",Vehicle)

export default VehicleModel;
