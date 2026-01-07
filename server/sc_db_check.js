const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Exam = require('./models/Exam');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
        
        const exams = await Exam.find({});
        console.log(`Found ${exams.length} exams`);
        exams.forEach(e => {
            console.log(`ID: ${e._id} | Title: ${e.title} | Status: ${e.status}`);
        });
        
        if (exams.length > 0) {
            console.log("First exam ID type:", typeof exams[0]._id);
            console.log("First exam ID toString:", exams[0]._id.toString());
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

connectDB();
