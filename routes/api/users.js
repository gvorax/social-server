const express = require('express');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const router = express.Router();
const UserSchema= require('../../models/User');

router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Email is required').isEmail(),
    check('password', 'Password is required with min 6 characters').isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const error = validationResult(req, res);
    if (!error.isEmpty()) {
      return res.status(432).json({ errors: error.array() });
    }

    try {
      const {name, email,  password } = req.body;

      let user = await UserSchema.findOne({ email});

      if (!!user) {
        res.status(402).json({ errors: [{ msg: 'User already exists' }] });
      }

      const avatar = gravatar.url(email, {
        s: 200,
        r: 'pg',
        d: 'mm',
      });



      user = new UserSchema({name, email, password, avatar} );
      // console.log(user);
      const salt = await bcrypt.genSaltSync(10);
      user.password = await bcrypt.hashSync(password, salt);
      await user.save();

      const payload = {
        user:{
          id:user.id,
        }
      }

      jwt.sign(payload,process.env.PRIVATE_KEY,{expiresIn:36000},(err,token)=>{
        if(err) throw new Error(err);
        res.json({token});
      })
    } catch (error) {
      res.status(500).json(error);
    }
  }
);

module.exports = router;
