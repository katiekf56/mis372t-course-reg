INSERT INTO students (name, email, password_hash, major, classification)
VALUES ('Lina Li', 'linali@utexas.edu', 'placeholder', 'Management Information Systems', 'Junior');

-- Mark a couple of existing courses as full
UPDATE course_offerings
SET seats_available = 0
WHERE course_code IN ('MIS 372T', 'ACC 311');

-- Insert additional courses for Spring 2025
INSERT INTO course_offerings (
  course_code, title, professor, days, time_start, time_end, room,
  capacity, seats_available, semester, year, department, prerequisites, major_restricted
) VALUES
('MIS 301', 'Intro to MIS', 'Prof. Johnson', 'MWF', '10:00', '11:00', 'CBA 4.330', 40, 35, 'Spring', 2025, 'MIS', 'None', 'None'),
('MIS 325', 'Database Management', 'Prof. Chen', 'TTh', '11:00', '12:30', 'CBA 4.340', 35, 28, 'Spring', 2025, 'MIS', 'None', 'MIS'),
('MIS 374', 'Web Development', 'Prof. Martinez', 'MWF', '13:00', '14:00', 'CBA 4.350', 30, 22, 'Spring', 2025, 'MIS', 'None', 'MIS'),
('MIS 380', 'IT Project Management', 'Prof. Williams', 'TTh', '14:00', '15:30', 'CBA 4.360', 35, 30, 'Spring', 2025, 'MIS', 'None', 'None'),

('CS 312', 'Intro to Programming', 'Prof. Davis', 'MWF', '09:00', '10:00', 'GDC 1.304', 50, 45, 'Spring', 2025, 'CS', 'None', 'None'),
('CS 314', 'Data Structures', 'Prof. Thompson', 'TTh', '09:30', '11:00', 'GDC 2.210', 45, 38, 'Spring', 2025, 'CS', 'None', 'None'),
('CS 331', 'Algorithms', 'Prof. Anderson', 'MWF', '11:00', '12:00', 'GDC 1.406', 40, 32, 'Spring', 2025, 'CS', 'None', 'CS'),
('CS 429', 'Computer Architecture', 'Prof. Wilson', 'TTh', '15:30', '17:00', 'GDC 4.304', 35, 25, 'Spring', 2025, 'CS', 'None', 'CS'),

('ACC 312', 'Fundamentals of Managerial Accounting', 'Prof. Brown', 'MWF', '08:00', '09:00', 'CBA 4.328', 50, 42, 'Spring', 2025, 'ACC', 'None', 'None'),
('ACC 326', 'Cost Accounting', 'Prof. Garcia', 'TTh', '12:30', '14:00', 'CBA 4.344', 40, 35, 'Spring', 2025, 'ACC', 'None', 'ACC,FIN'),
('ACC 380K', 'Tax Accounting', 'Prof. Rodriguez', 'MWF', '14:00', '15:00', 'CBA 4.304', 35, 28, 'Spring', 2025, 'ACC', 'None', 'ACC'),

('FIN 320', 'Principles of Finance', 'Prof. Taylor', 'MWF', '10:00', '11:00', 'GSB 2.120', 60, 55, 'Spring', 2025, 'FIN', 'None', 'None'),
('FIN 357', 'Investment Management', 'Prof. White', 'TTh', '11:00', '12:30', 'GSB 3.138', 45, 38, 'Spring', 2025, 'FIN', 'None', 'FIN'),
('FIN 367', 'Corporate Financial Policy', 'Prof. Harris', 'MWF', '15:00', '16:00', 'GSB 2.122', 40, 32, 'Spring', 2025, 'FIN', 'None', 'FIN'),

('MKT 320', 'Foundations of Marketing', 'Prof. Clark', 'MWF', '11:00', '12:00', 'CBA 4.308', 50, 44, 'Spring', 2025, 'MKT', 'None', 'None'),
('MKT 337', 'Digital Marketing', 'Prof. Lewis', 'TTh', '14:00', '15:30', 'CBA 4.312', 40, 35, 'Spring', 2025, 'MKT', 'None', 'MKT'),
('MKT 350', 'Consumer Behavior', 'Prof. Walker', 'MWF', '13:00', '14:00', 'CBA 4.316', 45, 38, 'Spring', 2025, 'MKT', 'None', 'None'),

