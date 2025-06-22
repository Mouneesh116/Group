import React from 'react';
import './PersonalInfo.css'; // Keep this for any specific internal PersonalInfo styles, but main look comes from UserProfile.css

const PersonalInfo = ({ user }) => {
  return (
    <div className="personal-info"> {/* Use "personal-info" class here */}
      <h2 className="personal-info-title">Personal Information</h2>
      <p><strong>Name:</strong> {user.userName || 'N/A'}</p>
      <p><strong>Email:</strong> {user.email || 'N/A'}</p>
    </div>
  );
};

export default PersonalInfo;