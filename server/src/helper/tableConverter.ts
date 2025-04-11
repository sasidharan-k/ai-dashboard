import fs from 'fs';
import puppeteer from 'puppeteer';
import dotenv from 'dotenv';
dotenv.config();
// Sample JSON data (you can replace this with any JSON)
const jsonData = [
  { Name: 'Alice', Age: 30, City: 'New York' },
  { Name: 'Bob', Age: 25, City: 'Los Angeles' },
  { Name: 'Charlie', Age: 35, City: 'Chicago' }
];

// Generate HTML table from JSON
export function generateHTMLTable(data: any[], title: string) {
  const headers = Object.keys(data[0]);
  const headerRow = headers.map(h => `<th>${h}</th>`).join('');
  const rows = data.map(row => {
    return '<tr>' + headers.map(h => `<td>${row[h]}</td>`).join('') + '</tr>';
  }).join('');

  return `
    <html>
      <head>
        <style>
          table {
            border-collapse: collapse;
            font-family: Arial;
            font-size: 16px;
          }
          th, td {
            border: 1px solid #ccc;
            padding: 8px 12px;
            text-align: center;
          }
          th {
            background-color: #f2f2f2;
          }
        </style>
      </head>
      <body>
        <div class="table-content">
          <h2>${title}</h2>
          <br />
          <table>
            <thead><tr>${headerRow}</tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </body>
    </html>
  `;
}

// Save image from HTML using Puppeteer
export async function saveTableAsImage(html: string, outputPath: string) {
  const browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: 'networkidle0' });

  const tableElement = await page.$('.table-content');
  if (tableElement) {
    await tableElement.screenshot({ path: outputPath });
  } else {
    throw new Error('Table element not found on the page.');
  }

  await browser.close();
  return outputPath;
}

// // Main function
// (async () => {
//   const html = generateHTMLTable(jsonData);
//   await saveTableAsImage(html);
//   console.log('✅ Table image saved as table_image.png');
// })();
