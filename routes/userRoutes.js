const express = require('express');
const router = express.Router();

// const authenticateToken = require('../controllers/authController')

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/jwt-auth');


router.get('/', userController.getHome);
router.get('/users/:userId', authenticateToken, userController.getUserById);
router.get('/users', userController.getAllUsers)
router.post('/users', userController.createUser)
router.put('/users/:userId', authenticateToken, userController.updateUser)
router.delete('/users/:userId', authenticateToken, userController.deleteUser)

router.post('/login', authController.login)
router.get('/testauth', authenticateToken, authController.testAuth )

module.exports = router;