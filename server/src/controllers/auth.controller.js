const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

async function RegisterUser(req, res) {
    //default value is customer
    const { fullName, email, password, role } = req.body;

    const isUserAlreadyExists = await userModel.findOne({
        $or: [
            { fullName },
            { email }
        ]
    })
    if (isUserAlreadyExists) {
        return res.status(409).json({ message: "User Already Exists" })
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await userModel.create({
        fullName, email, password: hash, role
    })

    const token = jwt.sign({
        UserId: user._id,
        role: user.role,
    }, process.env.JWT_SECRET)

    res.cookie("token", token)

    res.status(201).json({
        message: "User Registered Successfully",
        user
    })
}

async function loginUser(req, res) {
    const { fullName, email, password } = req.body;

    const user = await userModel.findOne({
        email
    })

if (!user) {
    return res.status(401).json({ message: "Invalid Credentials" })
}

const isPasswordValid = await bcrypt.compare(password, user.password)

if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid Credentials" })
}

const token = jwt.sign({
    UserId: user._id,
    role: user.role,
}, process.env.JWT_SECRET)

res.cookie("token", token)

res.status(201).json({
    message: "User Logged in  Succesfsfully",
    user
})
}

async function getMe(req, res) {
    // req.user was already fetched and verified by authMiddleware!
    res.status(200).json({
        success: true,
        user: req.user
    });
}

module.exports = { RegisterUser, loginUser, getMe };