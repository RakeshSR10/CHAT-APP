const User = require('../models/userModel');
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/authMiddleware');
const cloudinary = require('../cloudinary');

// user registration
router.post('/register', async (req, res) => {
    try {

        // check if User is already exists or not
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.send({
                success: false,
                message: 'user already exists...!'
            })
        }

        // create new user
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        req.body.password = hashedPassword;
        const newUser = new User(req.body);
        await newUser.save();
        res.send({
            success: true,
            message: 'User created successfully'
        });

    } catch (error) {
        res.send({
            message: error.message,
            success: false
        })
    }
});

// user login
router.post('/login', async (req, res) => {
    try {
        //check if user is exists or not
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.send({
                message: 'user does not exists',
                success: false
            });
        }

        // check if password is correct or not
        const validPassword = await bcrypt.compare(
            req.body.password,
            user.password
        );
        if (!validPassword) {
            return res.send({
                message: 'Invalid credentials',
                success: false
            });
        }

        // create and assign a token to login part
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.send({
            message: 'USER Login successfully....!',
            success: true,
            data: token
        });
    } catch (error) {
        res.send({
            message: error.message,
            success: false
        });
    }
});

// get-current-user
router.get('/get-current-user', authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.body.userId });
        res.send({
            success: true,
            message: 'User fetched successfully...!',
            data: user
        });
    } catch (error) {
        res.send({
            message: error.message,
            success: false
        });
    }
});

// get-all-users expect current-user
router.get('/get-all-users', authMiddleware, async (req, res) => {
    try {
        const allUsers = await User.find({ _id: { $ne: req.body.userId } });
        res.send({
            success: true,
            message: 'Users fetched successfully...!',
            data: allUsers
        });
    } catch (error) {
        res.send({
            success: false,
            message: error.message,
            data: []
        });
    }
});

// update user profile picture
router.post('/update-profile-picture', authMiddleware, async (req, res) => {
    try {
        const image = req.body.image;

        // upload image to cloudinary and get url
        const uploadedImage = await cloudinary.uploader.upload(image, {
            folder: 'chatapp'
        });

        //update user profile picture
        const user = await User.findOneAndUpdate(
            { _id: req.body.userId },
            { profilePic: uploadedImage.secure_url },
            { new: true }
        )

        res.send({
            success: true,
            message: 'Profile picture updated successfully....!',
            data: user,
        })
    } catch (error) {
        res.send({
            success: false,
            message: 'Profile picture not updated, try again',
            data: error.message,
        });
    }
});
module.exports = router;