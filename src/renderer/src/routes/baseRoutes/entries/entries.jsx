import { Unstable_Grid2 as Grid, Container, Button } from '@mui/material';
import { useOutletContext } from "react-router-dom";
import LinesEllipsis from 'react-lines-ellipsis'

import './entries.css';
import Place from '../../../assets/placeholder.svg';

const Entries = () => {
    const [mapData, ,] = useOutletContext();
    console.log(mapData);

    let entries = [...mapData.countries, ...mapData.cities, ...mapData.religions]
    let ImageAlt = "";
    return (
        <Container>
            <div className="contentSubHead">
                <h3 className="">Entries</h3>
            </div>
            <div className="contentSubBody">
                <div className="filter-menu">
                    <span>Show Only: </span>
                    <div className="options">
                        <button className="button">All</button>
                        <button className="button confirmed">
                            Confirmed
                            <img src="https://image.flaticon.com/icons/svg/443/443138.svg" alt="Confirmed" />
                        </button>
                        <button className="button pending">
                            Pending
                            <img src="https://image.flaticon.com/icons/svg/189/189106.svg" alt="Pending" />
                        </button>
                        <button className="button cancelled">
                            Cancelled
                            <img src="https://image.flaticon.com/icons/svg/579/579006.svg" alt="Cancelled" />
                        </button>
                    </div>
                </div>

                <Grid container spacing={2}>
                    {entries.map((entry, index) => (
                        <Grid xs={3} key={index} id={entry._id}>
                            <div className="post" data-id="21">
                                <div className="post-image">
                                    <img src={Place} alt={ImageAlt} data-id="22" />
                                </div>
                                <div className="post-content" data-id="23">
                                    <h2 className="post-title" data-id="24">
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
                                    <div className="post-info" data-id="26">
                                        <span className="post-category" data-id="27">
                                            Category:
                                            <br />
                                            Category 1
                                        </span>
                                        <Button variant="contained" className="post-button" data-id="28">
                                            Read More
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Grid>
                    ))}
                </Grid>
            </div>
        </Container>
    );
}

export default Entries;