import { create } from "zustand";
import axios from "../lib/axios.js";
import { toast } from "react-hot-toast";

export const useUserStore = create((set) => ({
    user: null,  // Initialize user as null
    loading: false,
    checkingAuth: true,
    signup: async ({ name, email, password, confirmPassword }) => {
        set({ loading: true });

        if (password !== confirmPassword) {
            set({ loading: false });
            return toast.error("Password does not match.");
        }

        try {
            const res = await axios.post("/auth/signup", { name, email, password });
            set({ user: res.data, loading: false });
            toast.success("User created successfully.");
        } catch (error) {
            set({ loading: false });
            toast.error(error.response?.data?.message || "An error occurred.");
        }
    },
    login: async (email, password) => {
        set({ loading: true });

        try {
            const res = await axios.post("/auth/login", { email, password });
            set({ user: res.data, loading: false });
            toast.success("Login Successful.");
        } catch (error) {
            set({ loading: false });
            toast.error(error.response?.data?.message || "An error occurred.");
        }
    },
    logout: async() => {
        try {
            await axios.post("/auth/logout");
            set({user:null});
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occured during logout.")
        }
    },
    checkAuth: async() => {
        set({checkingAuth:true});
        try {
            const response = await axios.get("/auth/profile");
            set({user: response.data, checkingAuth:false});
        } catch (error) {
            set({checkingAuth:false,user: null});
        }
    },
}));
