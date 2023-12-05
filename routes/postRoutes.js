const express = require('express');
const router = express.Router();

const postController = require('../controllers/postController');

router.get('/:postId', postController.getPostById);
router.get('/', postController.getAllPosts)
router.post('/', postController.createPost)
router.put('/:postId', postController.updatePost)
router.delete('/:postId', postController.deletePost)

module.exports = router;