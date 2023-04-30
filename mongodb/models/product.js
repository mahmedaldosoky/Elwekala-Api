import mongoose from "mongoose";

const productSchema = mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.String,
    ref: "category",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
    
  },
  image: {
    type: String,
    default:''
  },
//  images: [{
//     type: String,
//  }],
 company: {
    type: String,
 },
 quantity: {
  type: Number,
  default: 1,
 },
 countInStock: {
    type: Number,
    required: true,
    min:0,
    max:500,
 },
});

// var idNum = parseInt(objectId.valueOf(), 16);
// productSchema.virtual('id').get(function () {
//   return this.id;
// });

// productSchema.set('toJSON', {
//   virtuals: true,
// });

export default mongoose.model("Product", productSchema);
