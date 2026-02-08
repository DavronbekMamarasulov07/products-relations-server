import express from 'express';
import { createCategory, getAllCategories, getProductsById } from '../controllers/categories.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router()


router.post("/", authMiddleware, createCategory);
router.get("/", getAllCategories);
router.get("/:id/products", getProductsById);



export default router
