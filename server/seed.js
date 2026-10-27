// Sample data. Run with `npm run seed` (wipes and refills the database).
// The built-in development database (MONGO_URI=memory) is seeded automatically the first time it starts.
const Student = require('./models/Student');
const Company = require('./models/Company');
const Drive = require('./models/Drive');
const Application = require('./models/Application');
const User = require('./models/User');

const day = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

async function seed() {
  await Promise.all([Student, Company, Drive, Application, User].map((M) => M.deleteMany({})));

  const [google, infosys, bosch, razorpay, tcs] = await Company.create([
    { name: 'Google', sector: 'Product', location: 'Bengaluru', website: 'https://careers.google.com', hrEmail: 'campus@google.com' },
    { name: 'Infosys', sector: 'Service', location: 'Mysuru', website: 'https://www.infosys.com/careers', hrEmail: 'campus@infosys.com' },
    { name: 'Bosch', sector: 'Core', location: 'Bengaluru', website: 'https://www.bosch.in/careers' },
    { name: 'Razorpay', sector: 'Fintech', location: 'Bengaluru', website: 'https://razorpay.com/jobs' },
    { name: 'TCS', sector: 'Service', location: 'Pan India', website: 'https://www.tcs.com/careers' },
  ]);

  const [sde, systemEngineer, embedded, backendIntern, ninja] = await Drive.create([
    { company: google._id, role: 'Software Engineer', packageLPA: 32, driveDate: day(-20), minCgpa: 8.5, maxBacklogs: 0, branches: ['CSE', 'ISE', 'AIML'], status: 'completed' },
    { company: infosys._id, role: 'Systems Engineer', packageLPA: 6.5, driveDate: day(-10), minCgpa: 6.5, maxBacklogs: 1, branches: [], status: 'ongoing' },
    { company: bosch._id, role: 'Embedded Software Engineer', packageLPA: 9, driveDate: day(7), minCgpa: 7, maxBacklogs: 0, branches: ['ECE', 'EEE', 'ETE', 'EIE', 'CSE'], status: 'upcoming' },
    { company: razorpay._id, role: 'Backend Intern (6 months)', packageLPA: 18, driveDate: day(14), minCgpa: 7.5, maxBacklogs: 0, branches: ['CSE', 'ISE', 'AIML', 'CD'], status: 'upcoming' },
    { company: tcs._id, role: 'Ninja / Digital', packageLPA: 7, driveDate: day(21), minCgpa: 6, maxBacklogs: 2, branches: [], status: 'upcoming' },
  ]);

  const students = await Student.create([
    {
      usn: '1RV23CS101', name: 'Ananya Rao', email: 'ananya.rao@example.com', phone: '9876500001', branch: 'CSE', cgpa: 9.1, backlogs: 0, gradYear: 2027,
      skills: ['Java', 'DSA', 'Spring Boot'],
      resumeText: 'B.E. CSE, RVCE, CGPA 9.1. Projects: distributed key-value store in Go; Huffman compressor in C. Intern at a startup building REST APIs with Spring Boot. 400+ LeetCode problems.',
    },
    { usn: '1RV23IS045', name: 'Rahul Menon', email: 'rahul.menon@example.com', branch: 'ISE', cgpa: 8.2, backlogs: 0, gradYear: 2027, skills: ['React', 'Node.js', 'MongoDB'],
      resumeText: 'B.E. ISE. Built a MERN placement tracker and a hostel complaint portal. Hackathon finalist at RVCE Ideathon.' },
    { usn: '1RV23EC020', name: 'Sneha Kulkarni', email: 'sneha.k@example.com', branch: 'ECE', cgpa: 8.7, backlogs: 0, gradYear: 2027, skills: ['Embedded C', 'ARM', 'RTOS'] },
    { usn: '1RV23AI012', name: 'Karthik S', email: 'karthik.s@example.com', branch: 'AIML', cgpa: 7.9, backlogs: 0, gradYear: 2027, skills: ['Python', 'PyTorch', 'SQL'] },
    { usn: '1RV23ME033', name: 'Divya Patil', email: 'divya.patil@example.com', branch: 'ME', cgpa: 7.1, backlogs: 1, gradYear: 2027, skills: ['SolidWorks', 'ANSYS'] },
    { usn: '1RV23CV008', name: 'Arjun Nair', email: 'arjun.nair@example.com', branch: 'CV', cgpa: 6.4, backlogs: 2, gradYear: 2027, skills: ['AutoCAD'] },
    { usn: '1RV23CS077', name: 'Meera Iyer', email: 'meera.iyer@example.com', branch: 'CSE', cgpa: 8.0, backlogs: 0, gradYear: 2027, skills: ['C++', 'Go'] },
    // Duplicate of Rahul Menon (same email, mistyped USN) -> try "Find duplicates" + Merge
    { usn: '1RV23IS054', name: 'Rahul Menon', email: 'rahul.menon@example.com', phone: '9876500099', branch: 'ISE', cgpa: 8.2, backlogs: 0, skills: ['Express', 'Docker'] },
  ]);
  const [ananya, rahul, sneha, karthik, divya, arjun, meera, rahulDup] = students;

  // Create one by one so the post('save') hook updates student.placed
  const applications = [
    [ananya, sde, 'offered'],
    [ananya, backendIntern, 'applied'],
    [rahul, systemEngineer, 'offered'],
    [rahul, backendIntern, 'shortlisted'],
    [sneha, embedded, 'interview'],
    [sneha, systemEngineer, 'rejected'],
    [karthik, systemEngineer, 'offered'],
    [divya, systemEngineer, 'applied'],
    [arjun, ninja, 'applied'],
    [meera, sde, 'rejected'],
    [meera, ninja, 'applied'],
    [rahulDup, ninja, 'applied'],
    [rahulDup, backendIntern, 'interview'], // conflicts with Rahul's "shortlisted" -> merge keeps "interview"
  ];
  for (const [student, drive, status] of applications) {
    await Application.create({ student: student._id, drive: drive._id, status });
  }

  // Demo login accounts (test-only passwords; also listed in README.md)
  const accounts = [
    { name: 'Placement Officer', email: 'admin@placement.test', password: 'admin123', role: 'admin' },
    { name: ananya.name, email: ananya.email, password: 'student123', role: 'student', student: ananya._id },
    { name: arjun.name, email: arjun.email, password: 'student123', role: 'student', student: arjun._id },
  ];
  for (const { password, ...data } of accounts) {
    const user = new User(data);
    await user.setPassword(password);
    await user.save();
  }

  console.log(`Seeded ${students.length} students, 5 companies, 5 drives, ${applications.length} applications, ${accounts.length} logins`);
}

module.exports = { seed };

if (require.main === module) {
  require('dotenv').config();
  const mongoose = require('mongoose');
  const connectDB = require('./config/db');
  connectDB()
    .then(async ({ builtIn }) => {
      if (builtIn) console.log('Resetting the built-in development database to the sample data.');
      await seed();
    })
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
}
