import initSqlJs, { Database, SqlValue } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE_PATH = path.resolve(__dirname, '../../quizquake.sqlite');
const SCHEMA_FILE_PATH = path.resolve(__dirname, 'schema.sql');
const QUESTIONS_FILE_PATH = path.resolve(__dirname, '../data/questions.json');

let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE_PATH)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE_PATH);
      dbInstance = new SQL.Database(fileBuffer);
    } catch (err) {
      console.warn('Could not read existing SQLite file, creating fresh database:', err);
      dbInstance = new SQL.Database();
    }
  } else {
    dbInstance = new SQL.Database();
  }

  // Initialize schema
  const schemaSql = fs.readFileSync(SCHEMA_FILE_PATH, 'utf-8');
  dbInstance.run(schemaSql);

  // Seed default student if missing
  const studentCheck = query<{ count: number }>(
    'SELECT count(*) as count FROM students WHERE student_id = ?',
    ['student_01']
  );
  if (!studentCheck[0] || studentCheck[0].count === 0) {
    run(
      'INSERT INTO students (student_id, name, email, avatar) VALUES (?, ?, ?, ?)',
      ['student_01', 'Alex Mercer', 'alex.mercer@university.edu', 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex']
    );
  }

  // Seed questions and topics if empty
  const qCount = query<{ count: number }>('SELECT count(*) as count FROM questions');
  if (!qCount[0] || qCount[0].count === 0) {
    console.log('Seeding 60 MCQs and topics into SQLite...');
    const questionsRaw = fs.readFileSync(QUESTIONS_FILE_PATH, 'utf-8');
    const questions = JSON.parse(questionsRaw);

    for (const q of questions) {
      // Insert topic if not exists
      run(
        'INSERT OR IGNORE INTO topics (topic_name, subtopic_name) VALUES (?, ?)',
        [q.topic, q.subtopic]
      );

      // Insert question
      run(
        `INSERT INTO questions (question_id, topic_name, subtopic_name, difficulty, question_text, options_json, correct_answer, explanation)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          q.id,
          q.topic,
          q.subtopic,
          q.difficulty,
          q.question,
          JSON.stringify(q.options),
          q.correctAnswer,
          q.explanation
        ]
      );
    }

    // Seed 2 realistic previous attempts for Alex Mercer to show trends on dashboard
    seedInitialAttempts();
    saveDb();
    console.log('Successfully seeded database with topics, questions, and sample attempts.');
  }

  return dbInstance;
}

export function saveDb(): void {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE_PATH, buffer);
  } catch (err) {
    console.error('Failed to save SQLite database to disk:', err);
  }
}

export function query<T = any>(sql: string, params: SqlValue[] = []): T[] {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call getDb() first.');
  }

  const stmt = dbInstance.prepare(sql);
  if (params.length > 0) {
    stmt.bind(params);
  }

  const results: T[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject() as unknown as T;
    results.push(row);
  }
  stmt.free();
  return results;
}

export function get<T = any>(sql: string, params: SqlValue[] = []): T | undefined {
  const rows = query<T>(sql, params);
  return rows.length > 0 ? rows[0] : undefined;
}

export function run(sql: string, params: SqlValue[] = []): { changes: number } {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call getDb() first.');
  }

  dbInstance.run(sql, params);
  const changes = dbInstance.getRowsModified();
  saveDb();
  return { changes };
}

function seedInitialAttempts() {
  // Attempt 1: 5 days ago, All Topics, Score 6/10 (60%)
  const sessionId1 = 'demo_session_past_1';
  const pastDate1 = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
  run(
    `INSERT INTO quiz_sessions 
     (session_id, student_id, selected_topic, current_difficulty, correct_streak, incorrect_streak, total_questions, questions_answered, score, status, is_remedial, started_at, expires_at, completed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [sessionId1, 'student_01', null, 'Medium', 1, 0, 10, 10, 6, 'COMPLETED', 0, pastDate1, pastDate1, pastDate1]
  );
  run(
    `INSERT INTO attempts (session_id, student_id, topic_name, total_questions, score, accuracy, is_remedial, completed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [sessionId1, 'student_01', 'All Topics', 10, 6, 60.0, 0, pastDate1]
  );

  // Attempt 2: 2 days ago, Operating Systems, Score 7/10 (70%)
  const sessionId2 = 'demo_session_past_2';
  const pastDate2 = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
  run(
    `INSERT INTO quiz_sessions 
     (session_id, student_id, selected_topic, current_difficulty, correct_streak, incorrect_streak, total_questions, questions_answered, score, status, is_remedial, started_at, expires_at, completed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [sessionId2, 'student_01', 'Operating Systems', 'Hard', 2, 0, 10, 10, 7, 'COMPLETED', 0, pastDate2, pastDate2, pastDate2]
  );
  run(
    `INSERT INTO attempts (session_id, student_id, topic_name, total_questions, score, accuracy, is_remedial, completed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [sessionId2, 'student_01', 'Operating Systems', 10, 7, 70.0, 0, pastDate2]
  );
}
