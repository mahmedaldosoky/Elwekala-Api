import User from '../mongodb/models/user.js';
import Report from '../mongodb/models/report.js';
import express from "express";
import * as dotenv from "dotenv";

dotenv.config();

const app = express.Router();
// Route handler for submitting a report
    app.post("/", async (req, res) => {
        const { nationalId, problem } = req.body;
        try {
          // Check if user exists
          const existingUser = await User.findOne({ nationalId });
          if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
          }
          
          // Create a new report
          const report = new Report({
            user: existingUser.nationalId,
            problem,
          });
          await report.save();
      
          // Return the response with the report details including user name and image
          res.status(200).json({
            message: "Report submitted successfully",
            nationalId: existingUser.nationalId,
            userName: existingUser.name,
            problem,
            profileImage: existingUser.profileImage,
          });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: "Server Error" });
        }
      });

  // Route handler for admin access to reportst
  app.get("/admin", async (req, res) => {
    try {
      const reports = await Report.find();
  
      const formattedReports = await Promise.all(reports.map(async (report) => {
        const user = await User.findOne({ nationalId: report.user });
  
        return {
          _id: report._id,
          user: {
            nationalId: report.user,
            name: user ? user.name : null,
            profileImage: user ? user.profileImage : null,
          },
          problem: report.problem,
          timestamp: report.timestamp,
        };
      }));
  
      res.status(200).json({
        message: "Reports retrieved successfully",
        reports: formattedReports,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error" });
    }
  });
  export default app;