const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const dbConnect = require("../config/access_db");
const errorMessage = require("../httpRequestMessage/errorMessage");
const { REGEX_PASSWORD, REGEX_EMAIL } = require("../config/regex/regex");
const { SALT_BCRYPT, EXPIRE_TOKEN, AUTHORIZATION } = require("../config/properties");
const usersService = require("../service/usersService");


exports.createUser = async(req,res) => {
    const passwordBody = req.body.password;
    const email = req.body.email;

    if (!passwordBody.match(REGEX_PASSWORD)) {
        res.status(401).json({ message: errorMessage.errorRegexPassword})
    }else if (!REGEX_EMAIL.test(email)) {
        res.status(401).json({ message: errorMessage.errorRegexEmail })   
    }else{
        if ( email ) {
            dbConnect.query(usersService.getUserByEmail, [email],(err,result)=>{
                if (err) {
                    res.status(401).json({err: err})
                }else {
                    if (result[0] != undefined) {
                        res.status(409).json({ message: errorMessage.errorEmailAlreadyExist })
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
                                            success: "utilisateur cr????"
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
}

exports.userLogin = async (req, res) => {
    const passwordBody = req.body.password;
    const emailBody = req.body.email;
     
    if (!REGEX_PASSWORD.test(passwordBody)) {
        res.status(401).json({ message: errorMessage.errorRegexPassword })
    }else if (!REGEX_EMAIL.test(emailBody)) {
        console.log("2")
        res.status(400).json({ message: errorMessage.errorRegexEmail }) 
    }else{
        dbConnect.query(usersService.getUserByEmail, [emailBody], async (error,result)=>{
            if (result.length < 1) {
                res.status(401).json({ error: error, message: errorMessage.errorConnectionUser })
            }else{
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
                        success: "le client est connect??",
                        authorization: result[0].isAdmin
                    })
                }else{
                    res.status(401).json({error: error, message: errorMessage.errorConnectionUser})
                }
            }
        })
    }
}

exports.getAllUsers = (req, res) => {
    dbConnect.query(usersService.getAllUsers, (error, result)=> {
        if (error) {
            console.log({error: error})
            res.status(400).json({ error : error, message: errorMessage.errorGetAllUsers })
        }
        res.status(201).json({ 
            result : result, 
            message: "r??cup??ration de la liste utilisateur avec succ??s", 
            nombreUser: result.length
        })
    })
}

exports.getUserById = (req, res) => {
    const userId = req.params.id;
    
    dbConnect.query(usersService.getUserById, [userId], (error,result)=> {
        if (result[0] !== undefined ) {
            res.status(201).json({ result: result[0], message: "Utilisateur trouv??"})
        } else{
            res.status(400).json({ error: error, message: errorMessage.errorUserNotExist })
        }
    })
}

exports.updateUser = (req, res) => {
    const userId = req.params.id;
    const { gender, firstname, lastname, email, password, phone, birthdate, city, country, photo, category} = req.body;
    dbConnect.query(usersService.getUserById, [userId], (err, result)=> {
        if (err) {
            console.log({error: err} +" tt")
            res.status(401).json({ error: err, message: errorMessage.errorUserNotExist })
        } else{
            dbConnect.query(usersService.updateUser,[gender,firstname,lastname,email,password,phone,birthdate,city,country,photo,category,userId],(error, results)=> {
                if (error) {
                    res.status(401).json({ error: error, message: errorMessage.errorUpdateUser })
                } else {
                    res.status(201).json({message: "la modification de l'utilisateur est prise en compte!"})
                }
            })  
        }
    })
}

exports.deleteUser = (req,res) => {
    const authorization = req.body.authorization;
    
    if (authorization === AUTHORIZATION) {
        dbConnect.query(usersService.deleteUser, [req.params.id],(error, result) => {
            if (error || result.affectedRows === 0) {
                res.status(404).json({ error: error, message: errorMessage.errorDeleteUser })
            }else{
                res.status(200).json({ result, success: "supprim??" })
            }
        })
    }else{
        res.status(401).json({ message: errorMessage.errorAccessAuthorization })
    }
}