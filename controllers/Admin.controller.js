import express from "express";
import BookingModel from "../models/Booking.model.js";

const AdminRouter = express.Router();

// POST /admin/v1/transactions
AdminRouter.post("/v1/transactions", async (req, res) => {
  try {
    const { searchQuery, statusFilter, page = 1, limit = 10 } = req.body;
    const skip = (page - 1) * limit;

    // 1. Build dynamic match conditions
    let matchConditions = {};

    if (statusFilter) {
      matchConditions.booking_status = statusFilter;
    }

    if (searchQuery && searchQuery.trim() !== "") {
      const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      matchConditions.$or = [
        { payment_id: regex },
        { user_name: regex },
        { vehicle_name: regex },
        { vehicle_number: regex }
      ];
    }

    // 2. Run Parallel Operations for Performance (Stats + Paginated Data)
    const [stats] = await BookingModel.aggregate([
      {
        $facet: {
          metrics: [
            {
              $group: {
                _id: null,
                totalRevenue: { 
                  $sum: { $cond: [{ $eq: ["$booking_status", "booked"] }, "$total_rent_cost", 0] } 
                },
                totalTransactions: { $sum: 1 },
                successfulVolume: { 
                  $sum: { $cond: [{ $eq: ["$booking_status", "booked"] }, 1, 0] } 
                },
                cancelledVolume: { 
                  $sum: { $cond: [{ $eq: ["$booking_status", "cancelled"] }, 1, 0] } 
                }
              }
            }
          ]
        }
      }
    ]);

    const financialMetrics = stats?.metrics[0] || { totalRevenue: 0, totalTransactions: 0, successfulVolume: 0, cancelledVolume: 0 };

    // 3. Fetch Paginated Records matching filters
    const totalRecords = await BookingModel.countDocuments(matchConditions);
    const transactions = await BookingModel.find(matchConditions)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      metrics: financialMetrics,
      pagination: {
        totalRecords,
        currentPage: Number(page),
        totalPages: Math.ceil(totalRecords / limit)
      },
      data: transactions
    });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default AdminRouter;