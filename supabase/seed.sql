insert into public.books (title,author,category,description,isbn,total_copies,available_copies)
values
('Clean Code','Robert C. Martin','Computer Science','A practical guide to writing readable, maintainable software.','9780132350884',5,5),
('Python Crash Course','Eric Matthes','Computer Science','Hands-on introduction to Python programming and projects.','9781593279288',6,6),
('Database System Concepts','Abraham Silberschatz','Computer Science','Foundational concepts in database systems.','9780078022159',4,4),
('Computer Networks','Andrew S. Tanenbaum','Engineering','Core principles and architectures of computer networking.','9780132126953',4,4),
('Digital Signal Processing','John G. Proakis','Electronics','A reference for digital signal processing theory and practice.','9780131873742',3,3)
on conflict do nothing;
