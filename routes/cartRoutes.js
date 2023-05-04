import express from "express";
import * as dotenv from "dotenv";

// import Cart from "../mongodb/models/cart.js";
import User from "../mongodb/models/user.js";
import Product from "../mongodb/models/product.js";
dotenv.config();

const app = express.Router();

// Add product to cart
app.post("/add", async (req, res) => {
  const { nationalId, productId, quantity } = req.body;

  try {
    // Find the user by their national ID
    const user = await User.findOne({ nationalId });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the product by its ID
    const product = await Product.findById(productId);

    // Check if the product exists
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if the product is already in the user's cart
    const existingItem = user.inCart.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      // If the product already exists, update the quantity
      existingItem.quantity += parseInt(quantity, 10);
    } else {
      // If the product is not already in the cart, add it as a new item
      const newItem = {
        product: product._id,
        quantity: parseInt(quantity, 10),
      };
      user.inCart.push(newItem);
    }

    // Save the updated user document
    await user.save();

    return res
      .status(200)
      .json({ message: "Product added to cart successfully", user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// GET /cart route to get all products in cart with total price
app.get('/allProducts', async (req, res) => {
  try {
    // Find the user by their national ID
    const user = await User.findOne({ nationalId: req.body.nationalId }).populate('inCart.product');

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate the total price and quantity of each product in the user's cart
    const cartItems = user.inCart.map(item => {
      const product = item.product;
      const totalPrice = product.price * item.quantity;
      return {
        ...product.toObject(),
        quantity: item.quantity,
        totalPrice,
      };
    });

    return res.status(200).json({ products: cartItems });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});






// app.get("/allProducts", async (req, res) => {
//   const { nationalId } = req.body;

//   try {
//     const user = await User.findOne({ nationalId });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

    
//     res.status(200).json({
//       status: "success",
//       message: "All Products ",
//       inCart: user.inCart,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// app.delete('/delete', async (req, res) => {
//   try {
//     const { nationalId, productId } = req.body;

//     // Find the user by ID
//     const user = await User.findOne({ nationalId });
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Remove the product from the inCart array
//     const cartIndex = user.inCart.indexOf(productId);
//     if (cartIndex !== -1) {
//       user.inCart.splice(cartIndex, 1);
//     }

//     // Save the updated user object
//     const updatedUser = await user.save();
//     if (!updatedUser) {
//       return res.status(500).json({ message: 'Failed to update user' });
//     }

//     // res.status(200).json({ message: 'Product removed from cart' });
//     res.status(200).json({
//       status: "success",
//       message: "Product removed from cart",
//       inCart: user.inCart
//    });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

app.delete("/", async (req, res) => {
  const { nationalId, productId } = req.body;

  try {
    const user = await User.findOne({ nationalId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const cartItemIndex = user.inCart.findIndex(
      (item) => item.product.toString() === productId
    );
    if (cartItemIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    user.inCart.splice(cartItemIndex, 1);

    const updatedUser = await user.save();

    res.status(200).json(updatedUser.inCart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// delete route to remove product from inCart array in user schema nodejs and mongodb
// app.delete('/', async (req, res) => {
//   const { nationalId, productId } = req.body;

//   try {
//     const user = await User.findOne({nationalId});

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
// console.log(user.nationalId);
//   //  const incartIndex = user.inCart.findIndex((id) => id.toString() === productId);
//   //   if (incartIndex === -1) {
//   //     return res.status(404).json({ message: 'Product not found in cart' });
//   //   }
//   console.log(user.inCart);
// console.log(productId);
//   if (!user.inCart || !user.inCart.includes(productId)) {
//     return res
//       .status(200)
//       .json({ status: "failure", message: "Product not found in cart" });
//   }
// console.log(productId);
//     // user.incart.splice(incartIndex, 1);

//     user.inCart = user.inCart.filter(
//       (id) => id.toString() !== productId
//     );
//     console.log("saccccccccccccccccccccccccccccc");
// console.log(productId);
//     await user.save();
//     console.log(user.inCart);

//     return res.json(user.inCart);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// });
// app.delete('/delete', (req, res) => {
//   const { userId, productId } = req.body;

//   User.updateOne({ _id: userId }, { $pull: { incart: { product: productId } } })
//     .then(result => {

//       res.status(200).json({
//         status: "success",
//         message: "Product removed to cart",
//      });
//     })
//     .catch(err => {
//       res.status(500).json({
//         error: err
//       });
//     });
// });
export default app;

// Add product to cart
// app.post("/add", async (req, res) => {
//   const { userId, productId, quantity } = req.body;
//   const cartItem = { productId, quantity };
//   const cart = await Cart.findOneAndUpdate(
//     { userId },
//     { $push: { products: cartItem } },
//     { upsert: true, new: true }
//   );
//   res.status(200).json({
//     status: "success",
//     message: "Cart data added successfully",
//     cart,
//   });
// });

// // Endpoint to get all products in the cart for a given user
// app.get("/", async (req, res) => {
//   const { userId } = req.body;
//   const cart = await Cart.findOne({ userId }).populate("products.productId");
//   // res.json(cart.products);
//   res.status(200).json({
//     status: "success",
//     message: "Cart data retrieved successfully",
//     cart: cart.products,
//   });
// });

// // Endpoint to remove a product from the cart for a given user
// app.delete("/", async (req, res) => {
//   const { userId, productId } = req.body;
//   const cart = await Cart.findOneAndUpdate(
//     { userId },
//     { $pull: { products: { productId } } },
//     { new: true }
//   );
//   res.status(200).json({
//     status: "success",
//     message: "Cart data deleted successfully",
//     cart,
//   });
// });
// //updateQuantity
// app.put('/',async (req, res) => {
//   const { quantity, productId } = req.body;
//   const cart = await Cart.findOneAndUpdate(
//     { productId },
//     { $set: { quantity: quantity } },
//     { new: true }
//   )
//     .then(updatedItem => {
//       if (!updatedItem) {
//         return res.status(404).json({ error: 'Cart item not found' });
//       }
//       res.status(200).json({
//         status: "success",
//         message: "cart item updated successfully",
//       });
//     })
//     .catch(error => {
//       console.error(error);
//       res.status(500).json({ error: 'Server error' });
//     });
// });

// // check if product added to the cart

// // app.put("/incart", async (req, res) => {
// //   const { userId, productId} = req.body;

// //   const user = await User.findOne({ _id: userId });

// // const isProductInCart = user.cart.includes(productId);

// // console.log('Product is in user\'s cart:', isProductInCart);

// // user.cart.push(productId);

// // await user.save();
// // });
