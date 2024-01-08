const { Snowflake } = require('@theinternetfolks/snowflake');
const { Community, Member, Role, User } = require('../db/db');
const { communityValidator } = require('../utils/validator');

// Controller function to create a community
const createCommunity = async (req, res) => {
    const { name } = req.body;
    const ownerId = req.user.id;

    // Validate community data using the helper function
    const validation = communityValidator(name);
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
        // Generate a unique ID for the community
        const communityId = await Snowflake.generate({ name: name, owner: ownerId });

        // Automatically create a slug from the name
        const slug = name.toLowerCase().replace(/\s+/g, '-');

        // Create the community
        const community = new Community({
            id: communityId,
            name: name,
            slug: slug,
            owner: ownerId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });

        await community.save();

        // Check if "Community Admin" role exists, create if not
        const role = await Role.findOne({ name: "Community Admin" });
        if (!role) {
            role = new Role({
                id: await Snowflake.generate({ name: "Community Admin" }),
                name: "Community Admin",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });

            await role.save();
        }

        // Add the owner as a member of the community with "Community Admin" role        
        const member = new Member({
            id: await Snowflake.generate({ community: communityId, user: ownerId }),
            community: communityId,
            user: ownerId,
            role: role.id,
            created_at: new Date().toISOString(),
        });

        await member.save();

        // Prepare the response data
        const responseData = {
            status: true,
            constent: {
                data: {
                    id: community.id,
                    name: community.name,
                    slug: community.slug,
                    owner: community.owner,
                    created_at: community.created_at,
                    updated_at: community.updated_at
                }
            }
        }

        res.status(200).json(responseData);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Controller function to get all communities with pagination
const getCommunities = async (req, res) => {
    try {
        const perPage = parseInt(req.query.perPage) || 10; // Default to 10 items per page
        const page = parseInt(req.query.page) || 1; // Default to page 1

        // Fetch the total count of communities for meta information
        const communities = await Community.find()
            .skip((page - 1) * perPage)
            .limit(perPage);


        // Fetch the total count of roles for meta information
        const totalCommunities = await Community.countDocuments();

        // Prepare the response
        const responseData = {
            status: true,
            content: {
                meta: {
                    total: totalCommunities,
                    pages: Math.ceil(totalCommunities / perPage),
                    page: page,
                },
                data: await Promise.all(communities.map(async (community) => {
                    const ownerName = await User.findOne({ id: community.owner });
                    return {
                        id: community.id,
                        name: community.name,
                        slug: community.slug,
                        owner: {
                            id: community.owner,
                            name: ownerName.name,
                        },
                        created_at: community.created_at,
                        updated_at: community.updated_at,
                    };
                })),
            },
        };

        res.status(200).json(responseData);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Controller function to get members of a community with pagination
const getCommunityMembers = async (req, res) => {
    const communitySlug = req.params.id;

    try {
        const perPage = parseInt(req.query.perPage) || 10; // Default to 10 items per page
        const page = parseInt(req.query.page) || 1; // Default to page 1

        // Find the community by its slug to get the ID
        const community = await Community.findOne({ slug: communitySlug });
        if (!community) {
            return res.status(404).json({ message: 'Community not found' });
        }

        // Use the community ID to find its members
        const members = await Member.find({ community: community.id })
            .skip((page - 1) * perPage)
            .limit(perPage);


        // Fetch the total count of members for meta information
        const totalMembers = await Member.countDocuments({ community: community.id });

        // Prepare the response in the specified format
        const responseData = {
            status: true,
            content: {
                meta: {
                    total: totalMembers,
                    pages: Math.ceil(totalMembers / perPage),
                    page: page,
                },
                data: await Promise.all(members.map(async (member) => {
                    const userName = await User.findOne({ id: member.user });
                    const roleName = await Role.findOne({ id: member.role });
                    return {
                        id: member.id,
                        community: member.community,
                        user: {
                            id: member.user,
                            name: userName.name,
                        },
                        role: {
                            id: member.role,
                            name: roleName.name
                        },
                        created_at: member.created_at
                    };
                })),
            },
        };

        res.status(200).json(responseData);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Controller function to get communities owned by the signed-in user with pagination
const getOwnedCommunities = async (req, res) => {
    const ownerId = req.user.id;

    try {
        const perPage = parseInt(req.query.perPage) || 10; // Default to 10 items per page
        const page = parseInt(req.query.page) || 1; // Default to page 1

        // Fetch communities owned by the user with pagination from the database
        const ownedCommunities = await Community.find({ owner: ownerId })
            .skip((page - 1) * perPage)
            .limit(perPage);

       // Fetch the total count of owned communities for meta information
        const totalOwnedCommunities = await Community.countDocuments({ owner: ownerId });

        // Prepare the response in the specified format
        const responseData = {
            status: true,
            content: {
                meta: {
                    total: totalOwnedCommunities,
                    pages: Math.ceil(totalOwnedCommunities / perPage),
                    page: page,
                },
                data: ownedCommunities.map(community => ({
                    id: community.id,
                    name: community.name,
                    slug: community.slug,
                    owner: community.owner,
                    created_at: community.created_at,
                    updated_at: community.updated_at,
                }))
            },
        };
        res.status(200).json(responseData);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Controller function to get communities joined by the signed-in user with pagination
const getJoinedCommunities = async (req, res) => {
    const memberId = req.user.id;

    try {
        const perPage = parseInt(req.query.perPage) || 10; // Default to 10 items per page
        const page = parseInt(req.query.page) || 1; // Default to page 1

        // Find all memberships where the user is a member
        const memberships = await Member.find({ user: memberId });


        // Extract the community IDs from the memberships
        const communityIds = memberships.map(member => member.community);

        // Get details of the communities using the obtained IDs
        const joinedCommunities = await Community.find({ id: { $in: communityIds } })
            .skip((page - 1) * perPage)
            .limit(perPage);

        const totalJoinedCommunities = await Community.countDocuments({ id: { $in: communityIds } });


        // Prepare the response in the specified format
        const responseData = {
            status: true,
            content: {
                meta: {
                    total: totalJoinedCommunities,
                    pages: Math.ceil(totalJoinedCommunities / perPage),
                    page: page,
                },
                data: await Promise.all(joinedCommunities.map(async (community) => {
                    const ownerName = await User.findOne({ id: community.owner });
                    return {
                        id: community.id,
                        name: community.name,
                        slug: community.slug,
                        owner: {
                            id: community.owner,
                            name: ownerName.name,
                        },
                        created_at: community.created_at,
                        updated_at: community.updated_at,
                    };
                })),
            },
        };

        res.status(200).json(responseData);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = {
    createCommunity,
    getCommunities,
    getCommunityMembers,
    getOwnedCommunities,
    getJoinedCommunities
}