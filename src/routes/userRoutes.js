const { Router } = require('express');
const userValidation = require('../middlewares/userValidation');
const userAuthentication = require('../middlewares/userAuthentication');
const userAuthorization = require('../middlewares/userAuthorization');
const controller = require('../controllers/userController');

const router = Router();

// User signup route with validation middleware
router.post('/signup', userValidation, controller.signUp);

// User signin route with authentication middleware
router.post('/signin', userAuthentication, controller.signIn);

// User profile route with authorization middleware
router.get('/me', userAuthorization, controller.getUserProfile);


module.exports = router;
