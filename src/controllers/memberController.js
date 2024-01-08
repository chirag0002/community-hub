const { Community, User, Role, Member } = require('../db/db');
const { Snowflake } = require('@theinternetfolks/snowflake');

// Controller function to add a member to a community
const addMember = async (req, res) => {
    const { community, user, role } = req.body;

    // Extract IDs for community, user, and role
    const communityId = community;
    const userId = user;
    const roleId = role;

    // Extract current user's ID
    const currentUserId = req.user.id;

    try {
        // Check if the community exists
        const communityData = await Community.findOne({ id: communityId });
        if (!communityData) {
            return res.status(400).json({
                status: false,
                errors: [{
                    param: "community",
                    message: "Community not found.",
                    code: "RESOURCE_NOT_FOUND"
                }]
            });
        }

        // Check if the user exists
        const userData = await User.findOne({ id: userId });
        if (!userData) {
            return res.status(400).json({
                status: false,
                errors: [{
                    param: "user",
                    message: "User not found.",
                    code: "RESOURCE_NOT_FOUND"
                }]
            });
        }

        // Check if the role exists
        const roleData = await Role.findOne({ id: roleId });
        if (!roleData) {
            return res.status(400).json({
                status: false,
                errors: [{
                    param: "role",
                    message: "Role not found.",
                    code: "RESOURCE_NOT_FOUND"
                }]
            });
        }

        // Check if the current user is a Community Admin
        if (communityData.owner !== currentUserId) {
            return res.status(403).json({
                status: false,
                errors: [{
                    param: "user",
                    message: "You are not authorized to perform this action.",
                    code: "NOT_ALLOWED_ACCESS"
                }]
            });
        }

        // Check if the user is already a member of the community
        const existingMember = await Member.findOne({ community: communityId, user: userId });
        if (existingMember) {
            return res.status(400).json({
                status: false,
                errors: [{
                    message: "User is already added in the community.",
                    code: "RESOURCE_EXISTS"
                }]
            });
        }

        // Create a unique ID for the member
        const memberId = await Snowflake.generate({ community: communityId, user: userId });

        // Create the member
        const member = new Member({
            id: memberId,
            community: communityId,
            user: userId,
            role: roleId,
            created_at: new Date().toISOString(),
        });

        // Save the member to the database
        await member.save();

        // Prepare the response data
        res.status(200).json({
            status: true,
            content: {
                data: {
                    id: memberId,
                    community: communityId,
                    user: userId,
                    role: roleId,
                    created_at: member.created_at,
                },
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Controller function to remove a member from a community
const removeMember = async (req, res) => {
    const memberId = req.params.id;
    const currentUserId = req.user.id;

    try {
        // Find the member by ID
        const member = await Member.findOne({ id: memberId });
        if (!member) {
            return res.status(400).json({
                status: false,
                errors: [{
                    message: "Member not found.",
                    code: "RESOURCE_NOT_FOUND"
                }]
            });
        }

        // Check if the current user is a Community Admin
        const isCommunityAdmin = await Community.findOne({ id: member.community, owner: currentUserId });

        // If not a Community Admin, check if the user is a Community Moderator
        if (!isCommunityAdmin) {
            const moderator = await Role.findOne({ name: "Community Moderator" });
            const isModerator = await Member.findOne({ role: moderator.id, community: member.community, user: currentUserId });
            if (!isModerator) {
                return res.status(403).json({
                    status: false,
                    errors: [{
                        param: "user",
                        message: "You are not authorized to perform this action.",
                        code: "NOT_ALLOWED_ACCESS"
                    }]
                });
            }
        }

        // Remove the member
        await Member.findOneAndDelete({ id: memberId });

        // Send success response
        res.status(200).json({ status: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Export the controller functions
module.exports = {
    addMember,
    removeMember,
};