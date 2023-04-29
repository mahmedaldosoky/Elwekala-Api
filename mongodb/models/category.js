import mongoose from "mongoose";

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
      },  

});

// var idNum = parseInt(objectId.valueOf(), 16);

// categorySchema.virtual('id').get(function () {
//     return this.id;
// });

// categorySchema.set('toJSON', {
//     virtuals: true,
// });

export default mongoose.model("Category", categorySchema);