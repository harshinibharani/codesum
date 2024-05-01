require('dotenv').config(); // This loads your environment variables from a .env file
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
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
            const dateString = new Date().toLocaleDateString('en-CA'); // Canada's locale uses YYYY-MM-DD format
            console.log(dateString);
            await database.collection('interactions').insertOne({
                userId: user._id,
                date: dateString,
                action: 'login'
            });

            // res.json({ message: 'Login successful', user: { id: user._id, username: user.username } });
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

// In your server file
app.get('/getAllUserHistories', async (req, res) => {
    try {
        const database = client.db('CodeSummary');
        const userhistory = database.collection('userhistory');
        const histories = await userhistory.find({}).toArray();
        res.json({ histories });
    } catch (error) {
        console.error('Error retrieving all user histories:', error);
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
        const result = await usersCollection.updateOne({ _id: new ObjectId(userId) }, { $set: { role } });
     
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

app.get('/summaryUsage', async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString().split('T')[0];
    // console.log('today',todayString);
    const fiveDaysAgo = new Date(today.getTime() - (5 * 24 * 60 * 60 * 1000));
    const fiveDaysAgoString = fiveDaysAgo.toISOString().split('T')[0];
    // console.log('five days ago',fiveDaysAgoString);

    try {
        const database = client.db('CodeSummary');
        const interactions = database.collection('interactions');

        const results = await interactions.aggregate([
            {
                $match: {
                    date: {
                        $gte: fiveDaysAgoString,
                        $lte: todayString
                    }
                }
            },
            {
                $group: {
                    _id: "$date",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id": 1 }
            }
        ]).toArray();

        // console.log('results',results);
        res.json(results);
    } catch (error) {
        console.error('Error retrieving summary usage:', error);
        res.status(500).json({ message: 'Failed to fetch summary usage', error: error.message });
    }
});

// Endpoint to get the total number of visits
app.get('/getTotalVisits', async (req, res) => {
    try {
        const database = client.db('CodeSummary');
        const interactions = database.collection('interactions');
        const count = await interactions.countDocuments();
        res.json({ totalVisits: count });
    } catch (error) {
        console.error('Error fetching total visits:', error);
        res.status(500).json({ message: 'Error fetching total visits' });
    }
});

// Delete user endpoint
app.delete('/deleteUser/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const database = client.db('CodeSummary');
        const users = database.collection('users');
        const result = await users.deleteOne({ _id: new ObjectId(userId) });
        console.log(result);
        if (result.deletedCount === 1) {
            res.status(200).json({ success: true, message: "User deleted successfully" });
        } else {
            res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});