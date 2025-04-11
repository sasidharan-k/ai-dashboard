import * as dotenv from 'dotenv';
import * as xlsx from 'xlsx';
import { OpenAI } from 'openai';
import * as path from 'path';
import * as fs from 'fs';
dotenv.config();
import {generateHTMLTable, saveTableAsImage} from './tableConverter'
interface ExcelRow {
  [key: string]: string | number | boolean | null;
}

interface AIResponse {
  answer: string;
  details: Record<string, any>;
}

// Load Excel data from file
function loadExcelData(filePath: string): ExcelRow[] {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = xlsx.utils.sheet_to_json(worksheet, { defval: '' });
  return jsonData as ExcelRow[];
}

// Ask OpenAI a question and expect JSON response
async function askOpenAI(question: string, contextData: ExcelRow[]): Promise<AIResponse> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt = `
    You are a data analyst. Based on the Excel data provided below (in JSON format), answer the question that follows.
    ❗IMPORTANT❗: Your response MUST be valid JSON. Do not include any extra commentary. Only output a single valid JSON object.

    Excel data:
    ${JSON.stringify(contextData, null, 2)}

    Question: ${question}

    Respond in this format:
    {
      "answer": "short answer here",
      "details": { ...any structured relevant information }
    }
    `;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    stream: false,
  });
  const content = response.choices[0].message.content;

  if (!content) throw new Error('Empty response from OpenAI');

  try {
    return JSON.parse(content);
  } catch (err) {
    console.error('Failed to parse JSON from response:\n', content);
    throw err;
  }
}

// Main runner
export async function excelReader(question: string) {
  const filePath = path.join(__dirname, "NI.xlsx"); // Adjust the path to your Excel file
  console.log('Loading Excel data from:', filePath);

  const data = loadExcelData(filePath);
  const response = await askOpenAI(question, data);
  let imageUrl = '';
  console.log('JSON Response from OpenAI:');
  if (response.details) {
    const answer = response.answer;
    let details = response.details || [];
    if (typeof details === 'string') {
      try {
        details = JSON.parse(details);
      } catch (err) {
        console.error('Failed to parse details:', err);
        details = [];
      }
    }
    details = Array.isArray(details) ? details : Object.values(details);
    details = details.flat()
    console.log('Answer:', response.answer);
    console.log('Details:', details);
    const imagePath = 'tmp/web_search_screenshot.jpeg';
    imageUrl = await saveTableAsImage(generateHTMLTable(details as any[], answer), imagePath);
  }
  return {imageUrl, ai_response: response};
}

// excelReader('top banking stocks').catch(console.error);
