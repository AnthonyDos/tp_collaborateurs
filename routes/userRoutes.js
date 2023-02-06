const express = require('express');
const router = express.Router();
const user =require('../controller/userController');
const auth = require('../middleware/auth');

router.post('/', auth, user.createUser);
router.post('/login', user.userLogin);
router.get('/', auth, user.getAllUsers);
router.get('/:id', auth, user.getUserById);


module.exports = router;