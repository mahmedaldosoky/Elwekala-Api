import express from "express";
import * as dotenv from "dotenv";

import Cart from "../mongodb/models/cart.js";
import Product from "../mongodb/models/product.js";
import User from "../mongodb/models/user.js";

dotenv.config();

const app = express.Router();

//add cart items

app.post("/", async (req, res) => {
  const { email, productId } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.inCart.includes(productId)) {
    return res.status(400).json({ message: "Product already added" });
  }

  const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
        // let productId = req.body.productId;
        // let product = await Product.exists({ _id: productId });
        // if (!productId || !product)
        //   return res.status(400).send({ status: false, message: "Invalid product" });
      
        const cart = await Cart.findOne({ email});
      
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
            email,
            products: [{ productId: productId, quantity: 1 }],
          });
      
          return res.status(201).send({ status: true, newCart: newCart });
        }
      
  });

  //get cart data
app.get("/", async (req, res) => {
   
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

      
        let cart = await Cart.findOne({ email});
        if (!cart)
          return res
            .status(404)
            .send({ status: false, message: "Cart not found for this user" });
      
        res.status(200).send({ status: true, cart: cart });
      
  });

  //decreaseQuantity

  app.patch("/", async (req, res) => {
    // use add product endpoint for increase quantity
    const { email, productId } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
  
    let cart = await Cart.findOne({ email });
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
    const { email, productId } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
  
  
    let cart = await Cart.findOne({ email});
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