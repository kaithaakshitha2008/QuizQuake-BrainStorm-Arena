import { 
  AnswerRecord, 
  DiagnosticReport, 
  SubtopicDiagnostic, 
  TopicDiagnostic,
  DifficultyTrajectoryPoint 
} from '../types/index.js';
import { query } from '../database/db.js';

export function classifyAccuracy(accuracy: number): 'Strong' | 'Good' | 'Needs improvement' | 'Weak' {
  if (accuracy >= 80) return 'Strong';
  if (accuracy >= 60) return 'Good';
  if (accuracy >= 40) return 'Needs improvement';
  return 'Weak';
}

export function generateDiagnosticReport(sessionId: string): DiagnosticReport {
  // Fetch session details
  const sessionRows = query<any>(
    'SELECT * FROM quiz_sessions WHERE session_id = ?',
    [sessionId]
  );

  if (sessionRows.length === 0) {
    throw new Error(`Session ${sessionId} not found.`);
  }

  const session = sessionRows[0];

  // Fetch all answered questions with details
  const answers = query<any>(
    `SELECT 
      a.answer_id,
      a.session_id,
      a.question_id,
      a.selected_answer,
      a.is_correct,
      a.time_spent_seconds,
      a.difficulty_at_question,
      a.created_at,
      q.question_text as question,
      q.options_json,
      q.correct_answer,
      q.explanation,
      q.topic_name as topic,
      q.subtopic_name as subtopic
     FROM answers a
     JOIN questions q ON a.question_id = q.question_id
     WHERE a.session_id = ?
     ORDER BY a.answer_id ASC`,
    [sessionId]
  );

  const parsedReview: AnswerRecord[] = answers.map(a => ({
    answer_id: a.answer_id,
    session_id: a.session_id,
    question_id: a.question_id,
    selected_answer: a.selected_answer,
    is_correct: Boolean(a.is_correct),
    time_spent_seconds: a.time_spent_seconds,
    difficulty_at_question: a.difficulty_at_question,
    created_at: a.created_at,
    question: a.question,
    options: JSON.parse(a.options_json),
    correct_answer: a.correct_answer,
    explanation: a.explanation,
    topic: a.topic,
    subtopic: a.subtopic
  }));

  const totalQuestions = parsedReview.length;
  const correctAnswers = parsedReview.filter(a => a.is_correct).length;
  const overallAccuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100 * 10) / 10 : 0;
  const totalTimeSeconds = parsedReview.reduce((acc, curr) => acc + curr.time_spent_seconds, 0);

  // Group by topic and subtopic
  const topicMap: Record<string, { correct: number; total: number; subtopics: Record<string, { correct: number; total: number }> }> = {};

  for (const record of parsedReview) {
    const t = record.topic || 'General';
    const st = record.subtopic || 'General';

    if (!topicMap[t]) {
      topicMap[t] = { correct: 0, total: 0, subtopics: {} };
    }
    topicMap[t].total += 1;
    if (record.is_correct) {
      topicMap[t].correct += 1;
    }

    if (!topicMap[t].subtopics[st]) {
      topicMap[t].subtopics[st] = { correct: 0, total: 0 };
    }
    topicMap[t].subtopics[st].total += 1;
    if (record.is_correct) {
      topicMap[t].subtopics[st].correct += 1;
    }
  }

  const topicDiagnostics: TopicDiagnostic[] = [];
  const allSubtopics: SubtopicDiagnostic[] = [];

  for (const [topicName, data] of Object.entries(topicMap)) {
    const topicAccuracy = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
    const subtopicsList: SubtopicDiagnostic[] = [];

    for (const [subtopicName, subData] of Object.entries(data.subtopics)) {
      const subAccuracy = subData.total > 0 ? Math.round((subData.correct / subData.total) * 100) : 0;
      const subDiagnostic: SubtopicDiagnostic = {
        subtopic: subtopicName,
        topic: topicName,
        correct: subData.correct,
        total: subData.total,
        accuracy: subAccuracy,
        classification: classifyAccuracy(subAccuracy)
      };
      subtopicsList.push(subDiagnostic);
      allSubtopics.push(subDiagnostic);
    }

    topicDiagnostics.push({
      topic: topicName,
      correct: data.correct,
      total: data.total,
      accuracy: topicAccuracy,
      classification: classifyAccuracy(topicAccuracy),
      subtopics: subtopicsList
    });
  }

  // Identify strongest and weakest topics & subtopics
  const strongestTopics = topicDiagnostics
    .filter(t => t.accuracy >= 60)
    .sort((a, b) => b.accuracy - a.accuracy)
    .map(t => t.topic);

  const weakestTopics = topicDiagnostics
    .filter(t => t.accuracy < 60)
    .sort((a, b) => a.accuracy - b.accuracy)
    .map(t => t.topic);

  const weakestSubtopics = allSubtopics
    .filter(st => st.accuracy < 60)
    .sort((a, b) => a.accuracy - b.accuracy);

  // Difficulty Trajectory
  const difficultyTrajectory: DifficultyTrajectoryPoint[] = parsedReview.map((a, idx) => ({
    questionNumber: idx + 1,
    difficulty: a.difficulty_at_question,
    isCorrect: a.is_correct,
    topic: a.topic || 'General',
    subtopic: a.subtopic || 'General'
  }));

  // Generate AI Insights
  const aiInsights = generateInsights(overallAccuracy, topicDiagnostics, weakestSubtopics, difficultyTrajectory);

  return {
    sessionId,
    studentId: session.student_id,
    completedAt: session.completed_at || new Date().toISOString(),
    totalQuestions,
    correctAnswers,
    overallAccuracy,
    totalTimeSeconds,
    isRemedial: Boolean(session.is_remedial),
    topicDiagnostics,
    subtopicDiagnostics: allSubtopics,
    strongestTopics,
    weakestTopics,
    weakestSubtopics,
    difficultyTrajectory,
    aiInsights,
    review: parsedReview
  };
}

