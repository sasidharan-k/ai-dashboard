"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3010;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.get('/api/status', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date() });
});
app.get('/api/dashboard-data', (req, res) => {
    // Mock dashboard data
    res.json({
        stats: {
            users: 1250,
            activeSessions: 384,
            aiProcessed: 15782,
            responseTime: '1.2s'
        },
        recentActivities: [
            { id: 1, user: 'user123', action: 'AI Query', timestamp: new Date(), details: 'Generated image from text' },
            { id: 2, user: 'admin', action: 'System Update', timestamp: new Date(), details: 'Updated AI model to v2.4' },
            { id: 3, user: 'user456', action: 'Data Export', timestamp: new Date(), details: 'Exported monthly report' }
        ]
    });
});
// Screenshot API endpoint
app.post('/api/screenshot', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }
        // Here you would typically connect to a screenshot service
        // For demonstration, we're returning mock data
        res.json({
            success: true,
            url: url,
            screenshotUrl: `https://screenshot.example/image/${Buffer.from(url).toString('base64')}`,
            timestamp: new Date()
        });
    }
    catch (error) {
        console.error('Screenshot error:', error);
        res.status(500).json({ error: 'Failed to generate screenshot' });
    }
}));
// Web search API endpoint
app.post('/api/websearch', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }
        // Here you would typically connect to a web search service or crawl the URL
        // For demonstration, we're returning mock data
        res.json({
            success: true,
            url: url,
            results: [
                { title: 'Search Result 1', snippet: 'This is a sample search result from the provided URL' },
                { title: 'Search Result 2', snippet: 'Another example search result with some content' },
                { title: 'Search Result 3', snippet: 'A third mock search result from the webpage' }
            ],
            timestamp: new Date()
        });
    }
    catch (error) {
        console.error('Web search error:', error);
        res.status(500).json({ error: 'Failed to perform web search' });
    }
}));
// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
