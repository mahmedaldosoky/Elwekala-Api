const mongoose = require("mongoose");

// mongodb://127.0.0.1/elwekalaDB
mongoose
  .connect(
    "mongodb+srv://admin:mko%40123@cluster0.bblcdc0.mongodb.net/elwekalaDB?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

const userSchema = new mongoose.Schema({
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
});

module.exports = mongoose.model("User", userSchema);
