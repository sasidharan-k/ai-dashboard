import React, { useState } from 'react';
import { getGoogleAnalytics } from '../api/api';
import Markdown from 'markdown-to-jsx';

const GoogleAnalytics: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [summary, setSummary] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await getGoogleAnalytics(startDate, endDate);
      setAnalyticsData(response.analyticsData);
      setSummary(response.summary);
    } catch (err) {
      setError('Failed to fetch analytics data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    // Convert YYYYMMDD to YYYY-MM-DD format for display
    if (dateStr.length === 8) {
      return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
    }
    return dateStr;
  };

  return (
    <div className="container" style={{ padding: '20px' }}>
      <h1>Google Analytics Dashboard</h1>
      <p>View analytics data for a specific date range</p>

      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="startDate" style={{ display: 'block', marginBottom: '5px' }}>Start Date</label>
            <input
              id="startDate"
              type="text"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="YYYY-MM-DD or 7daysAgo"
              required
              style={{ width: '100%', padding: '8px' }}
            />
            <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
              E.g., '2023-04-01', 'today', 'yesterday', '7daysAgo', '30daysAgo'
            </small>
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="endDate" style={{ display: 'block', marginBottom: '5px' }}>End Date</label>
            <input
              id="endDate"
              type="text"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="YYYY-MM-DD or today"
              required
              style={{ width: '100%', padding: '8px' }}
            />
            <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
              E.g., '2023-04-30', 'today', 'yesterday'
            </small>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '8px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Loading...' : 'Fetch Report'}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div style={{
          padding: '10px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {analyticsData && (
        <>
          <div style={{
            border: '1px solid #ddd',
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            <div style={{
              borderBottom: '1px solid #ddd',
              backgroundColor: '#f8f9fa',
              padding: '10px 15px'
            }}>
              <h5 style={{ margin: 0 }}>Summary</h5>
            </div>
            <div style={{ padding: '15px' }}>
              <pre style={{
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                margin: 0
              }}>
                <Markdown>{summary || "No summary available."}</Markdown>
              </pre>
            </div>
          </div>

          {analyticsData.length > 0 ? (
            <div style={{
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}>
              <div style={{
                borderBottom: '1px solid #ddd',
                backgroundColor: '#f8f9fa',
                padding: '10px 15px'
              }}>
                <h5 style={{ margin: 0 }}>Daily Analytics Data</h5>
              </div>
              <div style={{ padding: '15px', overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse'
                }}>
                  <thead>
                    <tr>
                      <th style={{
                        padding: '8px',
                        borderBottom: '2px solid #ddd',
                        textAlign: 'left'
                      }}>Date</th>
                      <th style={{
                        padding: '8px',
                        borderBottom: '2px solid #ddd',
                        textAlign: 'left'
                      }}>Active Users</th>
                      <th style={{
                        padding: '8px',
                        borderBottom: '2px solid #ddd',
                        textAlign: 'left'
                      }}>Sessions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.map((row: any, index: number) => (
                      <tr key={index} style={{
                        backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white'
                      }}>
                        <td style={{ padding: '8px', borderTop: '1px solid #ddd' }}>
                          {formatDate(row.dimensionValues[0].value)}
                        </td>
                        <td style={{ padding: '8px', borderTop: '1px solid #ddd' }}>
                          {row.metricValues[0].value}
                        </td>
                        <td style={{ padding: '8px', borderTop: '1px solid #ddd' }}>
                          {row.metricValues[1].value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={{
              padding: '10px',
              backgroundColor: '#d1ecf1',
              color: '#0c5460',
              borderRadius: '4px'
            }}>
              No data available for the selected date range.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GoogleAnalytics;