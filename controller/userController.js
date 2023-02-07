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
        res.status(400).json({ message: errorMessage.errorRegexPassword})
    }

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
                    success: "le client est connecté",
                    authorization: result[0].isAdmin
                })
            }
        }
    })
}

exports.getAllUsers = (req, res) => {
    dbConnect.query(usersService.getAllUsers, (error, result)=> {
        if (error) {
            res.status(400).json({ error : error, message: errorMessage.errorGetAllUsers })
        }
        res.status(201).json({ 
            result : result, 
            message: "récupération de la liste utilisateur avec succés", 
            nombreUser: result.length
        })
    })
}

exports.getUserById = (req, res) => {
    const userId = req.params.id;
    
    dbConnect.query(usersService.getUserById, [userId], (error,result)=> {
        if (result[0] !== undefined ) {
            res.status(201).json({ result: result[0], message: "Utilisateur trouvé"})
        } else{
            res.status(400).json({ error: error, message: errorMessage.errorUserNotExist })
        }
    })
}

exports.updateUser = (req, res) => {
    const userId = req.params.id;
    const { gender, firstname, lastname, password, phone, birthdate, city, country, photo, category, isAdmin } = req.body;

    dbConnect.query(usersService.getUserById, [userId], (error, result)=> {
        const user = result[0];
        if (result[0] !== undefined ) {
            dbConnect.query(usersService.updateUser, [
                gender != undefined ? gender : user.gender,
                firstname != undefined ? firstname : user.firstname,
                lastname != undefined ? lastname : user.lastname,
                user.email,
                password != undefined ? password : user.password,
                phone != undefined ? phone : user.phone,
                birthdate != undefined ? birthdate : user.birthdate,
                city != undefined ? city : user.city,
                country != undefined ? country : user.country,
                photo != undefined ? photo : user.photo,
                category != undefined ? category : user.category,
                isAdmin != undefined ? isAdmin : user.isAdmin,
                userId
            ], (error, result)=> {
                if (error) {
                    res.status(400).json({ error: error, message: errorMessage.errorUpdateUser })
                } else {
                    res.status(201).json({result: result, message: "la modification de l'utilisateur est prise en compte!"})
                }
            })
        } else{
            res.status(400).json({ error: error, message: errorMessage.errorUserNotExist })
        }
    })
}

exports.deleteUser = (req,res) => {
    const authorization = req.body.authorization;
    
    if (authorization === AUTHORIZATION) {
        dbConnect.query(usersService.deleteUser, [req.params.id],(error, result) => {
            if (error) {
                res.status(404).json({ error: error, message: errorMessage.errorDeleteUser })
            }else{
                res.status(200).json({success: "supprimé"})
            }
        })
    }else{
        res.status(401).json({ message: errorMessage.errorAccessAuthorization })
    }
}