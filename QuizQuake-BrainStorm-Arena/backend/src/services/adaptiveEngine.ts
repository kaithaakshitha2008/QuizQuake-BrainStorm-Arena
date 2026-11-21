import { Difficulty, Question } from '../types/index.js';
import { query } from '../database/db.js';

const DIFFICULTY_LEVELS: Difficulty[] = ['Easy', 'Medium', 'Hard'];

export interface AdaptiveState {
  currentDifficulty: Difficulty;
  correctStreak: number;
  incorrectStreak: number;
}

export interface DifficultyUpdateResult {
  nextDifficulty: Difficulty;
  nextCorrectStreak: number;
  nextIncorrectStreak: number;
  reason: string;
}

/**
 * Calculates the next difficulty level according to the consecutive-answer algorithm:
 * - 2 consecutive correct -> Increase difficulty by 1 level (capped at Hard)
 * - 1 incorrect answer -> Decrease difficulty by 1 level (capped at Easy), reset streak
 * - 1 correct answer -> Maintain current level
 * - 2 consecutive incorrect -> Maintain / continue at Easy (capped at Easy)
 */
export function computeNextDifficulty(
  current: Difficulty,
  correctStreak: number,
  incorrectStreak: number,
  isCorrect: boolean
): DifficultyUpdateResult {
  let currentIndex = DIFFICULTY_LEVELS.indexOf(current);
  if (currentIndex === -1) currentIndex = 1; // Default to Medium

  if (isCorrect) {
    const newCorrectStreak = correctStreak + 1;
    const newIncorrectStreak = 0;

    if (newCorrectStreak >= 2) {
      if (currentIndex < DIFFICULTY_LEVELS.length - 1) {
        const nextDiff = DIFFICULTY_LEVELS[currentIndex + 1];
        return {
          nextDifficulty: nextDiff,
          nextCorrectStreak: 0, // reset streak for the new level
          nextIncorrectStreak: 0,
          reason: `2 consecutive correct answers! Promoted to ${nextDiff}.`
        };
      } else {
        return {
          nextDifficulty: 'Hard',
          nextCorrectStreak: newCorrectStreak,
          nextIncorrectStreak: 0,
          reason: 'Correct answer! Maintained peak difficulty (Hard).'
        };
      }
    } else {
      return {
        nextDifficulty: current,
        nextCorrectStreak: newCorrectStreak,
        nextIncorrectStreak: 0,
        reason: 'Correct answer! Current difficulty maintained (1 consecutive correct).'
      };
    }
  } else {
    // Incorrect answer
    const newIncorrectStreak = incorrectStreak + 1;
    if (currentIndex > 0) {
      const nextDiff = DIFFICULTY_LEVELS[currentIndex - 1];
      return {
        nextDifficulty: nextDiff,
        nextCorrectStreak: 0,
        nextIncorrectStreak: newIncorrectStreak,
        reason: `Incorrect answer. Adjusted difficulty down to ${nextDiff}.`
      };
    } else {
      return {
        nextDifficulty: 'Easy',
        nextCorrectStreak: 0,
        nextIncorrectStreak: newIncorrectStreak,
        reason: 'Incorrect answer. Continuing at Easy level.'
      };
    }
  }
}

/**
 * Selects the optimal next question based on current difficulty, topic selection,
 * and ensuring topic diversity across the session.
 */
export function selectAdaptiveQuestion(
  targetDifficulty: Difficulty,
  selectedTopic: string | null,
  answeredQuestionIds: number[]
): Question | null {
  const answeredPlaceholders = answeredQuestionIds.length > 0 
    ? answeredQuestionIds.join(',') 
    : '0';

  // If a specific topic is selected
  if (selectedTopic) {
    // Try target difficulty in chosen topic
    const directMatch = query<any>(
      `SELECT question_id, topic_name, subtopic_name, difficulty, question_text, options_json, correct_answer, explanation
       FROM questions
       WHERE topic_name = ? AND difficulty = ? AND question_id NOT IN (${answeredPlaceholders})
       ORDER BY RANDOM() LIMIT 1`,
      [selectedTopic, targetDifficulty]
    );

    if (directMatch.length > 0) {
      return mapDbRowToQuestion(directMatch[0]);
    }

    // Fallback: any difficulty in chosen topic
    const fallbackTopic = query<any>(
      `SELECT question_id, topic_name, subtopic_name, difficulty, question_text, options_json, correct_answer, explanation
       FROM questions
       WHERE topic_name = ? AND question_id NOT IN (${answeredPlaceholders})
       ORDER BY RANDOM() LIMIT 1`,
      [selectedTopic]
    );

    if (fallbackTopic.length > 0) {
      return mapDbRowToQuestion(fallbackTopic[0]);
    }
  }

  // Mixed assessment / All topics mode:
  // Determine topic balance: find the topic with the fewest questions served so far
  const topicCounts = query<{ topic_name: string; count: number }>(
    `SELECT q.topic_name, COUNT(a.answer_id) as count
     FROM questions q
     LEFT JOIN answers a ON q.question_id = a.question_id AND a.question_id IN (${answeredPlaceholders})
     GROUP BY q.topic_name
     ORDER BY count ASC`
  );

  const preferredTopics = topicCounts.map(t => t.topic_name);

  // Try to find target difficulty in least-covered topic first
  for (const topic of preferredTopics) {
    const questionInTopic = query<any>(
      `SELECT question_id, topic_name, subtopic_name, difficulty, question_text, options_json, correct_answer, explanation
       FROM questions
       WHERE topic_name = ? AND difficulty = ? AND question_id NOT IN (${answeredPlaceholders})
       ORDER BY RANDOM() LIMIT 1`,
      [topic, targetDifficulty]
    );

    if (questionInTopic.length > 0) {
      return mapDbRowToQuestion(questionInTopic[0]);
    }
  }

  // If none found in preferred topics at target difficulty, search across all topics at target difficulty
  const anyTargetDiff = query<any>(
    `SELECT question_id, topic_name, subtopic_name, difficulty, question_text, options_json, correct_answer, explanation
     FROM questions
     WHERE difficulty = ? AND question_id NOT IN (${answeredPlaceholders})
     ORDER BY RANDOM() LIMIT 1`,
    [targetDifficulty]
  );

  if (anyTargetDiff.length > 0) {
    return mapDbRowToQuestion(anyTargetDiff[0]);
  }

  // Ultimate fallback: any unserved question
  const anyUnserved = query<any>(
    `SELECT question_id, topic_name, subtopic_name, difficulty, question_text, options_json, correct_answer, explanation
     FROM questions
     WHERE question_id NOT IN (${answeredPlaceholders})
     ORDER BY RANDOM() LIMIT 1`
  );

  return anyUnserved.length > 0 ? mapDbRowToQuestion(anyUnserved[0]) : null;
}

function mapDbRowToQuestion(row: any): Question {
  return {
    id: row.question_id,
    topic: row.topic_name,
    subtopic: row.subtopic_name,
    difficulty: row.difficulty as Difficulty,
    question: row.question_text,
    options: JSON.parse(row.options_json),
    correctAnswer: row.correct_answer,
    explanation: row.explanation
  };
}
