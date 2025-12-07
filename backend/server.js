import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Sequelize, DataTypes } from 'sequelize';

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5001;

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
  year: DataTypes.INTEGER,
  prerequisites: DataTypes.STRING,
  major_restricted: DataTypes.STRING 
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
      isIn: [['active', 'dropped', 'completed', 'pending', 'added']]
    }
  }
}, { timestamps: false });

// ASSOCIATIONS
Student.hasMany(Registration, { foreignKey: 'student_id' });
Registration.belongsTo(Student, { foreignKey: 'student_id' });

Course.hasMany(Registration, { foreignKey: 'course_id' });
Registration.belongsTo(Course, { foreignKey: 'course_id' });

// SYNC DATABASE
sequelize.sync().then(() => {
  console.log('Database synced successfully (no alter)');
}).catch(err => {
  console.error('Database sync error:', err);
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Extract credit hours from course code
 * First digit of course number = credit hours (e.g., "MIS 372" = 3 credits)
 */
function getCreditHours(courseCode) {
  if (!courseCode) return 0;
  
  // Extract the numeric part (e.g., "MIS 372T" -> "372")
  const match = courseCode.match(/\d+/);
  if (!match) return 0;
  
  const courseNumber = match[0];
  // First digit is the credit hours
  const firstDigit = parseInt(courseNumber.charAt(0));
  
  return isNaN(firstDigit) ? 0 : firstDigit;
}

/**
 * Calculate total credit hours for a student's active registrations
 */
async function calculateTotalCredits(studentId, excludeCourseId = null) {
  const registrations = await Registration.findAll({
    where: { 
      student_id: studentId,
      status: 'added'
    },
    include: [{ model: Course }]
  });
  
  let totalCredits = 0;
  for (const reg of registrations) {
    // Skip the course we're about to add (for checking if we can add it)
    if (excludeCourseId && reg.course_id === excludeCourseId) {
      continue;
    }
    
    const credits = getCreditHours(reg.course_offering.course_code);
    totalCredits += credits;
  }
  
  return totalCredits;
}

// ============================================
// ROUTES — STUDENTS
// ============================================

// GET student by ID
app.get('/api/students/:id', async (req, res) => {
  const student = await Student.findByPk(req.params.id);
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }
  res.json(student);
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
  const { name, email, major, classification } = req.body;
  
  const student = await Student.findByPk(req.params.id);
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }
  
  await student.update({ name, email, major, classification });
  res.json(student);
});

// ============================================
// ROUTES — COURSES
// ============================================

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

