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
const axios_1 = __importDefault(require("axios"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const openai_1 = __importDefault(require("openai"));
const path_1 = __importDefault(require("path"));
const form_data_1 = __importDefault(require("form-data"));
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
console.log('OpenAI API Key:', OPENAI_API_KEY);
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3010;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
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
        const query = 'samsung mobile search';
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }
        // Here you would typically connect to a screenshot service
        // For demonstration, we're returning mock data
        const browser = yield puppeteer_1.default.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page = yield browser.newPage();
        yield page.setViewport({ width: 1280, height: 800 });
        yield page.goto("https://www.flipkart.com", { waitUntil: "networkidle2" });
        // try {
        //   await page.waitForSelector("button._2KpZ6l._2doB4z", { timeout: 5000 });
        //   await page.click("button._2KpZ6l._2doB4z");
        // } catch (popupErr: any) {
        //   console.log("Popup not found or already closed:", popupErr.message);
        // }
        yield page.type('input[name="q"]', query);
        yield page.keyboard.press("Enter");
        yield page.waitForNavigation({ waitUntil: "networkidle2" });
        console.log("Waiting for results to load...");
        yield new Promise((resolve) => setTimeout(resolve, 3000));
        yield page.evaluate(() => window.scrollBy(0, 2000));
        yield new Promise((resolve) => setTimeout(resolve, 2000));
        const screenshotPath = path_1.default.join(__dirname, "screenshot.png");
        // await page.screenshot({ path: screenshotPath, fullPage: true });
        const image = yield page.screenshot({ encoding: 'base64' });
        yield browser.close();
        // console.log('Screenshot taken:', image);
        // const base64data = reader.result.split(',')[1]; // Extract base64 data from the result
        const base64ImageUrl = `data:image/jpeg;base64,${image}`;
        // const base64Data = image.split(',')[1];
        const buffer = Buffer.from(base64ImageUrl, 'base64');
        const formData = new form_data_1.default();
        formData.append('file', buffer, { filename: 'screenshot.jpg', contentType: 'image/jpeg' });
        // const buffer = Buffer.from(image, 'base64');
        // const imageInstance = await loadImage(buffer);
        // const canvas = createCanvas(imageInstance.width, imageInstance.height);
        // const ctx = canvas.getContext('2d');
        // ctx.drawImage(imageInstance, 0, 0);
        // const pngBuffer = canvas.toBuffer('image/png');
        // const response = await openai.chat.completions.create({
        //   model: 'gpt-4',
        //   messages: [
        //     {
        //       role: 'user',
        //       content: [
        //         { type: 'text', text: 'Summarize the content of this image.' },
        //         {
        //           type: 'image_url',
        //           image_url: {
        //             url: `data:image/png;base64,${pngBuffer.toString('base64')}`,
        //           },
        //         },
        //       ],
        //     },
        //   ],
        //   max_tokens: 300,
        // });
        // Send the analysis response
        // const analysis = response.choices[0].message.content;
        // res.json({ analysis });
        console.log(OPENAI_API_KEY);
        const response = yield axios_1.default.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Summarize the content of this image.' },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/jpeg;base64,${base64ImageUrl}`,
                            },
                        },
                    ],
                },
            ],
            max_tokens: 300,
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        res.json(response.data.choices[0].message.content);
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
