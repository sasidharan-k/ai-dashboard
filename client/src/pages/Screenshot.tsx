import React, { useState } from 'react';
import { getScreenshot } from '../api/api';
import './Dashboard.css'; // Reusing Dashboard styles for consistency

interface ScreenshotResult {
  searchedURL: string;
  extractedText: string;
  success: boolean;
  url: string;
  screenshotUrl: string;
  timestamp: Date;
}

const Screenshot: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ScreenshotResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await getScreenshot(url);

      setResult(data);
    } catch (err) {
      setError('Failed to get screenshot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Screenshot Tool</h1>

      <div className="tool-container">
        <form onSubmit={handleSubmit} className="url-form">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL to screenshot"
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
            <h2>Screenshot Result</h2>
            <div className="result-details">
              <p>URL: {result.searchedURL}</p>
              <div style={{ padding: '20px', lineHeight: 1.6 }}>Text:{result.extractedText}</div>
              <p>Timestamp: {new Date(result.timestamp).toLocaleString()}</p>
            </div>
            <div className="screenshot-preview">
              <img
                src={result.screenshotUrl}
                alt="Screenshot"
                className="screenshot-image"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Screenshot;