const express = require('express');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Server Error' });
  }
});

router.post(
  '/',
  [
    check('email', 'Email is required').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const error = validationResult(req, res);
    if (!error.isEmpty()) {
      return res.status(432).json({ errors: error.array() });
    }

    try {
      const { email, password } = req.body;

      let user = await User.findOne({ email });
      console.log(user);

      if (!user) {
        res.status(402).json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(403)
          .json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        process.env.PRIVATE_KEY,
        { expiresIn: 36000 },
        (err, token) => {
          if (err) throw new Error(err);

          res.json({ token });
        }
      );
    } catch (error) {
      res.status(500).json(error);
    }
  }
);

module.exports = router;