// ============================================
// CHECK ELIGIBILITY for a course
// ============================================
app.get('/api/courses/:course_id/eligibility/:student_id', async (req, res) => {
  try {
    const { course_id, student_id } = req.params;
    
    // Get student info
    const student = await Student.findByPk(student_id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Get course info
    const course = await Course.findByPk(course_id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Get student's current registrations
    const studentRegistrations = await Registration.findAll({
      where: { 
        student_id,
        status: 'added'
      },
      include: [{ model: Course }]
    });

    let eligible = true;
    const checks = {
      prerequisite_check: { valid: true, missing: [] },
      major_check: { valid: true, required_majors: [] },
      time_conflict_check: { valid: true, conflicts: [] }
    };

    // ===== 1. CHECK PREREQUISITES =====
    if (course.prerequisites && course.prerequisites !== "None") {
      const requiredCourseIds = course.prerequisites.split(',').map(id => id.trim());
      
      // Get all courses the student has completed
      const completedCourses = studentRegistrations.map(reg => reg.course_id.toString());
      
      const missingPrereqs = [];
      for (const reqId of requiredCourseIds) {
        if (!completedCourses.includes(reqId)) {
          // Get course code for display
          const reqCourse = await Course.findByPk(reqId);
          if (reqCourse) {
            missingPrereqs.push(reqCourse.course_code);
          }
        }
      }
      
      if (missingPrereqs.length > 0) {
        eligible = false;
        checks.prerequisite_check = {
          valid: false,
          missing: missingPrereqs
        };
      }
    }

    // ===== 2. CHECK MAJOR RESTRICTIONS =====
    if (course.major_restricted && course.major_restricted !== "None") {
      const allowedMajors = course.major_restricted.split(',').map(m => m.trim().toUpperCase());
      
      // Map full major names to abbreviations
      const majorMap = {
        'MANAGEMENT INFORMATION SYSTEMS (MIS)': 'MIS',
        'COMPUTER SCIENCE': 'CS',
        'BUSINESS ADMINISTRATION': 'BA',
        'FINANCE': 'FIN',
        'MARKETING': 'MKT',
        'ACCOUNTING': 'ACC',
        'ECONOMICS': 'ECO',
        'MECHANICAL ENGINEERING': 'ME',
        'ELECTRICAL & COMPUTER ENGINEERING': 'ECE',
        'CIVIL ENGINEERING': 'CE',
        'PSYCHOLOGY': 'PSY',
        'BIOLOGY': 'BIO',
        'GOVERNMENT': 'GOV',
        'COMMUNICATIONS & MEDIA STUDIES': 'CMS'
      };
      
      const studentMajorUpper = (student.major || '').toUpperCase();
      const studentMajorAbbrev = majorMap[studentMajorUpper] || studentMajorUpper;
      
      // Check if student's major (or its abbreviation) is in the allowed list
      const isAllowed = allowedMajors.some(major => 
        major === studentMajorAbbrev || 
        major === studentMajorUpper ||
        studentMajorUpper.includes(major)
      );
      
      if (!isAllowed) {
        eligible = false;
        checks.major_check = {
          valid: false,
          required_majors: allowedMajors,
          student_major: studentMajorAbbrev
        };
      }
    }

    // ===== 3. CHECK TIME CONFLICTS =====
    if (course.time_start && course.time_end && course.days && course.days !== "TBD") {
      const courseDays = course.days.split('');
      
      for (const reg of studentRegistrations) {
        const enrolledCourse = reg.course_offering;
        
        // Skip if enrolled course has no time info
        if (!enrolledCourse.time_start || !enrolledCourse.time_end || 
            !enrolledCourse.days || enrolledCourse.days === "TBD") {
          continue;
        }
        
        const enrolledDays = enrolledCourse.days.split('');
        
        // Check if courses share any days
        const sharedDays = courseDays.filter(day => enrolledDays.includes(day));
        
        if (sharedDays.length > 0) {
          // Check if times overlap
          const courseStart = course.time_start;
          const courseEnd = course.time_end;
          const enrolledStart = enrolledCourse.time_start;
          const enrolledEnd = enrolledCourse.time_end;
          
          // Times overlap if: (start1 < end2) AND (start2 < end1)
          if (courseStart < enrolledEnd && enrolledStart < courseEnd) {
            eligible = false;
            checks.time_conflict_check.valid = false;
            checks.time_conflict_check.conflicts.push({
              course_code: enrolledCourse.course_code,
              days: sharedDays.join(''),
              time: `${enrolledStart} - ${enrolledEnd}`
            });
          }
        }
      }
    }

    // ===== 4. CHECK CREDIT HOUR LIMIT (MAX 17) =====
    const currentCredits = await calculateTotalCredits(student_id);
    const newCourseCredits = getCreditHours(course.course_code);
    const totalCreditsAfterAdding = currentCredits + newCourseCredits;
    const MAX_CREDITS = 17;
    
    checks.credit_check = {
      valid: totalCreditsAfterAdding <= MAX_CREDITS,
      current_credits: currentCredits,
      course_credits: newCourseCredits,
      total_after_adding: totalCreditsAfterAdding,
      max_allowed: MAX_CREDITS
    };
    
    if (totalCreditsAfterAdding > MAX_CREDITS) {
      eligible = false;
    }

    res.json({
      eligible,
      ...checks
    });

  } catch (err) {
    console.error("Eligibility check error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// ROUTES — REGISTRATIONS
// ============================================

// GET registrations for specific student 
app.get('/api/registrations/student/:student_id', async (req, res) => {
  const rows = await Registration.findAll({
    where: { student_id: req.params.student_id },
    include: [{ model: Course }]
  });
  res.json(rows);
});

// POST new registration (with full validation)
app.post('/api/registrations', async (req, res) => {
  console.log("POST /api/registrations HIT");
  console.log("BODY:", req.body);

  try {
    const { student_id, course_id } = req.body;

    // Check if already registered
    // Check if already registered (ANY status)
    const existing = await Registration.findOne({
      where: { 
      student_id,
      course_id
    }
  });

  if (existing) {
  // If already registered with 'added' status, reject
    if (existing.status === 'added') {
      return res.status(400).json({ 
        error: "Already registered for this course" 
      });
  } 
  
  // If previously dropped, check credit limit before reactivating
  const course = await Course.findByPk(course_id);
  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }
  
  const currentCredits = await calculateTotalCredits(student_id);
  const courseCredits = getCreditHours(course.course_code);
  const totalCreditsAfterAdding = currentCredits + courseCredits;
  const MAX_CREDITS = 17;
  
  if (totalCreditsAfterAdding > MAX_CREDITS) {
    return res.status(400).json({ 
      error: "Cannot register for this course",
      details: `Credit limit exceeded: Adding this ${courseCredits}-credit course would give you ${totalCreditsAfterAdding} credits total. ` +
               `Maximum allowed is ${MAX_CREDITS} credits. You currently have ${currentCredits} credits enrolled. ` +
               `Please contact an administrator for approval to exceed the credit limit.`
    });
  }
  
  // Reactivate the dropped course
  await existing.update({ 
    status: 'added', 
    date_added: new Date() 
  });
  
  console.log("REACTIVATED:", existing);
  return res.status(201).json(existing);
}

    // Get student info
    const student = await Student.findByPk(student_id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Get course info
    const course = await Course.findByPk(course_id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Check if course is full
    if (course.seats_available <= 0) {
      return res.status(400).json({ 
        error: "Cannot register for this course",
        details: "This course is full and no seats are available"
      });
    }

    // Get student's current registrations
    const studentRegistrations = await Registration.findAll({
      where: { 
        student_id,
        status: 'added'
      },
      include: [{ model: Course }]
    });

    let eligible = true;
    const errorMessages = [];

    // ===== 1. CHECK PREREQUISITES =====
    if (course.prerequisites && course.prerequisites !== "None") {
      const requiredCourseIds = course.prerequisites.split(',').map(id => id.trim());
      const completedCourses = studentRegistrations.map(reg => reg.course_id.toString());
      
      const missingPrereqs = [];
      for (const reqId of requiredCourseIds) {
        if (!completedCourses.includes(reqId)) {
          const reqCourse = await Course.findByPk(reqId);
          if (reqCourse) {
            missingPrereqs.push(reqCourse.course_code);
          }
        }
      }
      
      if (missingPrereqs.length > 0) {
        eligible = false;
        errorMessages.push(`Missing prerequisites: ${missingPrereqs.join(', ')}`);
      }
    }

    // ===== 2. CHECK MAJOR RESTRICTIONS =====
    if (course.major_restricted && course.major_restricted !== "None") {
      const allowedMajors = course.major_restricted.split(',').map(m => m.trim().toUpperCase());
      
      const majorMap = {
        'MANAGEMENT INFORMATION SYSTEMS (MIS)': 'MIS',
        'COMPUTER SCIENCE': 'CS',
        'BUSINESS ADMINISTRATION': 'BA',
        'FINANCE': 'FIN',
        'MARKETING': 'MKT',
        'ACCOUNTING': 'ACC',
        'ECONOMICS': 'ECO',
        'MECHANICAL ENGINEERING': 'ME',
        'ELECTRICAL & COMPUTER ENGINEERING': 'ECE',
        'CIVIL ENGINEERING': 'CE',
        'PSYCHOLOGY': 'PSY',
        'BIOLOGY': 'BIO',
        'GOVERNMENT': 'GOV',
        'COMMUNICATIONS & MEDIA STUDIES': 'CMS'
      };
      
      const studentMajorUpper = (student.major || '').toUpperCase();
      const studentMajorAbbrev = majorMap[studentMajorUpper] || studentMajorUpper;
      
      const isAllowed = allowedMajors.some(major => 
        major === studentMajorAbbrev || 
        major === studentMajorUpper ||
        studentMajorUpper.includes(major)
      );
      
      if (!isAllowed) {
        eligible = false;
        errorMessages.push(`Course restricted to ${allowedMajors.join(', ')} majors`);
      }
    }

    // ===== 3. CHECK TIME CONFLICTS =====
    if (course.time_start && course.time_end && course.days && course.days !== "TBD") {
      const courseDays = course.days.split('');
      
      for (const reg of studentRegistrations) {
        const enrolledCourse = reg.course_offering;
        
        if (!enrolledCourse.time_start || !enrolledCourse.time_end || 
            !enrolledCourse.days || enrolledCourse.days === "TBD") {
          continue;
        }
        
        const enrolledDays = enrolledCourse.days.split('');
        const sharedDays = courseDays.filter(day => enrolledDays.includes(day));
        
        if (sharedDays.length > 0) {
          const courseStart = course.time_start;
          const courseEnd = course.time_end;
          const enrolledStart = enrolledCourse.time_start;
          const enrolledEnd = enrolledCourse.time_end;
          
          if (courseStart < enrolledEnd && enrolledStart < courseEnd) {
            eligible = false;
            errorMessages.push(`Time conflict with ${enrolledCourse.course_code} (${sharedDays.join('')} ${enrolledStart}-${enrolledEnd})`);
          }
        }
      }
    }

    // ===== 4. CHECK CREDIT HOUR LIMIT (MAX 17) =====
    const currentCredits = await calculateTotalCredits(student_id);
    const newCourseCredits = getCreditHours(course.course_code);
    const totalCreditsAfterAdding = currentCredits + newCourseCredits;
    
    const MAX_CREDITS = 17;
    
    if (totalCreditsAfterAdding > MAX_CREDITS) {
      eligible = false;
      errorMessages.push(
        `Credit limit exceeded: Adding this ${newCourseCredits}-credit course would give you ${totalCreditsAfterAdding} credits total. ` +
        `Maximum allowed is ${MAX_CREDITS} credits. You currently have ${currentCredits} credits enrolled. ` +
        `Please contact an administrator for approval to exceed the credit limit.`
      );
    }

    // If not eligible, return error
    if (!eligible) {
      return res.status(400).json({ 
        error: "Cannot register for this course",
        details: errorMessages.join('\n')
      });
    }

    // Create registration
    const newReg = await Registration.create({ 
      student_id, 
      course_id, 
      status: "added" 
    });

    console.log("CREATED:", newReg);
    res.status(201).json(newReg);
  } 
  catch (err) {
    console.error("REGISTRATION ERROR:", err);
    console.error("Full error object:", JSON.stringify(err, null, 2));
    res.status(500).json({ 
    error: err.message,
    details: err.toString(),
    name: err.name,
    stack: err.stack
  });
}
});

// DELETE registration (updates status to "dropped" instead of deleting)
app.delete('/api/registrations/:id', async (req, res) => {
  const reg = await Registration.findByPk(req.params.id);
  if (!reg) return res.status(404).send("Registration not found");
  await reg.update({ status: 'dropped' });
  res.status(204).send();
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});