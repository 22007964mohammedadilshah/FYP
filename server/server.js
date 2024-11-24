const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import cors only once
require('dotenv').config(); // Load environment variables

const app = express();

// Debug log to confirm server is starting
console.log("Starting server setup...");

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests only from the React app
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
  credentials: true // Allow credentials if needed
}));

app.use(bodyParser.json()); // Parse JSON request bodies
app.use(express.json()); // Additional JSON parsing support

// Debug log to track all incoming requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`); // Logs the HTTP method and request URL
    next();
});

// Routes
console.log("Mounting routes...");
app.use('/api/groceries', require('./routes/groceryRoutes'));
console.log("Grocery routes mounted at /api/groceries");
app.use('/api/recipes', require('./routes/recipeRoutes'));
console.log("Recipe routes mounted at /api/recipes");
app.use('/api/calculator', require('./routes/calculatorRoutes'));
console.log("Calculator routes mounted at /api/calculator");
app.use('/register', require('./routes/registerRoute'));
console.log("Register route mounted at /register");
app.use('/login', require('./routes/loginRoute'));
console.log("Login route mounted at /login");
app.use('/admin', require('./routes/adminRoutes'));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    console.log("Health check endpoint hit");
    res.json({ status: 'Server is running!' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
