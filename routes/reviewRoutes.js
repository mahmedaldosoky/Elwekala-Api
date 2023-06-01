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

    savedReview.profileImage = existingUser.profileImage;
    savedReview.userName = existingUser.name;

    res.status(200).json({
      status: "success",
      message: "Your review was added successfully",
      savedReview: {
        user: savedReview.user,
        profileImage: savedReview.profileImage,
        userName: savedReview.userName,
        product: savedReview.product,
        title: savedReview.title,
        comment: savedReview.comment,
        rating: savedReview.rating,
        _id: savedReview._id,
        createdAt: savedReview.createdAt,
        updatedAt: savedReview.updatedAt,
      },
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
      .sort("-createdAt"); // Sort reviews in descending order by creation date

    const reviewsWithUserInfo = await Promise.all(reviews.map(async (review) => {
      const user = await User.findOne({ nationalId: review.user });
      return {
        _id: review._id,
        user: {
          name: user.name,
          profileImage: user.profileImage,
        },
        product: review.product,
        title: review.title,
        comment: review.comment,
        rating: review.rating,
        createdAt: review.createdAt,
      };
    }));

    res.status(200).json({
      status: "success",
      message: "All reviews for a specific product",
      reviews: reviewsWithUserInfo,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default app;
