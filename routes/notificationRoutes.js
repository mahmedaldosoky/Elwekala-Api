import express from "express";
import * as dotenv from "dotenv";
import Notification from "../mongodb/models/notification.js";

dotenv.config();

const app = express.Router();

// POST route for adding a notification
app.post("/", async (req, res) => {
  try {
    // Extract the notification data from the request body
    const { text } = req.body;

    // Create a new notification instance
    const notification = new Notification({ text });

    // Save the notification to the database
    await notification.save();

    // Return a success response
    res.status(200).json({
      status: "success",
      message: "Notification added successfully",
      notification,
    });
    
  } catch (error) {
    // Return an error response if there is any issue
    res
      .status(500)
      .json({ error: "An error occurred while adding the notification" });
  }
});

// GET route for retrieving notifications
app.get("/", async (req, res) => {
  try {
    // Query the database to get all notifications
    const notifications = await Notification.find();

    // Return the retrieved notifications
    res.status(200).json({ notifications: notifications });
  } catch (error) {
    // Return an error response if there is any issue
    res
      .status(500)
      .json({ error: "An error occurred while retrieving notifications" });
  }
});

// DELETE route for deleting a notification
app.delete('/:id', async (req, res) => {
  try {
    // Extract the notification ID from the request parameters
    const { id } = req.params;

    // Find the notification by ID and delete it
    const deletedNotification = await Notification.findByIdAndDelete(id);

    // Check if the notification was found and deleted
    if (!deletedNotification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Return a success response
    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    // Return an error response if there is any issue
    res.status(500).json({ error: 'An error occurred while deleting the notification' });
  }
});

export default app;
