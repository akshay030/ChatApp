//signup new user

import cloudinary from "../lib/cloudinary.js"
import { genrateToken } from "../lib/utils.js"
import User from "../models/User.js"

import bcrypt from 'bcryptjs'


export const signUp = async(req,res)=>{
    const {fullName,email,password,bio}=req.body
    try {
        if(!fullName || !email || !password ||!bio){
            return res.json({success:false,message:"Missing Details"})
        }
        const user = await User.findOne({email})
        if(user){
            return res.json({success:false,message:"Account already exists"})

        }
        const salt= await bcrypt.genSalt(10)
        const hashedPassword= await bcrypt.hash(password,salt)
        const newUser= await User.create({
            fullName,email,password:hashedPassword,bio
        })
        const token=genrateToken(newUser._id)
        res.json({success:true,userData:newUser,token,message:"Account created successfully!"})
    } catch (error) {
       // console.log(error);
        
                res.json({success:false,message:error.message})

    }
}



export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await User.findOne({ email });
    if (!userData) return res.json({ success: false, message: "Invalid credentials" });

    const isPasswordCorrect = await bcrypt.compare(password, userData.password);
    if (!isPasswordCorrect)
      return res.json({ success: false, message: "Invalid credentials" });

    const token = genrateToken(userData._id);
    res.json({ success: true, userData, token, message: "Login successful!" }); // ✅ ADD THIS
  } catch (error) {
  //  console.log(error);
    res.json({ success: false, message: error.message });
  }
};


export const checkAuth= async(req,res)=>{
    res.json({success:true,user:req.user})
}

export const updateProfile = async (req, res) => {
  try {
    const { profilePic, bio, fullName } = req.body;
    const userId = req.user._id;
    let updatedUser;

    if (!profilePic) {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { bio, fullName },
        { new: true }
      );
    } else {
      const upload = await cloudinary.uploader.upload(profilePic);
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: upload.secure_url, bio, fullName },
        { new: true }
      );
    }

    res.json({ success: true, user: updatedUser });
  } catch (error) {
   // console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
