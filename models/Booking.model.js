import mongoose from "mongoose";

const Booking = new mongoose.Schema({
    user_id:{
        type: String,
        required: true
    },
    vehicle_id:{
        type: String,
        required: true,
    },
    vehicle_name:{
        type: String,
        required: true
    },
    vehicle_model:{
        type: String,
        requried: true
    }, 
    vehicle_year:{
        type: Number, 
        required: true,
    },
    vehicle_number:{
        type: String,
        required: true
    },
    vehicle_type:{
        type: String,
        enum: ["sedan", "hatch_back", "suv", "jeep", "traveller_van"],
        required: true
    },
    booking_start:{
        type: Date,
        required: true,
    },
    booking_end:{
        type: Date,
        required: true
    },
    booking_status:{
        type: String,
        enum:["booked","cancelled"],
        default:"booked"
    },
    user_name:{
        type: String,
        required: true
    },
    user_contact_number:{
        type: String,
        required: true
    },
    owner_id:{
        type: String,
        required: true,
    },
    owner_name:{
        type: String,
        required: true,
    },
    owner_contact_number:{
        type: String,
        required: true
    },
    total_days:{
        type: Number,
        required: true,
    },
    total_rent_cost:{
        type: Number,
        required: true
    },
    payment_id: { 
        type: String,
         required: false 
        },
        user_review:{
            type: Boolean,
            default: false,
        }



},{timestamps: true})

const BookingModel = mongoose.model("bookings",Booking)

export default BookingModel;