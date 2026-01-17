const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Load models
const User = require('./models/User');
const UserRole = require('./models/UserRole');
const Category = require('./models/Category');
const Quiz = require('./models/Quiz');
const Question = require('./models/Question');

// Connect to DB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        process.exit(1);
    }
};

// Sample Data
const users = [
  {
    name: 'Admin User',
    email: 'admin@quizzera.com',
    password: 'password123',
    phone: '1234567890',
    role: 'admin' // Used for logic, not saved to User model directly
  },
  {
    name: 'Student User',
    email: 'student@example.com', // Changed from user@ to avoid confusion
    password: 'password123',
    phone: '0987654321',
    role: 'user'
  }
];

const categories = [
  {
    name: 'Web Development',
    description: 'Quizzes about HTML, CSS, JavaScript, and modern frameworks.',
    icon: '💻',
    color: '#3B82F6'
  },
  {
    name: 'Data Science',
    description: 'Machine Learning, AI, Python, and Statistics.',
    icon: '📊',
    color: '#10B981'
  },
  {
    name: 'General Knowledge',
    description: 'History, Geography, and Current Affairs.',
    icon: '🌍',
    color: '#F59E0B'
  }
];

const importData = async () => {
  await connectDB();

  try {
    console.log('🔄 destroying old data...');
    
    // Clear existing data
    await User.deleteMany();
    await UserRole.deleteMany();
    await Category.deleteMany();
    await Quiz.deleteMany();
    await Question.deleteMany();

    console.log('🗑️  Data Destroyed...');

    // Import Users & Roles
    const createdUsers = [];
    
    for (const u of users) {
        // Create User
        const newUser = await User.create({
            name: u.name,
            email: u.email,
            password: u.password,
            phone: u.phone
        });
        
        // Create UserRole
        await UserRole.create({
            userId: newUser._id,
            role: u.role
        });

        createdUsers.push({...newUser._doc, role: u.role});
        console.log(`👤 Created ${u.role}: ${u.email}`);
    }
    
    const adminUser = createdUsers.find(u => u.role === 'admin')._id;

    // Import Categories
    const createdCategories = [];
    for (const c of categories) {
        const cat = await Category.create({ ...c, createdBy: adminUser });
        createdCategories.push(cat);
    }
    const webDevCat = createdCategories[0]._id;

    console.log('📚 Categories Imported...');

    // Import Quiz
    const quiz1 = await Quiz.create({
      title: 'JavaScript Basics',
      description: 'Test your knowledge of JavaScript fundamentals including variables, loops, and functions.',
      category: webDevCat,
      difficulty: 'easy',
      duration: 15,
      totalQuestions: 0, 
      createdBy: adminUser,
      status: 'published',
      tags: ['javascript', 'web', 'basics']
    });

    console.log('📝 Quiz Created...');

    // Import Questions
    const questions = [
      {
        quiz: quiz1._id,
        question: 'What is the correct way to declare a variable in JavaScript that cannot be reassigned?',
        type: 'single',
        options: [
          { id: '1', text: 'var', isCorrect: false },
          { id: '2', text: 'let', isCorrect: false },
          { id: '3', text: 'const', isCorrect: true },
          { id: '4', text: 'fixed', isCorrect: false }
        ],
        correctAnswers: ['3'],
        explanation: 'The `const` keyword is used to declare variables that are block-scoped and cannot be reassigned.',
        createdBy: adminUser,
        order: 1
      },
      {
        quiz: quiz1._id,
        question: 'Which method is used to add an element to the end of an array?',
        type: 'single',
        options: [
          { id: '1', text: 'push()', isCorrect: true },
          { id: '2', text: 'pop()', isCorrect: false },
          { id: '3', text: 'unshift()', isCorrect: false },
          { id: '4', text: 'shift()', isCorrect: false }
        ],
        correctAnswers: ['1'],
        explanation: '`push()` adds elements to the end, while `unshift()` adds to the beginning.',
        createdBy: adminUser,
        order: 2
      }
    ];

    await Question.insertMany(questions);
    
    // Update count
    await Quiz.findByIdAndUpdate(quiz1._id, { totalQuestions: questions.length });

    console.log('❓ Questions Imported...');

    console.log('✅ Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  await connectDB();
  try {
    await User.deleteMany();
    await UserRole.deleteMany();
    await Category.deleteMany();
    await Quiz.deleteMany();
    await Question.deleteMany();

    console.log('🗑️  Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
