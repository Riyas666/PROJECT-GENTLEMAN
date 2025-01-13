const User = require("../../models/userSchema")
const nodemailer = require("nodemailer")
const bcrypt = require("bcrypt")
const env = require("dotenv").config()
const session = require("express-session")



//FOR GENERATING THE OTP
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}


//SEND THE OTP TO THE MAIL
const sendVerificationEmail = async(email,otp) =>{
    try{
        const transporter = nodemailer.createTransport({
            service: "gmail",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.NODEMAILER_EMAIL,
                pass: process.env.NODEMAILER_PASSWORD,
            },
            
        });

        const mailOptions = {
            from:process.env.NODEMAILER_EMAIL,
            to:email,
            subject:"Your OTP for Password Reset",
            text:`Your OTP is ${otp}`,
            html: `<b><h4>Your OTP: ${otp}</h4></b>`,
        }

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.messageId)
        return info.accepted.length>0;
    }catch(error){
        console.error("Error Sending Email", error)
        return false;
    }
}



//FOR FORGOT PASSWORD
const forgotPassword = async(req,res) =>{
    try{
            res.render("forgotpassword")
        
    }catch(error){
        res.redirect("/pageNotFound");
    }
}


//THIS IS THE WORKING OF THE FORGOT PASSWORD
const forgotEmailValid = async(req, res) =>{
    try{
        const {email} = req.body
        console.log(email)
        const findUser = await User.findOne({email:email})

        if(findUser){
            const otp = generateOtp()
            const emailSent = await sendVerificationEmail(email,otp)
            if(emailSent){
                req.session.userOtp = otp
                req.session.userData = {email};
                console.log(`OTP:${otp}`)
                return res.render("forgotPass-otp")
                
               
            }else{
               return  res.json({success:false, message:"Failed to Send the OTP. Please try again"})
            }
        }else{
           return  res.render("forgotpassword", {message:"User with this email does not exist"})
        }

    }catch(error){
        res.redirect("/pageNotFound")
    }
}



//VERIFY THE ENTERED OTP
const verifyForgotPassOtp = async(req,res) =>{
    try{
        const {otp} = req.body;
        const storedOtp = req.session.userOtp
        if (!storedOtp) {
            return res.json({ success: false, message: "OTP not found. Please request a new OTP." });
        }
        if(otp.toString() === storedOtp.toString()){
            res.json({success:true, redirectUrl:"/reset-password"})
        } else {
            
            res.json({success:false, message:"OTP not matching"})
        }
    }catch(error){
        res.status(500).json({success:false, message: "An error occured. Please try again"})
    }
}




//FOR RENDERING THE RESET PASSWORD PAGE
const getResetPassPage = async(req,res) =>{
     try{
        res.render("reset-password")
    }catch(error){
        res.redirect("/pageNotFound")
    }
}






//FOR RESENDING THE OTP
const  resendOtp = async (req, res) => {
    try {
        const { email } = req.session.userData;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email not found in session" });
        }
        const otp = generateOtp();
        req.session.userOtp = otp;

        console.log(`Resending otp to email : ${email}`)
        const emailSent =  await sendVerificationEmail(email, otp);

        if (emailSent) {
            console.log(`Resended otp is ${otp}`);
            res.status(200).json({ success: true, message: "OTP Resend Successfully" });
        } else {
            res.status(500).json({ success: false, message: "OTP resend failed" });
        }
    } catch (error) {
        console.error("Error resending OTP", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


//AFTER ENTERING THE 2 PASSWORD THE RESET PASSWORD WORK IS FINISHED
const resetPassword = async(req,res)=>{
    try{
        const {newPass1, newPass2} = req.body;
        const { email } = req.session.userData;
        if (!newPass1 || !newPass2) {
            return res.render("reset-password", { 
                message: "Please provide both passwords" 
            });
        }
        if(newPass1===newPass2){
            const passwordHash = await securePassword(newPass1);
            await User.updateOne(
                {email:email}, 
                {$set:{password:passwordHash}}
            )
            res.redirect("/login")
        }else{
            res.render("reset-password" ,{message:"Passwords do not match"})
        }
    }catch(error){
        res.redirect("/pageNotFound")
    }
}


//FOR HASHING THE PASSWORD
const securePassword = async(password)=>{
    try{
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash
      }catch(error){
        console.log("Password hashing failed", error)
        throw new Error("Password hashing failed")
    }
}



//EXPORTING...
module.exports ={
    forgotPassword,
    forgotEmailValid,
    verifyForgotPassOtp,
    resetPassword,
    resendOtp,
    getResetPassPage

}