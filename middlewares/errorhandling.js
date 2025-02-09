 const errorHandler = (err,req,res,next)=>{
    console.log(err.stack);
    const errStatusCode = err.statusCode || 500;
    const errMessage = err.message || 'Something went wrong in server';
    res.status(errStatusCode).json({message:errMessage});
}

module.exports = {errorHandler}