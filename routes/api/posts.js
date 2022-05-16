const express = require('express');
const { check, ValidationResult } = require('express-validator');
const authMiddleware = require('../../middleware/auth');
const Post = require('../../models/Post');
const User = require('../../models/User');

const router = express.Router();

// @route   POST api/posts
// @desc    Create post
// @access  Private

router.post(
  '/',
  [authMiddleware, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    try {
      const error = ValidationResult(req);

      if (!error.isEmpty()) {
        return res.status(404).json({ errors: error.array });
      }

      const user = await User.findById(req.user.id).select('-password');

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      await newPost.save();

      res.json(newPost);
    } catch (error) {
      res.status(501).json('Server error');
    }
  }
);

// @route   GET api/posts
// @desc    Get posts
// @access  Public

router.get('/', (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then((posts) => res.json(posts))
    .catch((err) => res.status(404).json({ msg: 'No posts found' }));
});

// @route POST api/posts/:id
// @desc Get post by id
// @access public

router.post('/:id', (req, res) => {
  Post.findById(req.params.id)
    .then((post) => res.json(post))
    .catch((err) =>
      res.status(404).json({ msg: 'No post found with that ID' })
    );
});

// @route DELETE api/posts/:id
// @desc Delte post by id
// @access public

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404).json({ msg: 'Post not found' });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(404).json({ msg: 'User not found' });
    }

    await post.remove();
    res.json('Post deleted successfully');
  } catch (error) {
    res.status(500).json('Server error: ' + error.message);
  }
});

// @route   PUT api/posts/like/:id
// @desc    Like post
// @access  Private

router.put('/like/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (
      post.likes.filter((like) => like.user.toString() === req.params.id)
        .length > 0
    ) {
      return res.status(404).json({ msg: 'Post already exists' });
    }

    post.likes.unshift({ user: req.user.id });

    await post.save();
    res.json(post.likes);
  } catch (error) {
    res.status(500).json('Server error: ' + error.message);
  }
});

// @route   PUT api/posts/unlike/:id
// @desc    UnLike post
// @access  Private

router.put('/unlike/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (
      post.likes.filter((like) => like.user.toString() === req.params.id)
        .length === 0
    ) {
      return res.status(404).json({ msg: 'Post has not yet been exists' });
    }

    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.params.id);
    await post.likes.splice(removeIndex, 1);

    await post.save();
    res.json(post.likes);
  } catch (error) {
    res.status(500).json('Server error: ' + error.message);
  }
});

// @route   POST api/posts/comment/:id
// @desc    Add comment to post
// @access  Private

router.post(
  '/comment/:id',
  [authMiddleware, check('text', 'text is required')],
  async (req, res) => {
    try {
      const error = ValidationResult(req);

      if (!error.isEmpty()) {
        return res.status(404).json({ errors: error.array });
      }

      const user = await User.findOne(req.user.id).select('-password');
      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id,
      };

      post.comments.unshift(newComment);

      await post.save();

      res.json(post.comments);
    } catch (error) {
      res.status(500).json('Server error: ' + error.message);
    }
  }
);

// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    Remove comment from post
// @access  Private

router.delete('comment/:id/:comment_id', authMiddleware, async (req, res)=>{
  const post = await Post.findById(req.params.id);

  if(post.comments.filter(comment.id.toString() === req.params.comment_id).length ===0){
    return res.status(403).json({commentnoexits:'Comment does not exist'});
  }

  const removeIndex = post.comments.map(item =item._id.toString()).indexOf(req.params.comment_id);

  post.comments.splice(removeIndex, 1);

  await post.save();

  res.json(post.comments);
})

module.exports = router;
