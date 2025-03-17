import Product from "../models/product.model.js"
import { redis } from "../lib/redis.js";

export const getAllProducts = async(req,res)=>{
    try {
        const products = await Product.find({});
        res.json({products});
    } catch (error) {
        console.log("error in getAllProduct controller ",error.message);
        res.status(500).json({message:"server error", error:error.message});
    }
}

export const getFeaturedProducts = async(req,res)=>{
    try {
        let featuredProducts = await redis.get("featured_products");
        if(featuredProducts){
            return res.json(JSON.parse(featuredProducts));
        }

        //if not in redis, fetch from mongodb
        //lean function return plain javascript object instead of mongodb document which is good for performance.
        featuredProducts = await Product.find({isFeatured:true}).lean();

        if(!featuredProducts){
            return res.status(404).json({message:"no featured products found"});
        }

        await redis.set("featured_products",JSON.stringify(featuredProducts));

        res.json(featuredProducts);
    } catch (error) {
        console.log("error in getFeaturedProduct controller ",error.message);
        res.status(500).json({message:"server error", error:error.message});
    }
}