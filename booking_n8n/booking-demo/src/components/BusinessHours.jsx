import React from 'react';

const BusinessHours = () => {
  return (
    <div className="business-hours">
      <h4><i className="fas fa-clock"></i> Business Hours</h4>
      <ul>
        <li><strong>Days:</strong> Monday to Friday</li>
        <li><strong>Hours:</strong> 9:30 AM - 9:30 PM Malaysia time</li>
        <li><strong>Closed:</strong> 12:30 PM - 2:30 PM (lunch), 6:30 PM - 8:30 PM (dinner)</li>
      </ul>
    </div>
  );
};

export default BusinessHours;


