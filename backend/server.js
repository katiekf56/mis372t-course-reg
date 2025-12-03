import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Sequelize, DataTypes } from 'sequelize';

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;

// Quick runtime/debug logs to help diagnose silent starts
console.log('server.js loaded');
console.log('Node version:', process.version);
console.log('PORT:', process.env.PORT || PORT);

// err hndling
process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at Promise', p, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
});

// DATABASE CONNECTION (Render PG)
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false }
  }
});

// MODELS 

// Students Table
const Student = sequelize.define('students', {
  student_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true },
  password_hash: DataTypes.STRING,
  major: DataTypes.STRING,
  classification: DataTypes.STRING,
  created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
}, { timestamps: false });

// Courses Table
const Course = sequelize.define('course_offerings', {
  course_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  course_code: DataTypes.STRING,
  title: DataTypes.STRING,
  professor: DataTypes.STRING,
  days: DataTypes.STRING,
  time_start: DataTypes.TIME,
  time_end: DataTypes.TIME,
  room: DataTypes.STRING,
  capacity: { type: DataTypes.INTEGER, defaultValue: 30 },
  seats_available: { type: DataTypes.INTEGER, defaultValue: 30 },
  semester: DataTypes.STRING,
  year: DataTypes.INTEGER
}, { timestamps: false });

// Registrations Table
const Registration = sequelize.define('registrations', {
  enrollment_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: DataTypes.INTEGER,
  course_id: DataTypes.INTEGER,
  date_added: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
}, { timestamps: false });

// ASSOCIATIONS
Student.hasMany(Registration, { foreignKey: 'student_id' });
Registration.belongsTo(Student, { foreignKey: 'student_id' });

Course.hasMany(Registration, { foreignKey: 'course_id' });
Registration.belongsTo(Course, { foreignKey: 'course_id' });


// ROUTES — STUDENTS

// GET all students
app.get('/api/students', async (req, res) => {
  const rows = await Student.findAll();
  res.json(rows);
});

// GET student by ID
app.get('/api/students/:id', async (req, res) => {
  const row = await Student.findByPk(req.params.id);
  row ? res.json(row) : res.status(404).send("Student not found");
});

// GET student by email (Login.jsx)
app.get('/api/students/email/:email', async (req, res) => {
  const student = await Student.findOne({ where: { email: req.params.email } });
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }
  res.json(student);
});

// UPDATE student (Profile.jsx)
app.put('/api/students/:id', async (req, res) => {
  const student = await Student.findByPk(req.params.id);
  if (!student) return res.status(404).send("Student not found");

  await student.update(req.body);
  res.json(student);
});

// ROUTES — COURSES

// GET all courses
app.get('/api/courses', async (req, res) => {
  const rows = await Course.findAll();
  res.json(rows);
});

// GET specific course
app.get('/api/courses/:id', async (req, res) => {
  const row = await Course.findByPk(req.params.id);
  row ? res.json(row) : res.status(404).send("Course not found");
});

// POST new course (AddClass.jsx)
app.post('/api/courses', async (req, res) => {
  try {
    const { code, title, professor, time } = req.body;

    // Parse time field ("09:30-11:00")
    let time_start = null;
    let time_end = null;

    if (time && time.includes("-")) {
      const parts = time.split("-");
      time_start = parts[0]?.trim();
      time_end = parts[1]?.trim();
    }

    const newCourse = await Course.create({
      course_code: code,
      title,
      professor,
      days: "TBD",
      time_start,
      time_end,
      room: "TBD",
      capacity: 30,
      seats_available: 30,
      semester: "Spring",
      year: 2025
    });

    res.status(201).json(newCourse);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE course
app.put('/api/courses/:id', async (req, res) => {
  const course = await Course.findByPk(req.params.id);
  if (!course) return res.status(404).send("Course not found");

  await course.update(req.body);
  res.json(course);
});

// DELETE course
app.delete('/api/courses/:id', async (req, res) => {
  const course = await Course.findByPk(req.params.id);
  if (!course) return res.status(404).send("Course not found");

  await course.destroy();
  res.status(204).send();
});

// ROUTES — REGISTRATIONS

// GET all registrations
app.get('/api/registrations', async (req, res) => {
  const rows = await Registration.findAll();
  res.json(rows);
});

// GET registrations for specific student (Cart.jsx)
app.get('/api/registrations/student/:student_id', async (req, res) => {
  const rows = await Registration.findAll({
    where: { student_id: req.params.student_id },
    include: [{ model: Course }]
  });
  res.json(rows);
});

// POST new registration (prevent duplicates)
app.post('/api/registrations', async (req, res) => {
  const { student_id, course_id } = req.body;

  // Check for existing registration
  const existing = await Registration.findOne({
    where: { student_id, course_id }
  });

  if (existing) {
    return res.status(400).json({ error: "Already registered for this course" });
  }

  // Create new registration
  const newReg = await Registration.create({ student_id, course_id });
  res.status(201).json(newReg);
});


// DELETE registration
app.delete('/api/registrations/:id', async (req, res) => {
  const reg = await Registration.findByPk(req.params.id);
  if (!reg) return res.status(404).send("Registration not found");

  await reg.destroy();
  res.status(204).send();
});

// START SERVER
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
