const express = require('express');
const router = express.Router();

const commentController = require('../controllers/commentController');

router.get('/:postId/comments/:commentId', commentController.getCommentById);
router.get('/:postId/comments', commentController.getAllComments)
router.post('/:postId/comments/:commentId', commentController.createComment)
router.put('/:postId/comments/:commentId', commentController.updateComment)
router.delete('/:postId/comments/:commentId', commentController.deleteComment)

module.exports = router;