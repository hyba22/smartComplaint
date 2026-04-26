import React from 'react';

import { useAppSelector } from 'app/config/store';

export const TrackerPage = () => {
  const activities = useAppSelector(state => state.administration.tracker.activities);

  return (
    <div>
      <h2 data-cy="trackerPageHeading">Activité des utilisateurs en temps réel</h2>
      <table className="table table-sm table-striped table-bordered" data-cy="trackerTable">
        <thead>
          <tr>
            <th>
              <span>Utilisateur</span>
            </th>
            <th>
              <span>Adresse IP</span>
            </th>
            <th>
              <span>Page en cours</span>
            </th>
            <th>
              <span>Heure</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity, i) => (
            <tr key={`log-row-${i}`}>
              <td>{activity.userLogin}</td>
              <td>{activity.ipAddress}</td>
              <td>{activity.page}</td>
              <td>{activity.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TrackerPage;
