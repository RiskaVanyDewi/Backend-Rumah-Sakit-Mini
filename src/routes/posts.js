const express = require('express');
const {
  getAllPosts,
  createPost,
  getPostById,
  deletePost
} = require('../controllers/postsController');

const router = express.Router();

router.get('/', getAllPosts);
router.post('/', createPost);
router.get('/:id', getPostById);
router.delete('/:id', deletePost);

module.exports = router;
