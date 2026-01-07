const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ExamAttempt = require('./models/ExamAttempt');
const Exam = require('./models/Exam');
const User = require('./models/User');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
        
        const attempts = await ExamAttempt.find({})
            .populate({
                path: 'exam',
                populate: {
                    path: 'quizzes.quiz',
                    select: 'title'
                }
            })
            .sort('-createdAt')
            .limit(1);

        if (attempts.length === 0) {
            console.log("No attempts found.");
        } else {
            const a = attempts[0];
            console.log("Attempt ID:", a._id);
            console.log("Exam Field Type:", typeof a.exam);
            if (a.exam) {
                console.log("Exam Keys:", Object.keys(a.exam.toObject ? a.exam.toObject() : a.exam));
                console.log("Exam Quizzes Value:", a.exam.quizzes);
            } else {
                console.log("Exam field is null/undefined");
            }
        }
        
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

connectDB();
