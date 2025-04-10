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

import { createCanvas, loadImage } from 'canvas';
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

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use('/generated', express.static(path.join(__dirname, '../generated')))
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

async function extractTextFromImage(imagePath: string) {
  const imageFile = fs.readFileSync(imagePath);
  console.log('Base64 Preview:', imageFile.toString('base64').slice(0, 100));
  const response = await axios.post(
    'https://api.ocr.space/parse/image',
    {
      base64Image: imageFile.toString('base64'), // No data:image/... prefix!
      language: 'eng',
      isOverlayRequired: false,
      filetype: 'PNG'
    },
    {
      headers: {
        apikey: OCR_API_KEY,
        'Content-Type': 'application/json'
      }
    }
  );
  console.log('OCR Response:', response);
  const parsedText = response.data?.ParsedResults?.[0]?.ParsedText;
  return parsedText || '';
}

async function summarizeText(text: string) {
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that summarizes text.' },
        { role: 'user', content: `Summarize the following text:\n\n${text}` }
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
    const { url } = req.body;
    const query = 'samsung mobile search'
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Here you would typically connect to a screenshot service
    // For demonstration, we're returning mock data
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    await page.goto("https://www.flipkart.com", { waitUntil: "networkidle2" });

    // try {

    //   await page.waitForSelector("button._2KpZ6l._2doB4z", { timeout: 5000 });
    //   await page.click("button._2KpZ6l._2doB4z");

    // } catch (popupErr: any) {

    //   console.log("Popup not found or already closed:", popupErr.message);
    // }

    await page.type('input[name="q"]', query);
    await page.keyboard.press("Enter");
    await page.waitForNavigation({ waitUntil: "networkidle2" });

    console.log("Waiting for results to load...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    await page.evaluate(() => window.scrollBy(0, 2000));
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const screenshotPath = path.join(__dirname, "screenshot.png");
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log("Taking screenshot...", screenshotPath);

    const extractedText = await extractTextFromImage(screenshotPath);
    console.log("Extracted text:", extractedText);

    // const image = await page.screenshot({ encoding: 'base64' });
    // await browser.close();

    // // console.log('Screenshot taken:', image);
    // // const base64data = reader.result.split(',')[1]; // Extract base64 data from the result
    // const base64ImageUrl = `data:image/jpeg;base64,${image}`;

    // // const base64Data = image.split(',')[1];
    // const buffer = Buffer.from(base64ImageUrl, 'base64');


    // const formData = new FormData();
    // formData.append('file', buffer, { filename: 'screenshot.jpg', contentType: 'image/jpeg'})


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

    // const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    //   model: 'gpt-4o-mini',
    //   messages: [
    //     {
    //       role: 'user',
    //       content: [
    //         { type: 'text', text: 'Summarize the content of this image.' },
    //         {
    //           type: 'image_url',
    //           image_url: {
    //             url: `data:image/jpeg;base64,${base64ImageUrl}`,
    //           },
    //         },
    //       ],
    //     },
    //   ],
    // }, {
    //   headers: {
    //     'Authorization': `Bearer ${OPENAI_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    // });
    const summary = await summarizeText(extractedText);
    res.json(summary);

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

app.use('/images', express.static(path.join(__dirname, 'src')));
// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
