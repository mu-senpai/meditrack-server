const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const port = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(cookieParser());
app.use(
    cors({
        origin: [
            "http://localhost:5173",
            // "https://your-frontend-url.web.app",
            // "https://your-frontend-url.firebaseapp.com",
        ],
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// JWT Verification Middleware
const verifyToken = (req, res, next) => {
    const token = req?.cookies?.token;

    if (!token) {
        return res.status(401).send({ message: "Unauthorized Access!" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Unauthorized Access!" });
        }
        req.user = decoded;
        next();
    });
};

// MongoDB Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.j5mqi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        // Initialize database collections
        const userCollection = client.db("meditrackDB").collection("users");
        const campCollection = client.db("meditrackDB").collection("camps");
        const registrationCollection = client.db("meditrackDB").collection("registrations");

        // Placeholder: APIs will be implemented here later
        // Example structure for creating APIs:
        // app.get('/api-endpoint', async (req, res) => {
        //     const result = await someCollection.find().toArray();
        //     res.send(result);
        // });
    } finally {
        // Ensure the client is closed properly when the server stops
        // await client.close();
    }
}
run().catch(console.dir);

// Default route
app.get('/', (req, res) => {
    res.send('Meditrack Server is running!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