('ECO 304', 'Principles of Microeconomics', 'Prof. Young', 'TTh', '08:00', '09:30', 'BUR 106', 100, 85, 'Spring', 2025, 'ECO', 'None', 'None'),
('ECO 304L', 'Principles of Macroeconomics', 'Prof. King', 'MWF', '09:00', '10:00', 'BUR 130', 100, 90, 'Spring', 2025, 'ECO', 'None', 'None'),
('ECO 420K', 'Econometrics', 'Prof. Wright', 'TTh', '15:30', '17:00', 'BUR 228', 35, 28, 'Spring', 2025, 'ECO', 'None', 'ECO'),

('MGT 320', 'Organizational Behavior', 'Prof. Scott', 'MWF', '12:00', '13:00', 'CBA 4.320', 50, 42, 'Spring', 2025, 'MGT', 'None', 'None'),
('MGT 363', 'Business Strategy', 'Prof. Green', 'TTh', '09:30', '11:00', 'CBA 4.324', 40, 35, 'Spring', 2025, 'MGT', 'None', 'None'),
('MGT 374', 'Entrepreneurship', 'Prof. Adams', 'MWF', '14:00', '15:00', 'CBA 4.336', 35, 30, 'Spring', 2025, 'MGT', 'None', 'None'),

('MATH 408', 'Calculus I', 'Prof. Baker', 'MWF', '08:00', '09:00', 'RLM 5.104', 80, 70, 'Spring', 2025, 'MATH', 'None', 'None'),
('MATH 408D', 'Calculus II', 'Prof. Turner', 'TTh', '10:00', '11:30', 'RLM 7.104', 75, 65, 'Spring', 2025, 'MATH', 'None', 'None'),
('MATH 341', 'Linear Algebra', 'Prof. Phillips', 'MWF', '11:00', '12:00', 'RLM 4.102', 60, 52, 'Spring', 2025, 'MATH', 'None', 'None'),

('ME 302', 'Engineering Mechanics', 'Prof. Campbell', 'TTh', '13:00', '14:30', 'ETC 2.130', 50, 42, 'Spring', 2025, 'ME', 'None', 'ME,ECE'),
('ECE 319', 'Embedded Systems', 'Prof. Mitchell', 'MWF', '10:00', '11:00', 'EER 0.806', 45, 38, 'Spring', 2025, 'ECE', 'None', 'ECE'),
('CE 311', 'Fluid Mechanics', 'Prof. Roberts', 'TTh', '11:00', '12:30', 'ECJ 1.214', 40, 35, 'Spring', 2025, 'CE', 'None', 'CE'),

('PSY 301', 'Introduction to Psychology', 'Prof. Carter', 'MWF', '09:00', '10:00', 'MEZ 1.102', 120, 100, 'Spring', 2025, 'PSY', 'None', 'None'),
('BIO 311C', 'Introductory Biology', 'Prof. Parker', 'TTh', '12:30', '14:00', 'WEL 2.256', 100, 85, 'Spring', 2025, 'BIO', 'None', 'None'),
('GOV 310', 'American Government', 'Prof. Evans', 'MWF', '13:00', '14:00', 'BAT 5.102', 150, 120, 'Spring', 2025, 'GOV', 'None', 'None'),
('CMS 306', 'Media and Society', 'Prof. Morris', 'TTh', '14:00', '15:30', 'CMA 2.302', 60, 50, 'Spring', 2025, 'CMS', 'None', 'None'),

('CS 101F', 'Intro to CS (Full)', 'Prof. Ada', 'MWF', '09:00', '10:00', 'ECJ 1.202', 50, 0, 'Spring', 2025, 'CS', 'None', 'None'),
('FIN 201F', 'Corp Finance (Full)', 'Prof. Lee', 'TTh', '13:00', '14:30', 'GSB 3.130', 60, 0, 'Spring', 2025, 'FIN', 'None', 'None');


