// Post Controller
// Handles CRUD operations for blog posts & ownership authorization logic using SQL / Sequelize

const Post = require('../models/Post');
const User = require('../models/User');

// @desc    Get all blog posts
// @route   GET /posts OR GET /api/posts
// @access  Public (No Auth required)
const getAllPosts = async (req, res, next) => {
  try {
    // Fetch all posts with author details (username and email)
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single blog post by ID
// @route   GET /posts/:id OR GET /api/posts/:id
// @access  Public (No Auth required)
const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'email'],
        },
      ],
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: `Post not found with id ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new blog post
// @route   POST /posts OR POST /api/posts
// @access  Protected (Requires JWT Token)
const createPost = async (req, res, next) => {
  try {
    const { title, content, tags } = req.body;

    // Validate required post fields
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both title and content for the blog post',
      });
    }

    // Create post attached to logged-in user ID (userId)
    const post = await Post.create({
      title,
      content,
      tags: tags || [],
      userId: req.user.id,
    });

    // Fetch created post with populated author data
    const fullPost = await Post.findByPk(post.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'email'],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: fullPost,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing blog post
// @route   PUT /posts/:id OR PUT /api/posts/:id
// @access  Protected (Only the post author can update)
const updatePost = async (req, res, next) => {
  try {
    // 1. Find post by Primary Key (id)
    const post = await Post.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: `Post not found with id ${req.params.id}`,
      });
    }

    // 2. AUTHORIZATION CHECK: Ensure logged-in user is the owner (userId) of the post
    if (post.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You are not authorized to update this post',
      });
    }

    // 3. Perform update with allowed fields
    const { title, content, tags } = req.body;
    if (title) post.title = title;
    if (content) post.content = content;
    if (tags) post.tags = tags;

    await post.save();

    // Fetch updated post with author details
    const updatedPost = await Post.findByPk(post.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'email'],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: updatedPost,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a blog post
// @route   DELETE /posts/:id OR DELETE /api/posts/:id
// @access  Protected (Only the post author can delete)
const deletePost = async (req, res, next) => {
  try {
    // 1. Find post by Primary Key (id)
    const post = await Post.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: `Post not found with id ${req.params.id}`,
      });
    }

    // 2. AUTHORIZATION CHECK: Ensure logged-in user is the owner (userId) of the post
    if (post.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You are not authorized to delete this post',
      });
    }

    // 3. Delete the post from SQLite database
    await post.destroy();

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
};
