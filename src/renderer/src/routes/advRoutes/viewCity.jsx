import React from 'react';

import { styled } from '@mui/material/styles';
import { Paper } from '@mui/material';
import { SellOutlined } from '@mui/icons-material';


import './viewStyles.css';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  }));

const ViewCity = () => {
    return (
        <Item>
            <div className="content-container" data-id="18">
                <div className="header" data-id="19">
                    <h1 className="title" data-id="20">Paris, France</h1>
                    <button className="edit-button" data-id="21">Edit</button>
                </div>
                <div className="card" data-id="22">
                    <div className="card-header" data-id="23">
                        <h2 className="card-title" data-id="24">Introduction</h2>
                        <div className="metadata" data-id="25">
                            <span className="date" data-id="26">Posted on: 28th November, 2023</span>
                            <div className="tags" data-id="27">
                                <SellOutlined width="24" height="24" />
                                <span className="tag" data-id="29">Culture, History, Geography</span>
                            </div>
                        </div>
                    </div>
                    <p className="content" data-id="30">
                        Paris, France's capital, is a major European city and a global center for art, fashion, gastronomy and culture.
                        Its 19th-century cityscape is crisscrossed by wide boulevards and the River Seine. Beyond such landmarks as the Eiffel
                        Tower and the 12th-century, Gothic Notre-Dame cathedral, the city is known for its cafe culture and designer boutiques
                        along the Rue du Faubourg Saint-Honoré.
                    </p>
                </div>
            </div>
        </Item>
    );
}

export default ViewCity;