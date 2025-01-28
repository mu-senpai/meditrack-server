require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const stripe = require("stripe")(process.env.PAYMENT_SECRET)
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 5000;
const app = express();

// Middleware
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

        // JWT Verification Middleware
        const verifyToken = (req, res, next) => {
            if (!req.headers.authorization) {
                return res.status(401).send({ message: 'Unauthorized Access!' });
            }
            const token = req.headers.authorization.split(' ')[1];
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    return res.status(401).send({ message: 'Unauthorized access' })
                }
                req.decoded = decoded;
                next();
            })
        }

        // Admin Verification Middleware
        const verifyAdmin = async (req, res, next) => {
            const email = req.decoded.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            const isAdmin = user?.role === 'admin';
            if (!isAdmin) {
                return res.status(403).send({ message: 'forbidden access' });
            }
            next();
        }

        // JWT API
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
            res.send({ token });
        })

        // API to retrieve all camps
        app.get('/camps', async (req, res) => {
            try {
                const { search, sortBy, order, page, limit } = req.query;

                // Convert page & limit to numbers, default to page 1 & 10 camps per page
                const pageNumber = parseInt(page) || 1;
                const limitNumber = parseInt(limit) || 10;
                const skip = (pageNumber - 1) * limitNumber;

                // Create a filter for search (match camp name or healthcare professional)
                const filter = search
                    ? {
                        $or: [
                            { campName: { $regex: search, $options: "i" } },
                            { healthcareProfessional: { $regex: search, $options: "i" } }
                        ]
                    }
                    : {};

                // Sorting logic
                const sortOptions = {};
                if (sortBy) {
                    sortOptions[sortBy] = order === "asc" ? 1 : -1;
                }

                // Fetch filtered & sorted data with pagination
                const camps = await campCollection
                    .find(filter)
                    .sort(sortOptions)
                    .skip(skip)
                    .limit(limitNumber)
                    .toArray();

                // Get total count for pagination metadata
                const totalCamps = await campCollection.countDocuments(filter);

                res.send({
                    camps,
                    totalCamps,
                    currentPage: pageNumber,
                    totalPages: Math.ceil(totalCamps / limitNumber),
                });
            } catch (error) {
                res.status(500).send({ message: "Failed to retrieve camps", error });
            }
        });

        // API to retrieve camp details by ID
        app.get('/camps/:id', verifyToken, async (req, res) => {
            const id = req.params.id;

            try {
                const camp = await campCollection.findOne({ _id: new ObjectId(id) });
                res.send(camp);
            } catch (error) {
                console.error("Error fetching camp details:", error);
                res.status(500).send({ message: "Failed to fetch camp details", error });
            }
        });

        app.patch('/increment-participant/:id', verifyToken, verifyAdmin, async (req, res) => {
            const { id } = req.params;

            try {
                const result = await campCollection.updateOne(
                    { _id: new ObjectId(id) },
                    { $inc: { participantCount: 1 } }
                );

                if (result.modifiedCount === 0) {
                    return res.status(404).send({ message: "Camp not found or no change made" });
                }

                res.send({ success: true, message: "Participant count updated successfully", result });
            } catch (error) {
                console.error("Error updating participant count:", error);
                res.status(500).send({ message: "Failed to update participant count", error });
            }
        });


        // API to retrieve top 4 popular camps based on participantCount
        app.get('/popular-camps', async (req, res) => {
            try {
                const popularCamps = await campCollection
                    .find()
                    .sort({ participantCount: -1 })
                    .limit(4)
                    .toArray();
                res.send(popularCamps);
            } catch (error) {
                res.status(500).send({ message: "Failed to retrieve popular camps", error });
            }
        });

        // API to retrieve top 3 popular camps based on participantCount for medium devices
        app.get('/popular-camps-md', async (req, res) => {
            try {
                const popularCamps = await campCollection
                    .find()
                    .sort({ participantCount: -1 })
                    .limit(3)
                    .toArray();
                res.send(popularCamps);
            } catch (error) {
                res.status(500).send({ message: "Failed to retrieve popular camps", error });
            }
        });

        app.post('/camps', verifyToken, verifyAdmin, async (req, res) => {
            const camp = req.body;
            try {
                const result = await campCollection.insertOne(camp);
                res.send({ success: true, result });
            } catch (error) {
                res.status(500).send({ message: "Failed to add camp", error });
            }
        });

        app.patch('/update-camp/:campId', verifyToken, verifyAdmin, async (req, res) => {
            const { campId } = req.params;
            const updatedData = req.body;
            try {
                const filter = { _id: new ObjectId(campId) };
                const updateDoc = {
                    $set: updatedData,
                };
                const result = await campCollection.updateOne(filter, updateDoc);
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Failed to update camp", error });
            }
        });

        app.delete('/delete-camp/:campId', verifyToken, verifyAdmin, async (req, res) => {
            const { campId } = req.params;
            try {
                const result = await campCollection.deleteOne({ _id: new ObjectId(campId) });
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Failed to delete camp", error });
            }
        });

        // API to register user for a camp
        app.post('/register-camp', verifyToken, async (req, res) => {
            const registrationData = req.body;

            if (registrationData.participantEmail !== req.decoded.email) {
                return res.status(403).send({ message: 'forbidden access' });
            }

            try {
                const result = await registrationCollection.insertOne(registrationData);
                res.send({ success: true, result });
            } catch (error) {
                res.status(500).send({ message: "Failed to register user", error });
            }
        });

        // API to delete registered camp by _id
        app.delete('/delete-registered-camp/:id', verifyToken, async (req, res) => {
            const { id } = req.params;
            try {
                const result = await registrationCollection.deleteOne({ _id: new ObjectId(id) });
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Failed to delete camp", error });
            }
        });

        // API to retrieve registered camps by a user
        app.get('/registered-camps/:email', verifyToken, async (req, res) => {
            const email = req.params.email;

            if (email !== req.decoded.email) {
                return res.status(403).send({ message: 'forbidden access' });
            }

            try {
                const result = await registrationCollection.find({ participantEmail: email }).toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Failed to fetch registered camps", error });
            }
        });

        app.post("/create-payment-intent", async (req, res) => {
            try {
                const { price } = req.body;

                if (!price || isNaN(price)) {
                    return res.status(400).send({ message: "Invalid price provided." });
                }

                const amount = Math.round(Number(price) * 100);

                const paymentIntent = await stripe.paymentIntents.create({
                    amount: amount,
                    currency: "usd",
                    payment_method_types: ["card"],
                });

                res.send({ clientSecret: paymentIntent.client_secret });
            } catch (error) {
                console.error("Error creating payment intent:", error);
                res.status(500).send({ message: "Failed to create payment intent", error });
            }
        });


        // API to update payment status
        app.patch('/update-payment/:id', verifyToken, async (req, res) => {
            try {
                const { id } = req.params;
                const { paymentId } = req.body;

                // 🔹 Check if ID is valid before converting to ObjectId
                if (!id || !ObjectId.isValid(id)) {
                    return res.status(400).send({ message: "Invalid payment ID format." });
                }

                if (!paymentId) {
                    return res.status(400).send({ message: "Payment ID is required." });
                }

                const paymentTime = new Date().toISOString();

                const result = await registrationCollection.updateOne(
                    { _id: new ObjectId(id) }, // ✅ Now safely converts to ObjectId
                    {
                        $set: {
                            paymentStatus: "Paid",
                            paymentTime,
                            paymentId,
                        }
                    }
                );

                if (result.modifiedCount === 0) {
                    return res.status(404).send({ message: "Payment record not found." });
                }

                res.send({ success: true, message: "Payment updated successfully!" });

            } catch (error) {
                console.error("Error updating payment status:", error);
                res.status(500).send({ message: "Failed to update payment", error });
            }
        });


        // API to update feedback
        app.patch('/update-feedback/:id', verifyToken, async (req, res) => {
            const { id } = req.params;
            const { feedback } = req.body;
            try {
                const result = await registrationCollection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: { feedback } }
                );
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Failed to update feedback", error });
            }
        });

        // API to retrieve all registrations
        app.get('/registrations', verifyToken, verifyAdmin, async (req, res) => {
            try {
                const result = await registrationCollection.find().toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Failed to fetch registrations", error });
            }
        });

        // API to update registration status
        app.patch('/update-registration-status/:id', verifyToken, verifyAdmin, async (req, res) => {
            const { id } = req.params;
            const { status } = req.body;

            try {
                const filter = { _id: new ObjectId(id) };
                const updateDoc = {
                    $set: { status },
                };
                const result = await registrationCollection.updateOne(filter, updateDoc);
                res.send(result);
            } catch (error) {
                console.error("Error updating registration status:", error);
                res.status(500).send({ message: "Failed to update registration status", error });
            }
        });


        // User related APIs
        // API to retrieve all user information
        app.get('/users', async (req, res) => {
            const cursor = userCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        // API to retrieve user information by email
        app.get('/users/:email', verifyToken, async (req, res) => {
            const email = req.params.email;

            if (email !== req.decoded.email) {
                return res.status(403).send({ message: 'forbidden access' });
            }

            const query = { email: email };
            const result = await userCollection.findOne(query);
            res.send(result);
        });

        // API to update user profile
        app.patch('/users/profile', verifyToken, async (req, res) => {
            const { email, name, photoURL, phone } = req.body;

            if (email !== req.decoded.email) {
                return res.status(403).send({ message: 'forbidden access' });
            }

            const filter = { email: email };
            const updateDoc = {
                $set: {
                    name: name,
                    photoURL: photoURL,
                    phone: phone,
                },
            };

            try {
                const result = await userCollection.updateOne(filter, updateDoc);
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Failed to update profile", error });
            }
        });

        // API to check if user is admin
        app.get('/users/admin/:email', verifyToken, async (req, res) => {
            const email = req.params.email;

            if (email !== req.decoded.email) {
                return res.status(403).send({ message: 'forbidden access' })
            }

            const query = { email: email };
            const user = await userCollection.findOne(query);
            let admin = false;
            if (user) {
                admin = user?.role === 'admin';
            }
            res.send({ admin });
        })

        // API to create a new user
        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await userCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'user already exists', insertedId: null })
            }
            const result = await userCollection.insertOne(user);
            res.send(result);
        });

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: user.name,
                    email: user.email,
                    photoURL: user.photoURL,
                    createdAt: user.createdAt,
                    uid: user.uid,
                    phone: user.phone,
                    role: "user",
                },
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });

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