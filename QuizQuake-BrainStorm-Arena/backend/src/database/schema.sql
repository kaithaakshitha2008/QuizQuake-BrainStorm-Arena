-- QuizQuake: BrainStorm Arena Database Schema

CREATE TABLE IF NOT EXISTS students (
  student_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS topics (
  topic_id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_name TEXT NOT NULL,
  subtopic_name TEXT NOT NULL,
  UNIQUE(topic_name, subtopic_name)
);

CREATE TABLE IF NOT EXISTS questions (
  question_id INTEGER PRIMARY KEY,
  topic_name TEXT NOT NULL,
  subtopic_name TEXT NOT NULL,
  difficulty TEXT CHECK(difficulty IN ('Easy', 'Medium', 'Hard')) NOT NULL,
  question_text TEXT NOT NULL,
  options_json TEXT NOT NULL,
  correct_answer INTEGER NOT NULL,
  explanation TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS quiz_sessions (
  session_id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  selected_topic TEXT,
  current_difficulty TEXT CHECK(current_difficulty IN ('Easy', 'Medium', 'Hard')) NOT NULL DEFAULT 'Medium',
  correct_streak INTEGER NOT NULL DEFAULT 0,
  incorrect_streak INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 10,
  questions_answered INTEGER NOT NULL DEFAULT 0,
  score INTEGER NOT NULL DEFAULT 0,
  status TEXT CHECK(status IN ('IN_PROGRESS', 'COMPLETED', 'EXPIRED')) NOT NULL DEFAULT 'IN_PROGRESS',
  is_remedial INTEGER NOT NULL DEFAULT 0,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  completed_at DATETIME,
  current_question_id INTEGER,
  FOREIGN KEY (student_id) REFERENCES students(student_id)
);

CREATE TABLE IF NOT EXISTS answers (
  answer_id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  question_id INTEGER NOT NULL,
  selected_answer INTEGER NOT NULL,
  is_correct INTEGER NOT NULL,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  difficulty_at_question TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES quiz_sessions(session_id),
  FOREIGN KEY (question_id) REFERENCES questions(question_id)
);

CREATE TABLE IF NOT EXISTS attempts (
  attempt_id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL UNIQUE,
  student_id TEXT NOT NULL,
  topic_name TEXT NOT NULL,
  total_questions INTEGER NOT NULL,
  score INTEGER NOT NULL,
  accuracy REAL NOT NULL,
  is_remedial INTEGER NOT NULL DEFAULT 0,
  completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES quiz_sessions(session_id),
  FOREIGN KEY (student_id) REFERENCES students(student_id)
);
