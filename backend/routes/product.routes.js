import express from 'express';
import { protectRoute,adminRoute } from '../middlewares/auth.middleware.js';
import { getAllProducts,getFeaturedProducts } from '../controllers/product.controller.js';

const router = express.Router();

router.get("/" , protectRoute , adminRoute , getAllProducts);
router.get("/" , getFeaturedProducts);

export default router;