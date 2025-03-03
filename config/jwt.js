const jwt= require('jsonwebtoken');

const jwtAuthMiddleware=(req,res,next)=>{
     console.log("entering")
    const authorization=req.headers.authorization;
    if(!authorization) return res.status(401).json({message:"Token is not provided"});

    //Extract the jwt token 
    const token =req.headers.authorization.split(' ')[1];
    if(!token) return res.status(401).json({message:"unauthorized access"});

    try{
        //Verifying
        const decoded =jwt.verify(token,"29032025");
        req.user =decoded;
        next();
    }
    catch(err){
        console.log(err);
        res.status(401).json({message:"Invalid Token"});
    }
}

const genrateToken =(userData)=>{
    return jwt.sign(userData,"29032025");
}

module.exports={jwtAuthMiddleware,genrateToken};