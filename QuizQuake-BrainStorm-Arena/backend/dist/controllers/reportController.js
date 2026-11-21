import { z } from 'zod';
import { generateDiagnosticReport } from '../services/diagnosticEngine.js';
import { generateRemedialQuiz } from '../services/remedialEngine.js';
const remedialSchema = z.object({
    studentId: z.string().optional(),
    referenceSessionId: z.string().optional()
});
export async function handleGetReport(req, res) {
    try {
        const { sessionId } = req.params;
        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID is required' });
        }
        const report = generateDiagnosticReport(sessionId);
        return res.status(200).json(report);
    }
    catch (err) {
        console.error('Error in handleGetReport:', err);
        return res.status(404).json({ error: err.message || 'Report not found' });
    }
}
export async function handleGenerateRemedial(req, res) {
    try {
        const parse = remedialSchema.safeParse(req.body);
        if (!parse.success) {
            return res.status(400).json({ error: 'Invalid parameters', details: parse.error.format() });
        }
        const studentId = parse.data.studentId || 'student_01';
        const result = generateRemedialQuiz(studentId, parse.data.referenceSessionId);
        return res.status(201).json(result);
    }
    catch (err) {
        console.error('Error in handleGenerateRemedial:', err);
        return res.status(500).json({ error: err.message || 'Failed to generate remedial quiz' });
    }
}
