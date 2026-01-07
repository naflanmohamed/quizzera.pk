const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Exam = require('./models/Exam');
const User = require('./models/User'); // Need a user to map createdBy

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
        
        // Find an admin user or create one?
        // Let's just pick the first user for testing if available
        let user = await User.findOne();
        if (!user) {
            console.log("No users found to assign creator!");
            // process.exit(1);
            // hardcode an ObjectId if needed or skip
        } else {
             console.log(`Using user: ${user._id}`);
        }

        const newExam = await Exam.create({
            title: "Test Exam CLI " + Date.now(),
            description: "Created via CLI script",
            createdBy: user ? user._id : new mongoose.Types.ObjectId(),
            status: 'draft'
        });

        console.log("Exam Created:", newExam._id);
        
        const found = await Exam.findById(newExam._id);
        console.log("Exam Found via findById:", !!found);
        
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

connectDB();
