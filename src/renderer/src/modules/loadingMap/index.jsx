import React from 'react';

const LoadingMap = ({ dynamicText, progress }) => {
    return (
        <div className="loading-container">
            <div className="loading-content">
                <h2 className="loading-title">Loading Map...</h2>
                <p className="loading-text">Now Loading: {dynamicText}...</p>
                <div className="loading-spinner"></div>
            </div>
        </div>
    );
};

export default LoadingMap;
