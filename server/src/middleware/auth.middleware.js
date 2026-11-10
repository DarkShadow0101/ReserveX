const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');

async function authMiddleware(req, res, next) {
    try {
        let token;

        // 1. Check if token is in the Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        // 2. OR check if token is in Cookies (just like your Spotify project!)
        else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        // If no token was found in either place:
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }
        // 3. Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // 4. Fetch the real user from MongoDB (excluding password)
        const user = await userModel.findById(decoded.UserId).select('-password');
        if (!user) {
            return res.status(401).json({ message: "User belonging to this token no longer exists" });
        }
        // 5. Attach the real MongoDB user to req.user!
        req.user = user;
        next();
    } catch (err) {
        console.error(err);
        return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }
}

module.exports = authMiddleware;