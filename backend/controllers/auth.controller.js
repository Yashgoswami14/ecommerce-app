import { redis } from "../lib/redis.js";
import User from "../models/user.model.js"
import jwt from "jsonwebtoken"

const generateTokens = (userId)=>{
    const accessToken = jwt.sign({userId},process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:"15m"
    });

    const refreshToken = jwt.sign({userId},process.env.REFRESH_TOKEN_SECRET,{
        expiresIn:"7d"
    });
    return {accessToken,refreshToken};
}

const storeRefreshToken = async (userId,refreshToken)=>{
    await redis.set(`refresh_token:${userId}`,refreshToken,"EX",7 * 24 * 60 * 60) //7 days
}

const setCookies = (res,accessToken,refreshToken)=>{
    res.cookie(
        "accessToken",accessToken,{
            httpOnly: true, // prevent XSS attacks, cross site scripting attack
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict", // prevents CSRF attack, cross-site request forgery attack
            maxAge: 15 * 60 * 1000, // 15 minutes
        }
    );
    res.cookie(
        "refreshToken",refreshToken,{
            httpOnly: true, // prevent XSS attacks, cross site scripting attack
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict", // prevents CSRF attack, cross-site request forgery attack
            maxAge: 7 * 24 * 60 * 60 * 1000, // 15 minutes
        }
    );
}

export const signup = async (req,res)=>{
    try {
        const {email, password, name} = req.body;
    
        const userExist = await User.findOne({email});
        if(userExist){
            return res.status(400).json({message: "User already exists"})
        }
    
        const user = await User.create({email,name,password});

        //authentication --> jwt Tokens
        const {accessToken,refreshToken} = generateTokens(user._id);
        await storeRefreshToken(user._id,refreshToken);

        setCookies(res,accessToken,refreshToken);

        const createdUser = await User.findById(user._id).select(
            "-password"
        )
    
        res.status(201).json({createdUser,message:"user created successfully"});
    } catch (error) {
        console.log("error in signup controller: ",error.message);
        res.status(500).json({message:error.message});
    }
}

export const login = async (req,res)=>{
    try {
        const {email,password} = req.body;
        const user = await User.findOne({email})

        console.log(user);

        if(user && (await user.comparePassword(password))){
            const { accessToken, refreshToken } = generateTokens(user._id);

            await storeRefreshToken(user._id,refreshToken);

            setCookies(res,accessToken,refreshToken);

            res.json({
                _id:user._id,
                name:user.name,
                email:user.email,
                role:user.role,
                message:"Login Successfully"
            });
        }
        else{
            res.status(401).json({message:"invalid email or password."});
        }
    } catch (error) {
        console.log("error in login controller: ",error.message);
        res.status(500).json({message: error.message})
    }
}

export const logout = async (req,res)=>{
    try {
        const refreshToken = req.cookies.refreshToken;
        if(refreshToken){
            const decodedToken = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET);
            await redis.del(`refresh_token:${decodedToken.userId}`)
        }

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.json({message:"log out successfully"})
    } catch (error) {
        console.log("error in logout controller: ",error.message)
        res.status(500).json({message:"server error",error:error.message}); 
    }
}

export const refreshToken = async (req,res)=>{
    try {
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken){
            return res.status(401).json({message:"no refresh token provided."})
        }

        const decodedToken = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET);
        const storedToken = await redis.get(`refresh_token:${decodedToken.userId}`);

        if(storedToken !== refreshToken){
            return res.status(401).json({message:"Invalid refresh Token"});
        }

        const accessToken = jwt.sign({userId: decodedToken.userId}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "15m"});

        res.cookie("accessToken",accessToken,{
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15*60*1000,
        });
        
        res.json({message:"Token refreshed successfully"});
    } catch (error) {
        console.log("error in refreshToken controller", error.message);
        res.status(500).json({message:"Server Error",error:error.message})
    }
}

export const getProfile = async(req,res)=>{
    try {
        res.json(req.user);
    } catch (error) {
        res.status(500).json({message:"Server error", error:error.message});
    }
}