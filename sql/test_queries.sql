INSERT INTO students (name, email, password_hash, major, classification)
VALUES
('Sophia Nguyen', 'sophia.nguyen@uni.edu', 'hashed_pw_123', 'MIS', 'Junior'),
('Marcus Kim', 'marcus.kim@uni.edu', 'hashed_pw_456', 'Finance', 'Senior'),
('Emily Johnson', 'emilyj@uni.edu', 'hashed_pw_789', 'Accounting', 'Sophomore');

INSERT INTO course_offerings (
    course_code, title, professor, days, time_start, time_end, room,
    capacity, seats_available, semester, year
) VALUES
('MIS 372T', 'Full Stack Web Development', 'Clint Tuttle', 'TTh', '09:30', '11:00', 'CBA 4.322', 40, 40, 'Spring', 2025),
('ACC 311', 'Fundamentals of Financial Accounting', 'Dr. Patel', 'MWF', '10:00', '11:00', 'GSB 2.124', 45, 45, 'Spring', 2025),
('MIS 304', 'Intro to Programming', 'Dr. Gomez', 'TTh', '14:00', '15:30', 'CBA 5.330', 30, 30, 'Fall', 2025);

INSERT INTO registrations (student_id, course_id)
VALUES
(1, 1),
(1, 3),
(2, 1),
(3, 2);

SELECT * FROM students;