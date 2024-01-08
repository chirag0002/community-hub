const { User } = require('../db/db');
const { userValidator } = require('../utils/validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Middleware for user authentication
async function userAuthentication(req, res, next) {
    const { name, email, password } = req.body;

    // Validate user credentials using the helper function
    const validation = userValidator(name, email, password);
    if (!validation.success) {
        const errs = validation.error.errors;
        return res.status(400).json({
            status: false,
            errors: errs.map(err => ({
                param: err.path[0],
                message: err.message,
                code: "INVALID_INPUT"
            }))
        });
    }

    try {
        // Check if a user with the provided email exists
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(400).json({
                status: false,
                errors: [{
                    param: "email",
                    message: "The credentials you provided are invalid.",
                    code: "INVALID_CREDENTIALS"
                }]
            });
        }

        // Compare the provided password with the hashed password in the database
        const match = await bcrypt.compare(password, user.password);

        // If passwords match, generate a JWT token and attach it to the request
        if (match) {
            const token = jwt.sign({ userId: user.id, email: user.email }, process.env.KEY, { expiresIn: '1h' });
            req.token = token;
            req.user = user;
            next();
        } else {
            return res.status(400).json({
                status: false,
                errors: [{
                    param: "password",
                    message: "The credentials you provided are invalid.",
                    code: "INVALID_CREDENTIALS"
                }]
            });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = userAuthentication;