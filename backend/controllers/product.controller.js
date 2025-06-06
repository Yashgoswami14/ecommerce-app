import Product from "../models/product.model.js"
import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js"

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

export const createProduct = async(req,res)=>{
    try {
        const {name,description,price,image,category} = req.body;

        let cloudinaryResponse = null;

        if(image){
            cloudinaryResponse = await cloudinary.uploader.upload(image,{folder:"products"});
        }
        
        const product = await Product.create({
            name,
            description,
            price,
            image: cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url: "",
            category
        })

        res.status(201).json(product);
    } catch (error) {
        console.log("error in createProduct controller: ",error.message);
        res.status(401).json({message:"server error",error:error.message})
    }
}

export const deleteProduct = async(req,res)=>{
    try {
        const product = await Product.findById(req.params.id);
        if(!product){
            return res.status(404).json({message:"product not found"});   
        }

        if(product.image){
            const publicId = product.image.split("/").pop().split(".")[0];
            try {
                await cloudinary.uploader.destroy(`products/${publicId}`);
                console.log("deleted image from cloudinary");
            } catch (error) {
                console.log("error in deleteProduct from cloudinary controller: ",error.message);
            }
        }

        await Product.findByIdAndDelete(req.params.id);

        res.json({message:"product deleted successfully."});
    } catch (error) {
        console.log("error in deleteProduct controller.");
        res.status(500).json({message:"server error",error:error.message});
    }
}

export const getRecommendedProduct = async(req,res)=>{
    try {
        const products = await Product.aggregate([
            {
            $sample: {size:4}
            },
            {
                $project:{
                    _id:1,
                    name:1,
                    description:1,
                    image:1,
                    price:1
                }
            }
        ])

        res.json(products);
    } catch (error) {
        console.log("error in getRecommendedProduct controller: ",error.message);
        res.status(500).json({message:"server error",error:error.message});
    }
}

export const getProductsByCategory = async(req,res)=>{
    const {category} = req.params;
    try {
        const products = await Product.find({category});

        res.json({products});
    } catch (error) {
        console.log("error in getProductByCategory controller: ",error.message);
        res.status(500).json({message:"server errro"})
    }
}

export const toggleFeaturedProduct = async(req,res)=>{
    try {
        const product = await Product.findById(req.params.id);
        if(product){
            product.isFeatured = !product.isFeatured;
            const updateProduct = await product.save();
            await updateFeaturedProductCache();
            res.json(updateProduct);
        }else{
            res.status(404).json({message:"product not found"});
        }
    } catch (error) {
        console.log("error in toggleFeaturedProduct controller: ",error.message);
        res.status(500).json({message:"server error",error:error.message});
    }
}

async function updateFeaturedProductCache(){
    try {
        const featuredProducts = await Product.find({isFeatured:true}).lean();

        await redis.set("featured_products",JSON.stringify(featuredProducts));
    } catch (error) {
        console.log("error in update cache function: ",error.message);
    }
}