function generateInsights(
  overallAccuracy: number,
  topics: TopicDiagnostic[],
  weakestSubtopics: SubtopicDiagnostic[],
  trajectory: DifficultyTrajectoryPoint[]
): string[] {
  const insights: string[] = [];

  // Overall tier commentary
  if (overallAccuracy >= 85) {
    insights.push(`Mastery Achieved: Exceptional overall performance (${overallAccuracy}%). You effectively handled advanced multi-concept challenges.`);
  } else if (overallAccuracy >= 65) {
    insights.push(`Strong Baseline: Solid overall performance (${overallAccuracy}%). Focused reinforcement on specific edge cases will elevate your mastery.`);
  } else {
    insights.push(`Targeted Growth Opportunity: Current score is ${overallAccuracy}%. Conceptual review recommended prior to re-attempting timed tests.`);
  }

  // Trajectory insight
  const reachedHard = trajectory.some(t => t.difficulty === 'Hard');
  if (reachedHard) {
    insights.push('Adaptive Scaling: Successfully triggered progression into Hard difficulty questions through consecutive accurate answers.');
  }

  // Subtopic pinpointing
  if (weakestSubtopics.length > 0) {
    const worst = weakestSubtopics[0];
    insights.push(
      `Weakness Detection: Conceptual vulnerability detected in "${worst.topic} › ${worst.subtopic}" (${worst.accuracy}% accuracy across ${worst.total} question${worst.total > 1 ? 's' : ''}). Practice with the Remedial Engine to reinforce this area.`
    );
  }

  // Strengths
  const strongTopics = topics.filter(t => t.accuracy >= 80);
  if (strongTopics.length > 0) {
    insights.push(`Top Competency: Demonstrated superior grasp in ${strongTopics.map(t => t.topic).join(', ')}.`);
  }

  return insights;
}
