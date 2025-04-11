import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import puppeteer from 'puppeteer';
import OpenAI from 'openai';
import path from 'path';
import FormData  from 'form-data';
import fs from 'fs';
import {excelReader} from './helper/excelReader';
import * as Tesseract from 'tesseract.js';
import { getAnalyticsData, summarizeAnalyticsData } from './google_analytic';
import {  uploadScreenshotToGCS } from './helper/img_cloud_uploader';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OCR_API_KEY = process.env.OCR_API_KEY;

console.log('OpenAI API Key:', OPENAI_API_KEY);
console.log('OCR API Key:', OCR_API_KEY);
// Load environment variables


const app = express();
const PORT = process.env.PORT || 3010;

// Middleware
app.use(cors());
app.use(express.json());


app.use(express.static(path.join(__dirname, 'public')));

app.use('/generated', express.static(path.join(__dirname, '/generated')))
// Routes
app.get('/api/status', (req: Request, res: Response) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

app.get('/api/dashboard-data', (req: Request, res: Response) => {
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

// async function extractTextFromImage(imagePath: string) {
//   const imageFile = fs.readFileSync(imagePath);
//   console.log('Base64 Preview:', imageFile.toString('base64').slice(0, 100));
//   const response = await axios.post(
//     'https://api.ocr.space/parse/image',
//     {
//      // base64Image: imageFile.toString('base64'), // No data:image/... prefix!
//       base64Image: `data:image/png;base64,${imageFile.toString('base64')}`,

//       language: 'eng',
//       isOverlayRequired: false,
//       filetype: 'PNG'
//     },
//     {
//       headers: {
//         apikey: OCR_API_KEY,
//         'Content-Type': 'application/json'
//       }
//     }
//   );
//   console.log('OCR Response:', response);
//   const parsedText = response.data?.ParsedResults?.[0]?.ParsedText;
//   return parsedText || '';
// }

async function extractTextFromImage(imagePath: string) {
  const imageFile = fs.readFileSync(imagePath);

  // Process image with Tesseract.js
  const { data: { text } } = await Tesseract.recognize(
    imageFile,  // You can also use the base64 data here, or the file path directly
    'eng',      // Language (English in this case)
    {
      logger: (m) => console.log(m), // Log progress
    }
  );

  console.log('Extracted Text:', text); // This will give the extracted text
  return text || '';
}
async function summarizeText(text: string) {
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that summarizes text. And give output with formatting so we can understand easily.' },
        { role: 'user', content: `Give some Analysis using this text depending on each product:\n\n${text}` }
      ]
    },
    {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data.choices[0].message.content;
}
// Screenshot API endpoint
app.post('/api/screenshot', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    const url = 'https://www.flipkart.com'
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Here you would typically connect to a screenshot service
    // For demonstration, we're returning mock data
    const browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    await page.goto( url , { waitUntil: "networkidle2" });

    await page.type('input[name="q"]', query);
    await page.keyboard.press("Enter");
    await page.waitForNavigation({ waitUntil: "networkidle2" });

    console.log("Waiting for results to load...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    await page.evaluate(() => window.scrollBy(0, 2000));
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const screenshotPath = '/tmp/flipkart_screenshot.jpeg';
    // const screenshotPath = path.join(__dirname,  ,"generated/screenshot.jpeg");
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log("Taking screenshot...", screenshotPath);
    const imageUrl = await uploadScreenshotToGCS(screenshotPath, 'flipkart_screenshot.jpeg');
    console.log("Image URL:", imageUrl);
    const extractedText = await extractTextFromImage(screenshotPath);
    console.log("Extracted text:", extractedText);


    const summary = await summarizeText(extractedText);
    const timestamp = new Date().toISOString();

    const result = {
      timestamp,
      query,
      searchedURL: `${url}?q=${encodeURIComponent(query)}`,
      screenshot: "screenshot.png",
      extractedText,
      summary,
      imageUrl
    };

    res.json(result);


  } catch (error) {
    console.error('Screenshot error:', error);
    res.status(500).json({ error: 'Failed to generate screenshot' });
  }
});

// Web search API endpoint
app.post('/api/websearch', async (req: Request, res: Response) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'question is required' });
    }

    const response = await excelReader(question)
    res.json({ ...response, question});
  } catch (error) {
    console.error('Web search error:', error);
    res.status(500).json({ error: 'Failed to perform web search' });
  }
});

// Google Analytics API endpoint
app.post('/api/google-analytics', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Both startDate and endDate are required' });
    }

    const analyticsData = await getAnalyticsData(startDate, endDate);
    const summary = await summarizeAnalyticsData(analyticsData);

    res.json({
      analyticsData,
      summary,
      timeframe: { startDate, endDate }
    });
  } catch (error) {
    console.error('Google Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch Google Analytics data' });
  }
});

// Serve static files from client build
const clientBuildPath = path.join(__dirname, '../../client/build'); // or 'client/build' if using Create React App
app.use(express.static(clientBuildPath));

// Catch-all route to send index.html for client-side routing
app.get('*', (_, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
