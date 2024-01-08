const { Snowflake } = require('@theinternetfolks/snowflake');
const { Role } = require('../db/db');
const roleValidator = require('../utils/validator');

// Controller function to create a role
const createRole = async (req, res) => {
    const { name } = req.body;

    // Validate the role name
    const validation = roleValidator(name);
    if (!validation) {
        return res.status(400).json({
            status: validation,
            errors: [
                {
                    param: "name",
                    message: "Name should be at least 2 characters.",
                    code: "INVALID_INPUT"
                }
            ]
        });
    }

    try {
        // Generate a unique ID for the role
        const roleId = await Snowflake.generate({ name });

        // Create the role
        const role = new Role({
            id: roleId,
            name: name,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });

        // Save the role to the database
        await role.save();

        // Prepare the response data
        res.status(200).json({
            status: validation,
            content: {
                data: {
                    id: role.id,
                    name: role.name,
                    created_at: role.created_at,
                    updated_at: role.updated_at,
                },
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Controller function to get roles with pagination
const getRoles = async (req, res) => {
    try {
        const perPage = parseInt(req.query.perPage) || 10; // Default to 10 items per page
        const page = parseInt(req.query.page) || 1; // Default to page 1

        // Fetch roles with pagination from the database using _id without sorting
        const roles = await Role.find()
            .skip((page - 1) * perPage)
            .limit(perPage);

        // Fetch the total count of roles for meta information
        const totalRoles = await Role.countDocuments();

        // Prepare the response in the specified format
        const responseData = {
            status: true,
            content: {
                meta: {
                    total: totalRoles,
                    pages: Math.ceil(totalRoles / perPage),
                    page: page,
                },
                data: roles.map(role => ({
                    id: role.id,
                    name: role.name,
                    created_at: role.created_at,
                    updated_at: role.updated_at,
                })),
            },
        };

        res.status(200).json(responseData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Export the controller functions
module.exports = {
    createRole,
    getRoles,
};
