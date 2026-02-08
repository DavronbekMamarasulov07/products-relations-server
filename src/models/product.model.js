import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: { type: String, trim: true, required: true },
  price: { type: Number, required: true, min: 0 },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
}, {
    versionKey: false,
    timestamps:true
});

export const Product = mongoose.model("Product", productSchema)