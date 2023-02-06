const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = async(req,res,next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_TOKEN);
        const userId = decodedToken.id;
        if (parseInt(req.body.userId) && parseInt(req.body.userId) !== userId) {
            throw "userId non valide";
        }else {
            next();
        }
    } catch (error) {
        res
        .status(401)
        .json({ error: error, message: "requête non authentifiée"});
        
    }
}