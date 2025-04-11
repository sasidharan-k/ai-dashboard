import { google } from 'googleapis';
import { OpenAI } from 'openai';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

// Configure Google Analytics
const GA_PROPERTY_ID = process.env.GA_PROPERTY_ID || '';
const SERVICE_ACCOUNT_KEY_FILE = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

console.log('SERVICE_ACCOUNT_KEY_FILE:', SERVICE_ACCOUNT_KEY_FILE);
export async function getAnalyticsData(startDate: string, endDate: string) {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
  });

  const analyticsData = google.analyticsdata({ auth, version: 'v1beta'  });

  const response = await analyticsData.properties.runReport({
    property: `properties/${GA_PROPERTY_ID}`,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
      ],
      dimensions: [{ name: 'date' }],
    },
  });
  console.log('Google Analytics Response:', response.data);
  return response.data.rows || [];
}

export async function summarizeAnalyticsData(rows: any[]) {
  if (!rows || rows.length === 0) {
    return 'No analytics data available.';
  }

  let dataString = 'Google Analytics 4 Data:\n';

  rows.forEach((row) => {
    const date = row.dimensionValues[0].value;
    const activeUsers = row.metricValues[0].value;
    const sessions = row.metricValues[1].value;

    dataString += `Date: ${date}, Active Users: ${activeUsers}, Sessions: ${sessions}\n`;
  });

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: `
            Summarize the following GA4 analytics data:\n\n${dataString}\n\nGive a concise summary of trends and insights.
            Respond in this format:
            {
              "answer": "short answer here",
              "details": { ...any structured relevant information }
            }
          `,
        },
      ],
      model: 'gpt-4o-mini', // or 'gpt-4'
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error summarizing with OpenAI:', error);
    return 'Error summarizing the data.';
  }
}

// For testing purposes
async function main() {
  const startDate = '7daysAgo'; // Or 'YYYY-MM-DD'
  const endDate = 'today'; // Or 'YYYY-MM-DD'

  try {
    const analyticsData = await getAnalyticsData(startDate, endDate);
    analyticsData.forEach((row: any) => {
      const date = row.dimensionValues[0].value;
      const users = row.metricValues[0].value;
      const sessions = row.metricValues[1].value;
      console.log(`Date: ${date}, Users: ${users}, Sessions: ${sessions}`);
    });
    console.log('Analytics Data:\n', analyticsData);
    const summary = await summarizeAnalyticsData(analyticsData);
    console.log('Summary:\n', summary);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Comment out main() when using as a module
// main();