import crypto from 'crypto';
import { query, run } from '../database/db.js';
import { generateDiagnosticReport } from './diagnosticEngine.js';
export function generateRemedialQuiz(studentId, referenceSessionId) {
    let targetSubtopics = [];
    if (referenceSessionId) {
        try {
            const report = generateDiagnosticReport(referenceSessionId);
            if (report.weakestSubtopics.length > 0) {
                targetSubtopics = report.weakestSubtopics.slice(0, 3).map(s => s.subtopic);
            }
        }
        catch (err) {
            console.warn('Failed to generate report for reference session:', err);
        }
    }
    // Fallback: look at all historical incorrect answers for this student
    if (targetSubtopics.length === 0) {
        const historicalWeak = query(`SELECT q.subtopic_name, COUNT(*) as incorrect_count
       FROM answers a
       JOIN questions q ON a.question_id = q.question_id
       JOIN quiz_sessions s ON a.session_id = s.session_id
       WHERE s.student_id = ? AND a.is_correct = 0
       GROUP BY q.subtopic_name
       ORDER BY incorrect_count DESC
       LIMIT 3`, [studentId]);
        targetSubtopics = historicalWeak.map(w => w.subtopic_name);
    }
    // If still empty (e.g. perfect student or new student), default to core foundational subtopics
    if (targetSubtopics.length === 0) {
        targetSubtopics = ['Deadlocks', 'Dynamic Programming', 'Memory Management', 'Routing'];
    }
    // Select 5 questions heavily weighted towards targeted subtopics
    const selectedQuestionIds = [];
    const questionsToServe = [];
    // Pick questions from target subtopics (prioritizing Easy and Medium to rebuild core foundations)
    for (const subtopic of targetSubtopics) {
        if (questionsToServe.length >= 5)
            break;
        const available = query(`SELECT question_id, topic_name, subtopic_name, difficulty, question_text, options_json, correct_answer, explanation
       FROM questions
       WHERE subtopic_name = ?
       ORDER BY CASE difficulty WHEN 'Easy' THEN 1 WHEN 'Medium' THEN 2 ELSE 3 END, RANDOM()
       LIMIT 2`, [subtopic]);
        for (const row of available) {
            if (questionsToServe.length < 5 && !selectedQuestionIds.includes(row.question_id)) {
                selectedQuestionIds.push(row.question_id);
                questionsToServe.push({
                    id: row.question_id,
                    topic: row.topic_name,
                    subtopic: row.subtopic_name,
                    difficulty: row.difficulty,
                    question: row.question_text,
                    options: JSON.parse(row.options_json),
                    correctAnswer: row.correct_answer,
                    explanation: row.explanation
                });
            }
        }
    }
    // If still fewer than 5, backfill from questions in same general topics
    if (questionsToServe.length < 5) {
        const backfill = query(`SELECT question_id, topic_name, subtopic_name, difficulty, question_text, options_json, correct_answer, explanation
       FROM questions
       WHERE question_id NOT IN (${selectedQuestionIds.length > 0 ? selectedQuestionIds.join(',') : '0'})
       ORDER BY RANDOM()
       LIMIT ?`, [5 - questionsToServe.length]);
        for (const row of backfill) {
            selectedQuestionIds.push(row.question_id);
            questionsToServe.push({
                id: row.question_id,
                topic: row.topic_name,
                subtopic: row.subtopic_name,
                difficulty: row.difficulty,
                question: row.question_text,
                options: JSON.parse(row.options_json),
                correctAnswer: row.correct_answer,
                explanation: row.explanation
            });
        }
    }
    const remedialSessionId = `remedial_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes
    const firstQuestion = questionsToServe[0];
    run(`INSERT INTO quiz_sessions
     (session_id, student_id, selected_topic, current_difficulty, correct_streak, incorrect_streak, total_questions, questions_answered, score, status, is_remedial, started_at, expires_at, current_question_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        remedialSessionId,
        studentId,
        'Targeted Remedial',
        firstQuestion.difficulty,
        0,
        0,
        5,
        0,
        0,
        'IN_PROGRESS',
        1,
        now.toISOString(),
        expiresAt.toISOString(),
        firstQuestion.id
    ]);
    return {
        sessionId: remedialSessionId,
        targetedSubtopics: targetSubtopics,
        totalQuestions: 5,
        initialQuestion: {
            id: firstQuestion.id,
            topic: firstQuestion.topic,
            subtopic: firstQuestion.subtopic,
            difficulty: firstQuestion.difficulty,
            question: firstQuestion.question,
            options: firstQuestion.options,
            questionNumber: 1,
            totalQuestions: 5
        }
    };
}
