const { Router } = require('express');
const userAuthorization = require('../middlewares/userAuthorization');
const controller = require('../controllers/communityController');


const router = Router();

// Create a community (requires user authorization)
router.post('/', userAuthorization, controller.createCommunity);

// Get all communities
router.get('/', controller.getCommunities);

// Get all members of a community by community ID
router.get('/:id/members', controller.getCommunityMembers);

// Get communities owned by the signed-in user (requires user authorization)
router.get('/me/owner', userAuthorization, controller.getOwnedCommunities);

// Get all communities joined by the signed-in user (requires user authorization)
router.get('/me/member', userAuthorization, controller.getJoinedCommunities);


module.exports = router;
