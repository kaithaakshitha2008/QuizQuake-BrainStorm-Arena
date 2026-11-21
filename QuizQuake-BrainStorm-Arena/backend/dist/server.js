import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getDb } from './database/db.js';
import quizRoutes from './routes/quizRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import { handleGetHistory } from './controllers/quizController.js';
import { handleGetTopics } from './controllers/questionController.js';
import { handleGenerateRemedial } from './controllers/reportController.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 5050;
app.use(cors({ origin: '*' }));
app.use(express.json());
// Request logger for hackathon demo transparency
app.use((req, res, next) => {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
    next();
});
// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ONLINE',
        platform: 'QuizQuake: BrainStorm Arena',
        version: '1.0.0',
        adaptiveEngine: 'Consecutive-Scaling-Active',
        timestamp: new Date().toISOString()
    });
});
// Mounted Routes
app.use('/api/quiz', quizRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/report', reportRoutes);
// Direct canonical aliases specified in Project Architecture Section 7
app.get('/api/history/:studentId', handleGetHistory);
app.get('/api/topics', handleGetTopics);
app.post('/api/remedial/generate', handleGenerateRemedial);
// Static frontend serving if dist exists
const possibleDistPaths = [
    path.resolve(process.cwd(), 'frontend/dist'),
    path.resolve(process.cwd(), '../frontend/dist'),
    path.resolve(__dirname, '../../frontend/dist'),
];
const distPath = possibleDistPaths.find(p => fs.existsSync(p));
if (distPath) {
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) {
            return next();
        }
        res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log(`📦 Serving production frontend bundle from ${distPath}`);
}
// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});
async function bootstrap() {
    try {
        console.log('Initializing QuizQuake SQLite Database & Adaptive Engine...');
        await getDb();
        console.log('Database initialized successfully.');
        app.listen(PORT, () => {
            console.log(`⚡ QuizQuake Backend running on http://localhost:${PORT}`);
            console.log(`🎯 API Health check at http://localhost:${PORT}/api/health`);
            if (distPath) {
                console.log(`🚀 Unified Web App available at http://localhost:${PORT}`);
            }
        });
    }
    catch (error) {
        console.error('Failed to start QuizQuake backend:', error);
        process.exit(1);
    }
}
bootstrap();
