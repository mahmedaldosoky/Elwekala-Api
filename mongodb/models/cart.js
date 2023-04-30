import mongoose from "mongoose";

const itemSchema = mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  quantity: {
    type: Number,
    default: 0,
  },
});

const cartSchema = mongoose.Schema({
  products: [itemSchema],
  email: {
    type: mongoose.Schema.Types.String,
    ref: "User",
  },
  total: {
    type: Number,
    default: 0,
  },
  __v: { type: Number, select: false },
});

export default mongoose.model("Cart", cartSchema);


















// import mongoose from "mongoose";

// let ItemSchema = mongoose.Schema ({
//     itemId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Product",
//     },
//     quantity: {
//         type: Number,
//         required: true,
//         min: [1, 'Quantity can not be less then 1.']
//     },
//     price: {
//         type: Number,
//         required: true
//     },
//     name:{
//         type: String,
//         required: true
//     },
//     // total: {
//     //     type: Number,
//     //     required: true,
//     // }
// });

// const cartSchema = mongoose.Schema({
//     items: [ItemSchema],
//     bill: {
//         default: 0,
//         type: Number
//     }
// });

// export default mongoose.model("Cart", cartSchema);

// const cartSchema = mongoose.Schema({
//   totalPrice: {
//     type: Number,
//     default: 0,
//   },
//   products: [
//     {
//       product: {
//         type: mongoose.Schema.Types.ObjectID,
//         ref: "Product",
//       },
//       qty: {
//         type: Number,
//         default: 1,
//       },
//       price: {
//         type: Number,
//         default: 0,
//       },
//     },
//   ],
// });

// export default mongoose.model("Cart", cartSchema);
