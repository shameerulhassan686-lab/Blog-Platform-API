// Post Routes
// Routes for managing blog posts

const express = require('express');
const router = express.Router();
const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

// Public routes (No token required)
router.get('/', getAllPosts);
router.get('/:id', getPostById);

// Protected routes (JWT Token required via protect middleware)
router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

module.exports = router;
