import React from 'react';

const LoadingSpinner = ({ fullScreen = false }) => {
  const containerStyle = fullScreen ? {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '60vh'
  } : {
    display: 'flex',
    justifyContent: 'center',
    padding: '2rem'
  };

  return (
    <div style={containerStyle}>
      <div className="spinner"></div>
    </div>
  );
};

export default LoadingSpinner;
