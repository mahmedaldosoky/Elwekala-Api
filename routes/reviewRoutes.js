import express from "express";
import Review from "../mongodb/models/review.js";
import User from "../mongodb/models/user.js";

const app = express.Router();

// POST a new review
app.post("/", async (req, res) => {
    const { user, productId, title, comment, rating } = req.body;
    try {
      // Check if user exists
      const existingUser = await User.findOne({ nationalId: user });
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      // Create new review
      const review = new Review({
        user: existingUser.nationalId,
        product: productId,
        title,
        comment,
        rating,
      });
      const savedReview = await review.save();
      res.status(200).json({
                status: "success",
                message: "Your Review added successfully",
                savedReview,
              });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error" });
    }
  });


// Get all reviews for a specific product
app.get("/allreviews/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name") // Populate user information with name field
      .sort("-createdAt"); // Sort reviews in descending order by creation date

    res.status(200).json({
      status: "success",
      message: "All reviews for a specific product",
      reviews,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default app;
