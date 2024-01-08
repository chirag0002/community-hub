const { User } = require('../db/db');
const jwt = require('jsonwebtoken');

// Middleware for handling authentication requests
async function userAuthorization(req, res, next) {
    const authHeader = req.header("Authorization");

    // Check if the Authorization header is missing or doesn't start with 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            status: false,
            errors: [{
                message: "You need to sign in to proceed.",
                code: "NOT_SIGNEDIN"
            }]
        });
    }

    const token = authHeader.split(' ')[1];

    // Check if the token is missing
    if (!token) {
        return res.status(401).json({
            status: false,
            errors: [{
                message: "You need to sign in to proceed.",
                code: "NOT_SIGNEDIN"
            }]
        });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.KEY);

        // Check the validity of the decoded payload
        const user = await User.findOne({ email: decoded.email });
        if (!user) {
            return res.status(401).json({
                status: false,
                errors: [{
                    message: "Auth token is invalid.",
                    code: "INVALID_ACCESS_TOKEN"
                }]
            });
        }
        if (user.id == decoded.userId) {
            // Attach the user information to the request for future middleware or route handlers
            req.user = user;
            next();
        }
    } catch (err) {
        console.log(err);
        return res.status(401).json({
            status: false,
            errors: [{
                message: "Auth token is invalid.",
                code: "INVALID_ACCESS_TOKEN"
            }]
        });
    }
}

module.exports = userAuthorization;