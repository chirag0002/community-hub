const bcrypt = require('bcrypt');
const { Snowflake } = require('@theinternetfolks/snowflake');
const { User } = require('../db/db');

// Controller function for user signup
const signUp = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Generate a unique ID for the user
        const id = await Snowflake.generate({ email: email });
        
        // Hash the password before storing it in the database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user instance
        const user = new User({
            id: id,
            name: name,
            email: email,
            password: hashedPassword,
            created_at: new Date().toISOString(),
        });

        // Save the new user to the database
        await user.save();

        // Prepare the response data
        const responseData = {
            status: true,
            content: {
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    created_at: user.created_at,
                },
            },
        };

        // Send the response
        res.status(200).send(responseData);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Controller function for user signin
const signIn = async (req, res) => {
    const token = req.token;
    const user = req.user;

    try {
        // Prepare the response data
        const responseData = {
            status: true,
            content: {
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    created_at: user.created_at,
                },
            },
            meta: {
                access_token: token,
            },
        };

        res.status(200).json(responseData);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Controller function to get user profile
const getUserProfile = async (req, res) => {
    const user = req.user;

    try {
        // Prepare the response data
        const responseData = {
            status: true,
            content: {
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    created_at: user.created_at,
                },
            },
        };

        res.status(200).send(responseData);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    signUp,
    signIn,
    getUserProfile,
};