import express from "express";
import * as dotenv from "dotenv";

import Category from "../mongodb/models/category.js";
import Product from "../mongodb/models/product.js";
import User from "../mongodb/models/user.js";

//image imports
import cloudinary from "cloudinary";
import fs from "fs";
import { promisify } from "util";

dotenv.config();

const app = express.Router();


// configure cloudinary
cloudinary.config({
  cloud_name: 'dzh2hde2n',
  api_key: '692425944689747',
  api_secret: 'WPWBWEFlS8DZ3ND9oohrQQ7A9DM'
});

// helper function to promisify fs.writeFile
const writeFile = promisify(fs.writeFile);

//add product
app.post('/add', async (req, res) => {
  const { name, price, description, company, countInStock, status, category, image } = req.body;

  let imagePath = '';

  try {
  //  Find category by name
     const categoryDoc = await Category.findOne({ name: category });
     if (!categoryDoc) return res.status(400).send('Invalid Category');

    // decode base64 image data and write to file
    const buffer = Buffer.from(image.split(';base64,').pop(), 'base64');
    const fileName = `${Date.now()}.png`;
    const imagePath = `public/uploads/${fileName}`;
    await writeFile(imagePath, buffer);

    // upload image to cloudinary
    const uploadedImage = await cloudinary.uploader.upload(imagePath, {
      folder: 'product-images',
      allowedFormats: ['jpg', 'png'],
      transformation: [{ width: 500, height: 500, crop: 'limit' }]
    });

    // create product object with cloudinary image URL
    const product = new Product({
      status,
      category,
      name,
      description,
      price,
      company,
      image: uploadedImage.secure_url,
      countInStock,
    });

    await product.save();

    res.status(200).json({
      status: 'success',
      message: 'Product data retrieved successfully',
      product,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Server error' });
  } finally {
    // delete the uploaded file from the server
    if (imagePath) {
      fs.unlink(imagePath, (err) => {
        if (err) console.error(err);
      });
    }
  }
});

//update product

app.put('/update/:id', async (req, res) => {
  const { name, price, description, company, countInStock, status, category, image } = req.body;
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(400).send('Invalid Product ID');

     //  Find category by name
     const categoryDoc = await Category.findOne({ name: category });
     if (!categoryDoc) return res.status(400).send('Invalid Category');

    let updatedProduct = {
      status,
      category,
      name,
      description,
      price,
      company,
      countInStock,
    };

    // update the product image if a new image was uploaded
    if (image) {
      // decode base64 image data and write to file
      const buffer = Buffer.from(image.split(';base64,').pop(), 'base64');
      const fileName = `${Date.now()}.png`;
      const imagePath = `public/uploads/${fileName}`;
      await writeFile(imagePath, buffer);

      // upload image to cloudinary
      const uploadedImage = await cloudinary.uploader.upload(imagePath, {
        folder: 'product-images',
        allowedFormats: ['jpg', 'png'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
      });

      // update the product object with the new image URL
      updatedProduct.image = uploadedImage.secure_url;

      // delete the uploaded file from the server
      fs.unlink(imagePath, (err) => {
        if (err) console.error(err);
      });
    }

    // update the product in the database
    await Product.findByIdAndUpdate(productId, updatedProduct);

    res.status(200).json({
      status: 'success',
      message: 'Product updated successfully',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});


//get all products in the system

app.get("/allProducts", async (req, res) => {
  try {
    const product = await Product.find();

    if (!product) {
      res.status(500).json({ success: false });
    }

    res.status(200).json({
      status: "success",
      message: "All products data retrieved successfully",
      product,
    });
  } catch (err) {
    console.error(err);
    res
      .status(200)
      .json({ status: "error", message: "Server error", product: null });
  }
});

//get all products by category name
app.get("/:category", async (req, res) => {
  try {
    var categoryName = req.params.category;

    Category.findOne({ name: categoryName });
    const product = await Product.find({ category: categoryName });

    if (!product) {
      res.status(500).json({ success: false });
    }

    res.status(200).json({
      status: "success",
      message: "All products data retrieved successfully",
      product,
    });
  } catch (err) {
    console.error(err);
    res
      .status(200)
      .json({ status: "error", message: "Server error", product: null });
  }
});

// get all products by company name
app.get("/", async (req, res) => {
  const {company} = req.body;
  try {
    const products = await Product.find({ company });

    if (!products) {
      return res.status(404).json({
        status: "error",
        message: "No products found for this company",
        products: null,
      });
    }

    res.status(200).json({
      status: "success",
      message: "Products retrieved successfully",
      products,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Server error",
      products: null,
    });
  }
});


// get one product by Id
app.get("/:id", async (req, res) => {
  
  try {
    const product = await Product.findOne(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "No products found ",
        products: null,
      });
    }

    res.status(200).json({
      status: "success",
      message: "Products retrieved successfully",
      product,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Server error",
      product: null,
    });
  }
});

//delete product
app.delete("/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndRemove(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: deletedProduct,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


app.get("/get/search", async (req, res) => {
  try {
    const { keyword } = req.body;
    const products = await Product.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    });
    res.status(200).json({
      status: "success",
      message: products.length > 0 ? "products retrieved successfully":"no products were found",
      products: products,
    });
  } catch (err) {
    console.error(err);
    res
      .status(200)
      .json({ status: "error", message: "Server error", products: null });
  }
});



app.get('/inCart/:category', async (req, res) => {
  try {

    var categoryName = req.params.category;

    Category.findOne({ name: categoryName });
    const product = await Product.find({ category: categoryName });

    if (!product) {
      res.status(500).json({ success: false });
    }

    const { nationalId } = req.body;

    // Find the user by nationalId
    const user = await User.findOne({ nationalId });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Get all products
    const products = await Product.find({});

    // Check if each product is in the user's cart / favourite product
    const productsWithStatus = products.map((product) => {
      const inCart = user?.inCart.some((cartItem) => cartItem.product.toString() === product._id.toString());
      const inFavorites = user?.favoriteProducts.some((favoriteProductId) => favoriteProductId.toString() === product._id.toString());

      return {
        ...product.toJSON(),
        inCart,
        inFavorites,
      };
    });

    res.status(200).json({
      status: 'success',
      message: 'Products retrieved successfully',
      products: productsWithStatus,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

export default app;
