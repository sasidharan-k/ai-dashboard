import React from 'react';

interface Activity {
  id: number;
  user: string;
  action: string;
  timestamp: string;
  details: string;
}

interface ActivityListProps {
  activities: Activity[];
}

const ActivityList: React.FC<ActivityListProps> = ({ activities }) => {
  return (
    <div className="activity-list">
      {activities.length === 0 ? (
        <p>No recent activities</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Action</th>
              <th>Time</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => (
              <tr key={activity.id}>
                <td>{activity.user}</td>
                <td>{activity.action}</td>
                <td>{new Date(activity.timestamp).toLocaleString()}</td>
                <td>{activity.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ActivityList;
