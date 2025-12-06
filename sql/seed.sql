INSERT INTO students (name, email, password_hash, major, classification)
VALUES ('Lina Li', 'linali@utexas.edu', 'placeholder', 'Management Information Systems', 'Junior');

-- Mark a couple of existing courses as full
UPDATE course_offerings
SET seats_available = 0
WHERE course_code IN ('MIS 372T', 'ACC 311');

-- Insert two new full courses (Spring 2025)
INSERT INTO course_offerings (
  course_code, title, professor, days, time_start, time_end, room,
  capacity, seats_available, semester, year
) VALUES
('CS 101F', 'Intro to CS (Full)', 'Prof. Ada', 'MWF', '09:00', '10:00', 'ECJ 1.202', 50, 0, 'Spring', 2025),
('FIN 201F', 'Corp Finance (Full)', 'Prof. Lee', 'TTh', '13:00', '14:30', 'GSB 3.130', 60, 0, 'Spring', 2025);

