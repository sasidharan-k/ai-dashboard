import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getDashboardData = async () => {
  try {
    const response = await api.get('/dashboard-data');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

export const getServerStatus = async () => {
  try {
    const response = await api.get('/status');
    return response.data;
  } catch (error) {
    console.error('Error fetching server status:', error);
    throw error;
  }
};

export const getScreenshot = async (query: string) => {
  try {
    const response = await api.post('/screenshot', { query: query });
    return response.data;
  } catch (error) {
    console.error('Error fetching screenshot:', error);
    throw error;
  }
};

export const getWebSearch = async (question: string) => {
  try {
    const response = await api.post('/websearch', { question });
    return response.data;
  } catch (error) {
    console.error('Error performing web search:', error);
    throw error;
  }
};

export const getGoogleAnalytics = async (startDate: string, endDate: string) => {
  try {
    const response = await api.post('/google-analytics', { startDate, endDate });
    return response.data;
  } catch (error) {
    console.error('Error fetching Google Analytics data:', error);
    throw error;
  }
};
