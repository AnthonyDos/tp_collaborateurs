const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const dbConnect = require("../config/access_db");
const errorMessage = require("../httpRequestMessage/errorMessage");
const { REGEX_PASSWORD, REGEX_EMAIL } = require("../config/regex/regex");
const { SALT_BCRYPT, EXPIRE_TOKEN } = require("../config/properties");
const usersService = require("../service/usersService");


exports.createUser = async(req,res) => {
    //const encryptedPassword = await bcrypt.hash(req.body.password, 10);
    const passwordBody = req.body.password;
    const email = req.body.email;

    if (!passwordBody.match(REGEX_PASSWORD)) {
        res.status(400).json({ message: errorMessage.errorRegexPassword})
    }

    if ( email ) {
        dbConnect.query(usersService.getUserByEmail, [email],(err,result)=>{
            if (err) {
                res.status(401).json({err: err})
            }else {
                if (result[0] != undefined) {
                    res.status(409).json({err: err, message: errorMessage.errorEmailAlreadyExist})
                }else {
                    dbConnect.query(usersService.createUser,
                        [
                            req.body.gender,
                            req.body.firstname,
                            req.body.lastname,
                            req.body.email,
                            req.body.password,
                            req.body.phone,
                            req.body.birthdate,
                            req.body.city,
                            req.body.country,
                            req.body.photo,
                            req.body.category,
                            req.body.isAdmin
                        ], (error,results) => {
                            if (error) {
                                res.status(401).json({ error: error, message: errorMessage.errorCreateAccount })
                            } else {
                                let comparePassword = bcrypt.hash( req.body.password, SALT_BCRYPT);
                                if (comparePassword) {
                                    return res.status(200).json({
                                        email:req.body.email,
                                        userId: req.params.id,
                                        token: jwt.sign(
                                            {userId: req.params.id},
                                            process.env.JWT_TOKEN,
                                            {expiresIn: EXPIRE_TOKEN}
                                        ),
                                        success: "utilisateur créé"
                                    })
                                }else{
                                    res.status(401).json({ error: error, message: errorMessage.errorEmailOrPasswordDoesNotMatch })
                                }
                            }
                        })
                }
            }
        })
    }else {
        res.status(401).json({ err : err , message: errorMessage.errorEmailfieldIsNullOrInvalid })
    }
}

exports.userLogin = async (req, res) => {
    const passwordBody = req.body.password;
    const emailBody = req.body.email;
     
    if (!passwordBody.match(REGEX_PASSWORD)) {
        res.status(400).json({ message: errorMessage.errorRegexPassword })
    }

    if (!REGEX_EMAIL.test(emailBody)) {
        res.status(400).json({ message: errorMessage.errorRegexEmail }) 
    }

    dbConnect.query(usersService.getUserByEmail, [emailBody], async (error,result)=>{
        if (error) {
            res.status(401).json({ error: error, message: errorMessage.errorConnectionUser })
        }

        if ( result.length > 0 ) {
            const comparePassword = await bcrypt.compare(
                passwordBody,
                result[0].password
            )
            if (comparePassword) {
                res.status(201).json({
                    userId: result[0].id,
                    token: jwt.sign(
                        { userId: result[0].id },
                        process.env.JWT_TOKEN,
                        { expiresIn: EXPIRE_TOKEN }
                    ),
                    success: "le client est connecté"
                })
            }
        }
    })
}