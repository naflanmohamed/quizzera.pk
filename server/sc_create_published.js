const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Exam = require('./models/Exam');
const User = require('./models/User');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
        
        let user = await User.findOne();
        
        const newExam = await Exam.create({
            title: "Manual Verification Exam",
            description: "This exam was created to verify the User Flow.",
            createdBy: user ? user._id : new mongoose.Types.ObjectId(),
            status: 'published',
            price: 0,
            duration: 30,
            passResult: 40,
            quizzes: [] // Empty quizzes for now, or I'd need to fetch some
        });

        console.log("Published Exam Created:", newExam._id);
        console.log("Title:", newExam.title);
        
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

connectDB();
