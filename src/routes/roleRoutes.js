const { Router } = require('express');
const controller = require('../controllers/roleController');

const router = Router();

// Create a role
router.post('/', controller.createRole);

// Get all roles
router.get('/', controller.getRoles);

module.exports = router;
