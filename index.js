const express = require('express');
const bodyParser = require('body-parser');
const routerRole = require('./src/routes/roleRoutes');
const routerUser = require('./src/routes/userRoutes');
const routerMember = require('./src/routes/memberRoutes');
const routerCommunity = require('./src/routes/communityRoutes');
const rateLimiter = require('./src/utils/rateLimiter');

const app = express();
const PORT = process.env.PORT || 8081;

// Use body-parser middleware for parsing JSON requests
app.use(bodyParser.json());

// Apply rate limiter middleware for controlling request rate
app.use(rateLimiter);

// Define routes for different resources
app.use("/v1/role", routerRole);
app.use("/v1/auth", routerUser);
app.use("/v1/community", routerCommunity);
app.use("/v1/member", routerMember);

// Handle 404 errors
app.all('*', (req, res) => {
    return res.status(404).send({ error: 'Page not found' });
});

// Global error handler for internal server errors
app.use((err, req, res, next) => {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});