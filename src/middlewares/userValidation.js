const { User } = require('../db/db');
const { userValidator } = require('../utils/validator');

// Middleware for checking if a user already exists
async function userValidation(req, res, next) {
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
        // Check if a user with the provided email already exists
        const user = await User.findOne({ email: email });
        if (user) {
            return res.status(400).json({
                status: false,
                errors: [
                    {
                        param: "email",
                        message: "User with this email address already exists.",
                        code: "RESOURCE_EXISTS"
                    }
                ]
            });
        } else {
            // If the user doesn't exist, proceed to the next middleware or route handler
            next();
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = userValidation;