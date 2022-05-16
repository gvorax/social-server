const express = require('express');
const authMiddleware = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

const router = express.Router();

// @route   GET api/profile/me
// @desc    user profile
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.users.id }).populate(
      'users',
      ['name', 'avatar']
    );

    if (!profile) {
      return res.status(400).json({ msg: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    res.status(501).json({ msg: error.message });
  }
});

// @route   POST api/profile
// @desc    Create or edit user profile
// @access  Private
router.post(
  '/',
  [
    authMiddleware,
    [
      check('status', 'status is required').not().isEmpty(),
      check('skills', 'Skills is required').not().isEmpty(),
    ],
  ],
  (req, res) => {
    const error = validationResult(req);

    if (!error.isEmpty()) {
      return res.status(432).json({ errors: error.array() });
    }

    // Get fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;
    // Skills - Spilt into array
    if (typeof req.body.skills !== 'undefined') {
      profileFields.skills = req.body.skills.split(',');
    }

    // Social
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    Profile.findOne({ user: req.user.id }).then((profile) => {
      if (profile) {
        // Update
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then((profile) => res.json(profile));
      } else {
        // Create

        // Check if handle exists
        Profile.findOne({ handle: profileFields.handle }).then((profile) => {
          if (profile) {
            errors.handle = 'That handle already exists';
            res.status(400).json(errors);
          }

          // Save Profile
          new Profile(profileFields)
            .save()
            .then((profile) => res.json(profile));
        });
      }
    });
  }
);

// @route   GET api/profile/all
// @desc    Get all profiles
// @access  Public

router.get('/all', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('users', ['name', 'avatar']);

    if (!profiles) {
      return res.status(404).json({ msg: 'There is no profile' });
    }

    res.json(profiles);
  } catch (error) {
    console.log(error);
    res.status(404).json({ msg: 'Server error' });
  }
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public

router.get('/users/:user_id', async (req, res) => {
  const profile = await Profile.findOne({ user: req.params.user_id }).populate(
    'users',
    ['name', 'avatar']
  );

  try {
    if (!profile) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(profile);
  } catch (error) {
    console.log(error);
    res.status(501).json('Server error');
  }
});

// @route   DELETE api/profile/
// @desc    Delete profile and user
// @access  Private

router.delete('/', authMiddleware, async (req, res) => {
  try {
    await Profile.findOneAndRemove({ user: req.user.id });

    await User.findOneAndRemove({ _id: req.user.id });

    res.json('User deleted');
  } catch (error) {
    console.log(error);
    res.status(404).json({ msg: 'Server error' });
  }
});

// @route   POST api/profile/experience
// @desc    Add experience to profile
// @access  Private

router.post(
  '/experience',
  [
    authMiddleware,
    [
      check('title', 'title is required').not().isEmpty(),
      check('company', 'company is required').not().isEmpty,
      check('from', 'from is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(432).json({ errors: errors.array() });
      }

      const profile = await Profile.findOne({ user: req.user.id });

      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description,
      };

      profile.experience.unshift(newExperience);

      await profile.save();

      res.json(profile);
    } catch (error) {
      res.status(501).json({ msg: 'Server error' });
    }
  }
);

// @route   DELETE api/profile/experience/:exp_id
// @desc    delete experience from profile
// @access  Private

router.delete('/experience/:exp_id', authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    const removeIndex = profile.experience
      .map((item = item.id))
      .indexOf(req.params.id);

    profile.experience.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (error) {
    res.status(501).json({ msg: 'Server error' });
  }
});

// @route   POST api/profile/education
// @desc    Add education to profile
// @access  Private

router.post(
  '/education',
  [
    authMiddleware,
    [
      check('school', 'school is required').not().isEmpty(),
      check('degree', 'degree is required').not().isEmpty,
      check('fieldofstudy', 'field of study is required').not().isEmpty,
      check('from', 'from is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(432).json({ errors: errors.array() });
      }

      const profile = await Profile.findOne({ user: req.user.id });

      const newExp = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description,
      };

      profile.education.unshift(newExperience);

      await profile.save();

      res.json(profile);
    } catch (error) {
      res.status(501).json({ msg: 'Server error' });
    }
  }
);

// @route   DELETE api/profile/experience/:exp_id
// @desc    delete experience from profile
// @access  Private

router.delete('/education/:edu_id', authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    const removeIndex = profile.education
      .map((item = item.id))
      .indexOf(req.params.id);

    profile.education.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (error) {
    res.status(501).json({ msg: 'Server error' });
  }
});

// @route   GET api/profile/github/:username
// @desc    get user repos from GITHUB
// @access  PUBLIC

// router.get('/github/:username',async (req, res) => {
//   try {
//     const options = {
//       url: ` https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${process.env.CLIENT_ID}&client_secret=${process.env.GITHUB_SECRET}`,
//       method: 'GET',
//       header: { 'user-agent': 'nodejs' },
//     };


//     request(options,(error,response,body)=>{
//       if(error) console.error(error.message);

//       if(response.statusCode !== 200){
//         res.status(404).json({msg:'No Github profile found'})
//       }
//       console.log(response.statusCode);
//       console.log(response);

//       // res.json(JSON.parse(body));
//       // console.log(body); 
//       // console.log(JSON.parse(body));
//     })
    
//   } catch (error) {
//     console.error(error);
//     res.status(501).json('Server error');
//   }
// });
module.exports = router;
