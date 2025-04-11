import React, { useState } from 'react';
import { getScreenshot } from '../api/api';
import './Dashboard.css'; // Reusing Dashboard styles for consistency
import Markdown from 'markdown-to-jsx';

interface ScreenshotResult {
  searchedURL: string;
  extractedText: string;
  success: boolean;
  url: string;
  screenshotUrl: string;
  summary: string
  timestamp: Date;
}

const Screenshot: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ScreenshotResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await getScreenshot(query);

      setResult(data);
    } catch (err) {
      setError('Failed to get screenshot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Flipkart Search & Screenshot Tool</h1>
      <div className="tool-container">
        <form onSubmit={handleSubmit} className="url-form">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter query to search"
            className="url-input"
          />
          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Get Screenshot'}
          </button>
        </form>

        {error && <div className="error">{error}</div>}

        {loading && <div className="loading">Generating screenshot...</div>}

        {result && (
          <div className="result-container">
            <div className="result-details">

              <div style={{ padding: '20px', lineHeight: 1.6 }}>
                <Markdown>{result.summary}</Markdown>
              </div>
              <p>Timestamp: {new Date(result.timestamp).toLocaleString()}</p>
            </div>
            <div className="screenshot-preview">
              <img src="http://localhost:3010/generated/screenshot.jpeg" alt="Generated" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Screenshot;