import {create} from "zustand";
import axios from "../lib/axios.js";
import {toast} from "react-hot-toast";

export const useUserStore = create((get,set) => ({
    user:null,
    loading:false,
    checkAuth:true,
    signup: async({name,email,password,confirmPassword}) => {
        set({loading:true});

        if(password !== confirmPassword){
            set({loading:false});
            return toast.error("password do not match.");
        }

        try {
            const res = await axios.post("/auth/signup",{name,email,password});
            set({user:res.data,loading:false});
            toast.success("user created successfully.")
        } catch (error) {
            set({loading:false});
            toast.error(error.response.data.message || "An error occured.");
        }
    },
    login: async(email,password) => {
        set({loading:true});

        try {
            const res = await axios.post("/auth/login",{email,password});
            console.log("user is here: ",res.data);
            set({ user :  res.data,loading:false});
            toast.success("Login Succssfully.");
        } catch (error) {
            set({loading:false});
            toast.error(error.response.data.message || "An error occured.");
        }
    },
}))