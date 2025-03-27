import { create } from "zustand";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";

export const useCartStore = create((set,get)=>({
    cart:[],
    coupon:null,
    total:0,
    subtotal:0,

    getCartItems: async() =>{
        try {
            const res = await axios.get("/cart");
            set({cart: res.data});
        } catch (error) {
            set({cart:[]});
            toast.error(error.res.data.message || "An error occurred");
        }
    },
    addToCart: async() =>{
        
    }
}))