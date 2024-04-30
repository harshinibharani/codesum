require('dotenv').config(); // This loads your environment variables from a .env file
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json()); // This middleware is used to parse JSON bodies

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

// Connect to MongoDB
async function connectToMongo() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}
connectToMongo();

// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const database = client.db('CodeSummary');
        const usersCollection = database.collection('users');

        const user = await usersCollection.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            return res.json({ message: 'Login successful', user });
        } else {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server Error' });
    }
});


// Register route
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const saltRounds = 10; // Recommended for most use cases

    try {
        const database = client.db('CodeSummary');
        const usersCollection = database.collection('users');

        const existingUser = await usersCollection.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password with a salt
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = {
            username, 
            password: hashedPassword,
            role: 'user'
        };
        const result = await usersCollection.insertOne(newUser);

        return res.json({ message: 'User registered successfully', newUser });
    } catch (error) {
        console.error('Error during registration:', error);
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// Save User History route
app.post('/saveUserHistory', async (req, res) => {
    const { userId, inputCode, selectedSummary, feedback, naturalness, usefulness, consistency } = req.body;
    if (!userId || !inputCode || !selectedSummary) {
        return res.status(400).json({ message: 'Essential data are missing' });
    }

    // const natural = parseInt(naturalness);
    // const useful = parseInt(usefulness);
    // const consist = parseInt(consistency);
    try {
        const database = client.db('CodeSummary');
        const userhistory = database.collection('userhistory');

        const newUserHistory = {
            userId,
            inputCode,
            selectedSummary,
            feedback,
            naturalness,
            usefulness,
            consistency
        };

        await userhistory.insertOne(newUserHistory);
        res.json({ message: 'User history saved successfully' });
    } catch (error) {
        console.error('Error saving user history:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Retrieve User History route
app.get('/getUserHistory', async (req, res) => {
    const { userId } = req.query;  // Receive userId as a query parameter
    if (!userId) {
        return res.status(400).json({ message: 'UserId is required' });
    }

    try {
        const database = client.db('CodeSummary');
        const userhistory = database.collection('userhistory');

        const history = await userhistory.find({ userId }).toArray();
        if (history.length === 0) {
            return res.status(404).json({ message: 'No history found for this user' });
        }

        res.json({ message: 'User history retrieved successfully', history });
    } catch (error) {
        console.error('Error retrieving user history:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

app.get('/getAllUsers', async (req, res) => {
    try {
        const database = client.db('CodeSummary');
        const usersCollection = database.collection('users');
        const users = await usersCollection.find({}).project({ password: 0 }).toArray(); // Excluding passwords from the result
        res.json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Failed to fetch users', error: error.message });
    }
});

// Endpoint to get user history by userId (for admin dashboard)
app.get('/getUserHistory', async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ message: 'UserId is required' });
    }

    try {
        const database = client.db('CodeSummary');
        const userhistory = database.collection('userhistory');
        const history = await userhistory.find({ userId }).toArray();
        res.json({ history });
    } catch (error) {
        console.error('Error retrieving user history:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// server.js
app.post('/changeUserRole', async (req, res) => {
    const { userId, role } = req.body;
    if (!userId || !role) {
        return res.status(400).json({ message: 'User ID and new role are required' });
    }

    try {
        const database = client.db('CodeSummary');
        const usersCollection = database.collection('users');
        const result = await usersCollection.updateOne({ _id: userId }, { $set: { role } });
        if (result.modifiedCount === 1) {
            res.json({ success: true, message: 'Role updated successfully' });
        } else {
            res.json({ success: false, message: 'No changes made to the role' });
        }
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ message: 'Failed to update user role', error: error.message });
    }
});

