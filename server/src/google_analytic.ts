import { google } from 'googleapis';
import { OpenAI } from 'openai';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

// Configure Google Analytics
const VIEW_ID = '483175019'; // Replace with your Google Analytics View ID
// const SERVICE_ACCOUNT_EMAIL = 'sasidharan@thydreamtech.com'; // Replace with your service account email
// const SERVICE_ACCOUNT_KEY_FILE = 'path/to/your/service-account-key.json'; // Replace with the path to your service account key file
const SERVICE_ACCOUNT_KEY_FILE = path.join(__dirname, '../' ,"peep-app-fb-430cdcc7a2a2.json")
// Configure OpenAI
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

console.log('SERVICE_ACCOUNT_KEY_FILE:', SERVICE_ACCOUNT_KEY_FILE);
async function getAnalyticsData(startDate: string, endDate: string) {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
  });

  const client = await auth.getClient();
  const analytics = google.analyticsreporting({ auth: client as any, version: 'v4' });

  const response = await analytics.reports.batchGet({
    requestBody: {
      reportRequests: [
        {
          viewId: VIEW_ID,
          dateRanges: [{ startDate, endDate }],
          metrics: [
            { expression: 'ga:users' },
            { expression: 'ga:sessions' },
            { expression: 'ga:pageviews' },
            { expression: 'ga:bounceRate' },
            { expression: 'ga:avgSessionDuration' },
          ],
          dimensions: [{ name: 'ga:date' }],
        },
      ],
    },
  });
  console.log('Google Analytics Response:', response.data);
  if (response.data && response.data.reports && response.data.reports[0] && response.data.reports[0].data && response.data.reports[0].data.rows) {
    return response.data.reports[0].data.rows;
  } else {
    return []; // Return an empty array if data is missing.
  }
}

async function summarizeAnalyticsData(data: any[]) {
  if (!data || data.length === 0) {
    return 'No analytics data available.';
  }

  let dataString = 'Google Analytics Data:\n';
  data.forEach((row) => {
    const date = row.dimensions[0];
    const users = row.metrics[0].values[0];
    const sessions = row.metrics[0].values[1];
    const pageviews = row.metrics[0].values[2];
    const bounceRate = row.metrics[0].values[3];
    const avgSessionDuration = row.metrics[0].values[4];

    dataString += `Date: ${date}, Users: ${users}, Sessions: ${sessions}, Pageviews: ${pageviews}, Bounce Rate: ${bounceRate}, Avg. Session Duration: ${avgSessionDuration}\n`;
  });

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: `Summarize the following Google Analytics data:\n\n${dataString}\n\nProvide a concise summary of the key trends and insights.`,
        },
      ],
      model: 'gpt-3.5-turbo', // Or 'gpt-4' for better results
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error summarizing with OpenAI:', error);
    return 'Error summarizing the data.';
  }
}

async function main() {
  const startDate = '7daysAgo'; // Or 'YYYY-MM-DD'
  const endDate = 'today'; // Or 'YYYY-MM-DD'

  try {
    const analyticsData = await getAnalyticsData(startDate, endDate);
    const summary = await summarizeAnalyticsData(analyticsData);
    console.log('Summary:\n', summary);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();