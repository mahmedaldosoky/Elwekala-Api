import express from "express";
import * as dotenv from "dotenv";

import Category from "../mongodb/models/category.js";
import Product from "../mongodb/models/product.js";

//import multer from "multer";
// const multer = require("multer");
// import base64Img from 'base64-img';
dotenv.config();

const app = express.Router();

// app.post("/add", async (req, res) => {
//   const { name, price, description, company, countInStock, status, image } = req.body;
//   let {category} = req.body;
//   try {
//      category = await Category.find(req.params.category);
//     if (!category) return res.status(400).send("Invalid Category");

//     const imagePath = base64Img.imgSync(image, '', 'uploads'); // convert the base64 image to a link and save it in the 'uploads' folder

//     const product = new Product({
//       status,
//       category,
//       name,
//       description,
//       price,
//       company,
//       image: imagePath,
//       countInStock,
//     });

//     const savedProduct = await product.save();
//     if (!savedProduct) return res.status(500).send("The product cannot be created");

//     res.status(200).json({
//       status: "success",
//       message: "Product data retrieved successfully",
//       product: savedProduct,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(200).json({ status: "error", message: "Server error", product: null });
//   }
// });

// const FILE_TYPE_MAP = {
//   'image/png': 'png',
//   'image/jpeg': 'jpeg',
//   'image/jpg': 'jpg'
// }

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//       const isValid = FILE_TYPE_MAP[file.mimetype];
//       let uploadError = new Error('invalid image type');

//       if(isValid) {
//           uploadError = null
//       }
//     cb(uploadError, 'public/uploads')
//   },
//   filename: function (req, file, cb) {
      
//     const fileName = file.originalname.split(' ').join('-');
//     const extension = FILE_TYPE_MAP[file.mimetype];
//     cb(null, `${fileName}-${Date.now()}.${extension}`)
//   }
// })

// const uploadOptions = multer({ storage: storage })

// add product
// app.post("/add", uploadOptions.single('image'),  async (req, res) => {
//   const { name, price, description, company, countInStock, status} = req.body;
//   let {category} = req.body;
  
//   try {
//    category = await Category.find({category});
//     if (!category) return res.status(400).send("Invalid Category");

//     const file = req.file;
//     if(!file) return res.status(400).send('No image in the request')

//     const fileName = file.filename
//     const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

//     const product = new Product({
//       status,
//       category,
//       name,
//       description,
//       price,
//       company,
//       image: `${basePath}${fileName}`,// save the path of the uploaded image to the image field in the product schema
//       // images: req.body.images.split(","),
//       countInStock,
//       status,
//     });

//     product = await product.save();

//     if (!product) return res.status(500).send("The product cannot be created");

//     res.status(200).json({
//       status: "success",
//       message: "Product data retrieved successfully",
//       product,
//     });
//   } catch (err) {
//     console.error(err);
//     res
//       .status(200)
//       .json({ status: "error", message: "Server error", product: null });
//   }
// });


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


// // Update product route with image upload
// app.patch( "/update",
// uploadOptions.single('image'), // specify the name of the image field in the request body
//   async (req, res) => {
//     const { status, category, name, price, description, company, countInStock } =
//       req.body;
//     try {
//       const category = await Category.findById(req.body.category);
//     if (!category) return res.status(400).send("Invalid Category");
      

//     const file = req.file;
//     if(!file) return res.status(400).send('No image in the request')

//     const fileName = file.filename
//     const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    
//     const updatedProduct = await Product.findByIdAndUpdate(
//         {
//           status,
//           category,
//           name,
//           price,
//           description,
//           image: `${basePath}${fileName}`, // update the path of the uploaded image in the image field of the product schema
//           // images:req.body.images.split(","),
//           company,
//           countInStock,
//         },
//         { new: true }
//       );
//       if (!updatedProduct) return res.status(500).send("the product cannot be updated!");

//       res.status(200).json({
//         status: "success",
//         message: "Users data retrieved successfully",
//         updatedProduct,
//       });
//       // res.json(updatedProduct);
//     } catch (err) {
//       res.status(400).json({ message: err.message });
//     }
//   }
// );

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






// app.put(
//   '/gallery-images', 
//   uploadOptions.array('images', 10), 
//   async (req, res)=> {
//        const files = req.files
//        let imagesPaths = [];
//        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

//        if(files) {
//           files.map(file =>{
//               imagesPaths.push(`${basePath}${file.filename}`);
//           })
//        }

//        const product = await Product.findByIdAndUpdate(
      
//           {
//               images: imagesPaths
//           },
//           { new: true}
//       )

//       if(!product)
//           return res.status(500).send('the gallery cannot be updated!')

//       res.send(product);
//   }
// )

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

export default app;
