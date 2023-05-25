import express from "express";
import * as dotenv from "dotenv";
import User from "../mongodb/models/user.js";
import Message from "../mongodb/models/message.js";

dotenv.config();
const app = express.Router();

// Create a new message
app.post("/", async (req, res) => {
  try {
    const { senderNationalId, receiverNationalId, content } = req.body;
    const message = await Message.create({
      senderNationalId,
      receiverNationalId,
      content,
    });
    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all messages between two users
app.get("/", async (req, res) => {
  try {
    const { senderNationalId, receiverNationalId } = req.body;
    const messages = await Message.find({
      $or: [
        {
          senderNationalId: senderNationalId,
          receiverNationalId: receiverNationalId,
        },
        {
          senderNationalId: receiverNationalId,
          receiverNationalId: senderNationalId,
        },
      ],
    })
      .sort({ timestamp: 1 }) // Sort messages by timestamp in ascending order
      .exec();
    // const messages = await Message.find();

    res.json({ messages: messages });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get a specific message by ID
app.get("/:id", async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    res.json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a message
app.put("/:id", async (req, res) => {
  try {
    const { content } = req.body;
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { content },
      { new: true }
    );
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    res.json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a message
app.delete("/:id", async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    res.sendStatus(204);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default app;
