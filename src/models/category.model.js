import mongoose from "mongoose";


const categorySchema = new mongoose.Schema({
    name: { type: String, trim: true, required:true, unique: true}
}, {
    versionKey: false,
    timestamps: true
})

export const Category = mongoose.model("Category", categorySchema)