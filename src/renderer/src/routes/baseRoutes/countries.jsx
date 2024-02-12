import { Unstable_Grid2 as Grid, Button } from '@mui/material';
import { useOutletContext } from "react-router-dom";
import LinesEllipsis from 'react-lines-ellipsis'

import { Chip } from '@mui/material';

import '../../assets/css/countries.css';
import Place from '../../assets/placeholder.svg';

import '../../assets/css/shortTags.css';

const Countries = () => {
    const [mapData, setMap] = useOutletContext();
    console.log(mapData);

    let ImageAlt = "";
    return (
        <>
            <div className="contentSubHead">
                <h3 className="">Countries</h3>
            </div>
            <div className="contentSubBody">
                <Grid container spacing={2}>
                    {mapData.countries.map((entry, index) => (
                        <Grid xs={3} key={index} id={entry._id}>
                            <div className="country-tile">
                                <div className="country-tile-image">
                                    <img src={entry.coa === undefined ? ("https://armoria.herokuapp.com/?size=500&format=svg") : ("https://armoria.herokuapp.com/?coa=" + JSON.stringify(entry.coa))} alt={ImageAlt} />
                                </div>
                                <div className="country-tile-content">
                                    <h2 className="country-tile-title">
                                        {entry.name}
                                    </h2>
                                    <LinesEllipsis
                                        text={entry.description}
                                        maxLine='3'
                                        ellipsis='...'
                                        trimRight
                                        basedOn='letters'
                                        id={'entry.id-' + entry._id}
                                        className='post-text'
                                    />
                                    <div className="country-tile-info">
                                        <span className="country-tile-category">
                                            Tags:
                                            <br />
                                            {entry.tags.map((tag, index) => (
                                                <Chip size="small" key={index} label={tag.Name} />
                                            ))}
                                        </span>
                                        <button className="country-tile-button">
                                            Read More
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Grid>
                    ))}
                </Grid>
            </div>
        </>
    );
}

export default Countries;