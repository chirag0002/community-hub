const rateLimit = require('express-rate-limit');

// Create a rate limiter middleware
const rateLimiter = rateLimit({
    windowMs: 10 * 1000, // 10 seconds window
    max: 5, // Limit each IP to 5 requests per windowMs
    message: { msg: 'Too many requests' }, // Message to send when the limit is exceeded
});


module.exports = rateLimiter;
