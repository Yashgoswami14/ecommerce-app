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
        res.status(500).json({message:error.message});
    }
}

export const login = async (req,res)=>{
    res.send("login route called")
}

export const logout = async (req,res)=>{
    res.send("logout route called")
}