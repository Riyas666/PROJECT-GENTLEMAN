const User = require("../models/userSchema")


const userAuth = (req,res,next) => {
    if(req.session.user){
        User.findById(req.session.user)
        .then(data=>{
            if(data && !data.isBlocked){
                next()
            }else{
                res.redirect("/login")
            }
        })
        .catch(error =>{
            console.log("Error in user auth middleware")
            res.status(500).send("Internal Server Error")
        })
    }else{
        res.redirect("/login")
    }
}

const adminAuth = (req, res, next) => {
    try {
        if (req.session.admin||!req.session.admin) { 
            next() 
        } else {
            res.redirect("/admin/login")  // Redirect to login if no admin in session
        }
        
    } catch (error) {
        console.log(error)
    }
}



module.exports = {
    userAuth,
    adminAuth
}