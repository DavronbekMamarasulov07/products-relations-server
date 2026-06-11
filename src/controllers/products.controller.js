import { Category } from "../models/category.model.js";
import { Product } from "../models/product.model.js"
import { notifyNewProduct } from "../bot/notifier.js";


const createProduct = async (req, res) => {
    try {
        const { title, price, categoryId } = req.body
        
        if (!title || !price || !categoryId) {
            return res.status(400).json({
              message: "All fields must be filled. Title, price and categoryId!",
            });
        }

        const category = await Category.findById(categoryId)
        
        if (!category) {
          return res.status(404).json({ message: "Category not found!" });
        }

        const newProduct = await Product.create({
            title,price, category: category._id
        })

        // Adminlarga Telegram orqali xabar yuborish
        notifyNewProduct(newProduct);

        res.status(201).json({product: newProduct})

        
    } catch (error) {
        console.log(error)
        res.status(500).json({
          message: `Server unexpected error: ${error}`,
        });
    }
}


const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate("category", "name")

        if (!products) {
            return res.status(404).json({
                message: "Products not found!"
            })
        }

        res.status(200).json({
            products
        })
    } catch (error) {
         console.log(error);
         res.status(500).json({
           message: `Server unexpected error: ${error}`,
         });
    }
}



export { createProduct, getAllProducts };