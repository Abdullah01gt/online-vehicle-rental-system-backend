import express from "express";
import ReviewModel from "../models/Review.model.js";

const ReviewRouter = express.Router();


ReviewRouter.post("/v1/add", async (req, res) => {
  try {
    const { booking_id, vehicle_id, user_id, user_name, rating, comment } = req.body;

    
    const existingReview = await ReviewModel.findOne({ booking_id });
    if (existingReview) {
      return res.status(400).json({ success: false, message: "You have already reviewed this booking!" });
    }

    const newReview = new ReviewModel({
      booking_id,
      vehicle_id,
      user_id,
      user_name,
      rating: Number(rating),
      comment
    });

    await newReview.save();
    return res.status(201).json({ success: true, message: "Review submitted successfully!", data: newReview });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});


ReviewRouter.get("/v1/vehicle/:vehicleId", async (req, res) => {
  try {
    const reviews = await ReviewModel.find({ vehicle_id: req.params.vehicleId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default ReviewRouter;