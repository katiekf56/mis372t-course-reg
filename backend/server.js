import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Sequelize, DataTypes } from 'sequelize';

const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'https://mis372t-course-reg.onrender.com'],
  credentials: true
}));
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
  department: DataTypes.STRING,
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
  date_added: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  status: { 
    type: DataTypes.STRING, 
    defaultValue: 'active',
    validate: {
      isIn: [['active', 'dropped', 'completed', 'pending']]
    }
  }
}, { timestamps: false });

// ASSOCIATIONS
Student.hasMany(Registration, { foreignKey: 'student_id' });
Registration.belongsTo(Student, { foreignKey: 'student_id' });


Course.hasMany(Registration, { foreignKey: 'course_id' });
Registration.belongsTo(Course, { foreignKey: 'course_id' });
// SYNC DATABASE (add this temporarily)
sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced successfully');
}).catch(err => {
  console.error('Database sync error:', err);
});


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
    const { code, title, professor, time, department } = req.body;

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
      department: department || "TBD",
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

// TEMPORARY: Bulk update courses with departments
app.post('/api/courses/bulk-update-departments', async (req, res) => {
  try {
    const courses = await Course.findAll();
    
    for (let course of courses) {
      let dept = "GEN";
      
      if (course.course_code) {
        const code = course.course_code.toUpperCase();
        if (code.startsWith("MIS")) dept = "MIS";
        else if (code.startsWith("CS")) dept = "CS";
        else if (code.startsWith("ACC")) dept = "ACC";
        else if (code.startsWith("FIN")) dept = "FIN";
        else if (code.startsWith("MKT")) dept = "MKT";
        else if (code.startsWith("MGT")) dept = "MGT";
        else if (code.startsWith("ECO")) dept = "ECO";
        else if (code.startsWith("MATH")) dept = "MATH";
      }
      
      await course.update({ department: dept });
    }
    
    res.json({ message: "Departments updated successfully", count: courses.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE registration (updates status to "dropped" instead of deleting)
app.delete('/api/registrations/:id', async (req, res) => {
  const reg = await Registration.findByPk(req.params.id);
  if (!reg) return res.status(404).send("Registration not found");
  await reg.update({ status: 'dropped' });
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

  // Check for existing registration with 'added' status only
  const existing = await Registration.findOne({
    where: { 
      student_id, 
      course_id,
      status: 'added'
    }
  });

  if (existing) {
    return res.status(400).json({ error: "Already registered for this course" });
  }

  // Create new registration with 'added' status
  const newReg = await Registration.create({ 
    student_id, 
    course_id,
    status: 'added'
  });
  res.status(201).json(newReg);
});


// DELETE registration
app.delete('/api/registrations/:id', async (req, res) => {
  const reg = await Registration.findByPk(req.params.id);
  if (!reg) return res.status(404).send("Registration not found");

  await reg.destroy();
  res.status(204).send();
});

sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced successfully');
}).catch(err => {
  console.error('Database sync error:', err);
});

// START SERVER
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
