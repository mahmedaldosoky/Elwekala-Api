import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: function (phone) {
        return /^01\d{9}$/.test(phone);
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
  nationalId: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (nationalId) {
        return /^\d{14}$/.test(nationalId);
      },
      message: (props) => `${props.value} is not a valid national ID!`,
    },
  },
  gender: {
    type: String,
    enum: ["male", "female"],
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  token: {
    type: String,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  // favProducts: [{
  //   _Id:{
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "Product",
  //   },
  //   type: Boolean,
  //   default: false,
  //    }],
  inCart:[{
   product_Id:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    type: Boolean,
    default: false,
     }],
});

// userSchema.virtual('id').get(function () {
//   return this._id.toHexString();
// });

// userSchema.set('toJSON', {
//   virtuals: true,
// });

export default mongoose.model("User", userSchema);