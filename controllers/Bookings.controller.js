import mongoose from "mongoose";
import BookingModel from "../models/Booking.model.js";
import express from "express";
import Razorpay from 'razorpay';
import crypto from 'crypto';
import nodemailer from 'nodemailer'
import { PassThrough } from 'stream';
import { buildInvoicePDF } from "../utils/invoiceGenerator.js";
import dotenv from "dotenv";

dotenv.config()

const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = process.env.SMTP_PORT
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const RAZORPAY_TEST_KEY_ID = process.env.RAZORPAY_TEST_KEY_ID
const RAZORPAY_TEST_KEY_SECRET = process.env.RAZORPAY_TEST_KEY_SECRET



const BookingRouter = express.Router();


const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  auth: {
    user: SMTP_USER,  
    pass: SMTP_PASS,  
  }
});

// Helper Function to send the HTML template
const sendConfirmationEmail = async (userEmail, booking) => {

  const pdfStream = new PassThrough();
  buildInvoicePDF(booking, pdfStream);

  const mailOptions = {
    from: '"QUICK DRIVE" <noreply@quickdrive.com>',
    to: userEmail, 
    subject: `Booking Confirmed! 🚗 Order #${booking._id.toString().slice(-6).toUpperCase()}`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #12141c; color: #ffffff; padding: 30px; border-radius: 12px; max-width: 500px; margin: auto;">
        <h2 style="color: #f59e0b; border-bottom: 1px solid #2d3748; padding-bottom: 10px;">Booking Confirmed!</h2>
        <p>Hi <strong>${booking.user_name}</strong>,</p>
        <p>Great news! Your payment went through successfully and your vehicle reservation is officially locked in.</p>
        
        <div style="background-color: #1a1d26; border: 1px solid #2d3748; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #f59e0b;">Vehicle Specifications</h4>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Car:</strong> ${booking.vehicle_name} ${booking.vehicle_model}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Plate ID:</strong> ${booking.vehicle_number}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Timeline:</strong> ${booking.booking_start} to ${booking.booking_end}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Duration:</strong> ${booking.total_days} Days</p>
        </div>

        <h3 style="color: #34d399; text-align: right; margin: 0;">Total Paid: ₹${booking.total_rent_cost}</h3>
        <p style="font-size: 11px; color: #718096; margin-top: 30px; text-align: center; border-top: 1px solid #2d3748; padding-top: 15px;">
          Thank you for choosing QUICK DRIVE! Please have your license ready at pick-up location: ${booking.available_region || 'Main Terminal'}.
        </p>
      </div>

    `,
    attachments: [
      {
        filename: `Invoice_${booking._id.toString().slice(-6).toUpperCase()}.pdf`,
        content: pdfStream,
        contentType: 'application/pdf'
      }
    ]
  };

  return transporter.sendMail(mailOptions);
};


const razorpay = new Razorpay({
  key_id: RAZORPAY_TEST_KEY_ID, 
  key_secret: RAZORPAY_TEST_KEY_SECRET,
});


BookingRouter.post("/v1/create", async (req, res) => {
  try {
    const { vehicle_id, booking_start, booking_end, total_rent_cost } = req.body;

    const fromDate = new Date(booking_start);
    const returnDate = new Date(booking_end);

    
    const holdBooking = await BookingModel.findOne({
      vehicle_id: vehicle_id,
      booking_start: { $lte: returnDate },
      booking_end: { $gte: fromDate },
      booking_status: "booked"
    });
    
    if (holdBooking) {
      return res.status(400).json({
        success: false,
        available: false,
        message: "Failed to Create Booking",
        error: "These Dates were already Booked!"
      });
    }

    
    const options = {
      amount: Number(total_rent_cost) * 100, 
      currency: "INR",
      receipt: `receipt_book_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      available: true,
      message: "Dates available, Razorpay order created!",
      orderId: order.id,
      amount: order.amount
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to initiate booking payment",
      error: error.message
    });
  }
});


BookingRouter.post("/v1/confirm", async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      bookingData 
    } = req.body;

    
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", RAZORPAY_TEST_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      
      const finalBooking = new BookingModel({
        ...bookingData,
        booking_status: "booked", 
        payment_id: razorpay_payment_id 
      });

      const response = await finalBooking.save();

      const targetUserEmail = req.body.userEmail || "testuser@gmail.com";

      sendConfirmationEmail(targetUserEmail, response)
        .then(() => console.log("Confirmation letter sent to Mailtrap!"))
        .catch(err => console.error("Email service error failed:", err));

      return res.status(201).json({
        success: true,
        message: "Payment verified and booking saved successfully!",
        data: response
      });
    } else {
      return res.status(400).json({ 
        success: false, 
        message: "Payment validation failed: Signature verification mismatch." 
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to finalize booking entry",
      error: error.message
    });
  }
});






BookingRouter.get("/v1/invoice/:bookingId", async (req, res) => {
  try {
    const booking = await BookingModel.findById(req.params.bookingId);
   
    if (!booking) return res.status(404).json({ message: "Transaction record missing" });

    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice_${booking._id}.pdf`);

    // Stream the generated document directly out to the user's browser response engine download pipeline channel!
    buildInvoicePDF(booking, res);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


BookingRouter.get("/v1/", async (req, res) => {
  try {
    const response = await BookingModel.find();
    if (response) {
      res.status(200).json({
        success: true,
        message: "Bookings Fetched Successfully",
        data: response,
      });
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to fetch Bookings",
      error: error.message
    });
  }
});


BookingRouter.post("/v1/booking", async (req, res) => {
  try {
    const response = await BookingModel.find(req.body);
    if (response) {
      res.status(200).json({
        success: true,
        message: "Booking Fetched Successfully",
        data: response,
      });
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to fetch Booking",
      error: error.message
    });
  }
});


BookingRouter.patch("/v1/update/:bookingId", async (req, res) => {
  const { bookingId } = req.params;

  try {
    if (bookingId) {
      const response = await BookingModel.findByIdAndUpdate(
        { _id: new mongoose.Types.ObjectId(bookingId) },
        req.body,
        {
          returnDocument: "after",
          runValidators: true 
        }
      );
      return res.status(200).json({
        success: true,
        message: "Booking updated successfully",
        data: response
      });
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to Update Booking",
      error: error.message
    });
  }
});

BookingRouter.patch("/v1/modify-dates/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { new_start_date, new_end_date, new_total_days, new_total_cost } = req.body;

    
    const currentBooking = await BookingModel.findById(bookingId);
    if (!currentBooking) {
      return res.status(404).json({ success: false, message: "Booking record not found." });
    }

    const vehicleId = currentBooking.vehicle_id;

    
    const overlappingBooking = await BookingModel.findOne({
      _id: { $ne: bookingId }, 
      vehicle_id: vehicleId,
      booking_status: "booked",
      $or: [
        {
          booking_start: { $lte: new_end_date },
          booking_end: { $gte: new_start_date }
        }
      ]
    });

    if (overlappingBooking) {
      return res.status(400).json({
        success: false,
        message: "The vehicle is already reserved by someone else during these new dates. Please pick another timeline."
      });
    }

    
    currentBooking.booking_start = new_start_date;
    currentBooking.booking_end = new_end_date;
    currentBooking.total_days = Number(new_total_days);
    currentBooking.total_rent_cost = Number(new_total_cost);

    await currentBooking.save();

    return res.status(200).json({
      success: true,
      message: "Booking dates updated successfully!",
      data: currentBooking
    });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default BookingRouter;