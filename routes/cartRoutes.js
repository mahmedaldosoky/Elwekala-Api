import express from "express";
import * as dotenv from "dotenv";

import Cart from "../mongodb/models/cart.js";
import Product from "../mongodb/models/product.js";
import User from "../mongodb/models/user.js";

dotenv.config();

const app = express.Router();

//add cart items

app.post("/", async (req, res) => {
   
        let userId = req.body.userId;
        let user = await User.exists({ _id: userId });
      
        if (!userId || !user)
          return res.status(400).send({ status: false, message: "Invalid user ID" });
      
        let productId = req.body.productId;
        let product = await Product.exists({ _id: productId });
        if (!productId || !product)
          return res.status(400).send({ status: false, message: "Invalid product" });
      
        let cart = await Cart.findOne({ userId: userId });
      
        if (cart) {
          let itemIndex = cart.products.findIndex((p) => p.productId == productId);
      
          if (itemIndex > -1) {
            let productItem = cart.products[itemIndex];
            productItem.quantity += 1;
            cart.products[itemIndex] = productItem;
          } else {
            cart.products.push({ productId: productId, quantity: 1 });
          }
          cart = await cart.save();
          return res.status(200).send({ status: true, updatedCart: cart });
        } else {
          const newCart = await Cart.create({
            userId,
            products: [{ productId: productId, quantity: 1 }],
          });
      
          return res.status(201).send({ status: true, newCart: newCart });
        }
      
  });

  //get cart data
app.get("/", async (req, res) => {
   
        let userId = req.params.userId;
        let user = await User.exists({ _id: userId });
      
        if (!userId || !isValidObjectId(userId) || !user)
          return res.status(400).send({ status: false, message: "Invalid user ID" });
      
        let cart = await Cart.findOne({ userId: userId });
        if (!cart)
          return res
            .status(404)
            .send({ status: false, message: "Cart not found for this user" });
      
        res.status(200).send({ status: true, cart: cart });
      
  });

  //decreaseQuantity

  app.patch("/", async (req, res) => {
    // use add product endpoint for increase quantity
    let userId = req.params.userId;
    let user = await User.exists({ _id: userId });
    let productId = req.body.productId;
  
    if (!userId || !isValidObjectId(userId) || !user)
      return res.status(400).send({ status: false, message: "Invalid user ID" });
  
    let cart = await Cart.findOne({ userId: userId });
    if (!cart)
      return res
        .status(404)
        .send({ status: false, message: "Cart not found for this user" });
  
    let itemIndex = cart.products.findIndex((p) => p.productId == productId);
  
    if (itemIndex > -1) {
      let productItem = cart.products[itemIndex];
      productItem.quantity -= 1;
      cart.products[itemIndex] = productItem;
      cart = await cart.save();
      return res.status(200).send({ status: true, updatedCart: cart });
    }
    res
      .status(400)
      .send({ status: false, message: "Item does not exist in cart" });
  
  });

// removeItem 
  app.delete("/", async (req, res) => {
    let userId = req.params.userId;
    let user = await User.exists({ _id: userId });
    let productId = req.body.productId;
  
    if (!userId || !isValidObjectId(userId) || !user)
      return res.status(400).send({ status: false, message: "Invalid user ID" });
  
    let cart = await Cart.findOne({ userId: userId });
    if (!cart)
      return res
        .status(404)
        .send({ status: false, message: "Cart not found for this user" });
  
    let itemIndex = cart.products.findIndex((p) => p.productId == productId);
    if (itemIndex > -1) {
      cart.products.splice(itemIndex, 1);
      cart = await cart.save();
      return res.status(200).send({ status: true, updatedCart: cart });
    }
    res
      .status(400)
      .send({ status: false, message: "Item does not exist in cart" });
  
  });

export default app;

// const quantity = req.body;
    // Product.findById(req.params.id, function(err, foundProduct){
    //     if(err){
    //         console.log(err);
    //     }
    //     const product = {
    //         item: foundProduct._id,
    //         qty: quantity,
    //         price: foundProduct.price * quantity 
    //     }
    //     // Cart.owner = req.user._id;
    //     Cart.itmes.push(product);
    //     Cart.save();
    //     // res.redirect("/cart");
    // });