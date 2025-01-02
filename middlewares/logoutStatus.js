
function logoutStatus(req,res,next){
    if(req.session.user){
        const {name} = req.session.userData;
        res.locals.userStatus = true;
        res.locals.userName = name;
    }else{
        res.locals.userStatus = false;
    }
    return next();
}

module.exports = logoutStatus;