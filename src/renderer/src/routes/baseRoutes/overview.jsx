import React, { useState, useEffect } from 'react';

import '../../assets/css/overview.css'

const Overview = () => {
    return (
        <div>
            <main>
                <div>
                    <div>
                        <h3 className="">Overview</h3>
                    </div>
                    <div className="grid-container">
                        <div className="card">
                            <div className="card-header">
                                <h3>Create New Post</h3>
                                <p>Start creating your new post here.</p>
                            </div>
                            <div className="card-body">
                                <button className="action-button">New Post</button>
                            </div>
                        </div>
                        <div className="card">
                            <div className="card-header">
                                <h3>Manage Posts</h3>
                                <p>Edit or delete your existing posts.</p>
                            </div>
                            <div className="card-body">
                                <button className="action-button">Manage Posts</button>
                            </div>
                        </div>
                        <div className="card">
                            <div className="card-header">
                                <h3>Edit Profile</h3>
                                <p>Update your profile details here.</p>
                            </div>
                            <div className="card-body">
                                <button className="action-button">Profile</button>
                            </div>
                        </div>
                        <div className="card">
                            <div className="card-header">
                                <h3>Settings</h3>
                                <p>Customize your account settings.</p>
                            </div>
                            <div className="card-body">
                                <button className="action-button">Settings</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Overview;