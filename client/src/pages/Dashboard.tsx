import React, { useState, useEffect } from 'react';
import { getDashboardData } from '../api/api';
import StatsCard from '../components/StatsCard';
import ActivityList from '../components/ActivityList';
import './Dashboard.css';

interface DashboardData {
  stats: {
    users: number;
    activeSessions: number;
    aiProcessed: number;
    responseTime: string;
  };
  recentActivities: Array<{
    id: number;
    user: string;
    action: string;
    timestamp: string;
    details: string;
  }>;
}

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardData();
        setDashboardData(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch dashboard data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">AI Dashboard</h1>
      
      {dashboardData && (
        <>
          <div className="stats-container">
            <StatsCard title="Total Users" value={dashboardData.stats.users} />
            <StatsCard title="Active Sessions" value={dashboardData.stats.activeSessions} />
            <StatsCard title="AI Processed" value={dashboardData.stats.aiProcessed} />
            <StatsCard title="Avg Response Time" value={dashboardData.stats.responseTime} />
          </div>
          
          <div className="activities-container">
            <h2>Recent Activities</h2>
            <ActivityList activities={dashboardData.recentActivities} />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
