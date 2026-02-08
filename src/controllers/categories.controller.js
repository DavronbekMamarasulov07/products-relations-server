import { Category } from "../models/category.model.js";
import { Product } from "../models/product.model.js";

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Category name is required",
      });
    }

    const existingCategory = await Category.findOne({ name });

    if (existingCategory) {
      return res.status(409).json({
        message: "This category already exists",
      });
    }

    const newCategory = await Category.create({
      name,
    });

    res.status(201).json(newCategory);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: `Server unexpected error: ${error}`,
    });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    if (!categories) {
      return res.status(404).json({
        message: "Categories not found",
      });
    }

    res.status(200).json({
      categories,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: `Server unexpected error: ${error}`,
    });
  }
};

const getProductsById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({
        message: "Category id is required!",
      });
    }

      const products = await Product.find({ category: id });
      
      if (!products) {
          return res.status(404).json({
            message: "Products not found",
          });
        }
    res.status(200).json({ products });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: `Server unexpected error: ${error}`,
    });
  }
};



export { createCategory, getAllCategories, getProductsById };
