import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
  booking_id:
   { type: mongoose.Schema.Types.ObjectId,
     ref: 'Booking',
      required: true,
       unique: true },
  vehicle_id: 
  { type: mongoose.Schema.Types.ObjectId,
     ref: 'Vehicle',
      required: true },
  user_id:
   { type: mongoose.Schema.Types.ObjectId,
     ref: 'User',
      required: true },
  user_name: 
  { type: String,
     required: true },
  rating: 
  { type: Number,
     required: true,
      min: 1,
       max: 5 },
  comment: 
  { type: String, 
    required: true }
}, { timestamps: true });

const ReviewModel = mongoose.model("Reviews", ReviewSchema);
export default ReviewModel;