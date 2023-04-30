import mongoose from "mongoose";


const cartSchema = mongoose.Schema ({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        default: 1
      }
    }
  ]
});

export default mongoose.model("Cart", cartSchema);











// // import mongoose from "mongoose";

// // let ItemSchema = mongoose.Schema ({
// //     itemId: {
// //         type: mongoose.Schema.Types.ObjectId,
// //         ref: "Product",
// //     },
// //     quantity: {
// //         type: Number,
// //         required: true,
// //         min: [1, 'Quantity can not be less then 1.']
// //     },
// //     price: {
// //         type: Number,
// //         required: true
// //     },
// //     name:{
// //         type: String,
// //         required: true
// //     },
// //     // total: {
// //     //     type: Number,
// //     //     required: true,
// //     // }
// // });

// // const cartSchema = mongoose.Schema({
// //     items: [ItemSchema],
// //     bill: {
// //         default: 0,
// //         type: Number
// //     }
// // });

// // export default mongoose.model("Cart", cartSchema);

// // const cartSchema = mongoose.Schema({
// //   totalPrice: {
// //     type: Number,
// //     default: 0,
// //   },
// //   products: [
// //     {
// //       product: {
// //         type: mongoose.Schema.Types.ObjectID,
// //         ref: "Product",
// //       },
// //       qty: {
// //         type: Number,
// //         default: 1,
// //       },
// //       price: {
// //         type: Number,
// //         default: 0,
// //       },
// //     },
// //   ],
// // });

// // export default mongoose.model("Cart", cartSchema);
