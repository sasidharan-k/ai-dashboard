import React, { useState } from 'react';
import { getWebSearch } from '../api/api';
import './Dashboard.css'; // Reusing Dashboard styles for consistency

interface SearchResult {
  title: string;
  snippet: string;
}

interface WebSearchResult {
  success: boolean;
  imagePath: string;
}

const WebSearch: React.FC = () => {
  const [question, setUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<WebSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question) {
      setError('Please enter a question');
      return;
    }

    setLoading(true);
    try {
      const data = await getWebSearch(question);
      console.log('Web Search Result:', data);
      setResult(data);
    } catch (err) {
      setError('Failed to perform web search');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Web Search Tool</h1>

      <div className="tool-container">
        <form onSubmit={handleSubmit} className="url-form">
          <input
            type="text"
            value={question}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter question to search"
            className="url-input"
          />
          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search Web'}
          </button>
        </form>

        {error && <div className="error">{error}</div>}

        {loading && <div className="loading">Performing web search...</div>}

        {result && (
          <div className="result-container">
            <h2>Web Search Results</h2>
            {/* <div className="result-details">
              <p>URL: {result.url}</p>
              <p>Timestamp: {new Date(result.timestamp).toLocaleString()}</p>
            </div>
            <div className="search-results">
              {result.results.map((item, index) => (
                <div key={index} className="search-result-item">
                  <h3>{item.title}</h3>
                  <p>{item.snippet}</p>
                </div>
              ))}
            </div> */}
            <div className="screenshot-preview">
              <img src="http://localhost:3010/generated/output.jpeg" alt="Generated" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebSearch;