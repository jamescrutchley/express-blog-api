const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

router.get('/', userController.getHome);
router.get('/users/:userId', userController.getUserById);
router.get('/users', userController.getAllUsers)
router.post('/users/:userId', userController.createUser)
router.put('/users/:userId', userController.updateUser)
router.delete('/users/:userId', userController.deleteUser)

module.exports = router;