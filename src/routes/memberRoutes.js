const { Router } = require('express');
const userAuthorization = require('../middlewares/userAuthorization');
const controller = require('../controllers/memberController');

// Create an Express router
const router = Router();

// Add a member to a community (requires user authorization)
router.post('/', userAuthorization, controller.addMember);

// Remove a member from a community by member ID (requires user authorization)
router.delete('/:id', userAuthorization, controller.removeMember);


module.exports = router;
