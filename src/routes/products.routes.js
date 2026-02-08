import express from 'express';
import { createProduct, getAllProducts } from '../controllers/products.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router()



router.post('/',authMiddleware, createProduct)
router.get("/", getAllProducts);



export default router
