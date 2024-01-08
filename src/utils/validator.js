const zod = require('zod');

// Define user schema using zod
const userSchema = zod.object({
    name: zod.string().min(2).max(64).optional(),
    email: zod.string().email().max(128),
    password: zod.string().min(6).max(64),
});

// Define community schema using zod
const communitySchema = zod.object({
    name: zod.string().min(2).max(128),
});

// Define role schema using zod
const roleSchema = zod.object({
    name: zod.string().min(2).max(64),
});

// Function to validate user input against the user schema
const userValidator = (name, email, password) => {
    const response = userSchema.safeParse({ name, email, password });
    return response;
};

// Function to validate role input against the role schema
const roleValidator = (name) => {
    const response = roleSchema.safeParse({ name });
    return response.success;
};

// Function to validate community input against the community schema
const communityValidator = (name) => {
    const response = communitySchema.safeParse({ name });
    return response;
};


module.exports = {
    userValidator,
    roleValidator,
    communityValidator,
};
