import React, { useState, useEffect } from 'react';
import { Unstable_Grid2 as Grid, Skeleton, LinearProgress, Alert, AlertTitle, Chip } from '@mui/material';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { useOutletContext } from 'react-router-dom';

import LinesEllipsis from 'react-lines-ellipsis';

import '../../assets/css/countries.css';
import '../../assets/css/shortTags.css';

import { InfinitySpin } from 'react-loader-spinner';
import { getAllCities } from '../../modules/utilities/cities';

const Cities = () => {
    const [mapData, setMap] = useOutletContext();
    const [loading, setLoading] = useState(true);
    const [loadedCities, setLoadedCities] = useState([]);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [currentCityName, setCurrentCityName] = useState('');
    const [currentCount, setCurrentCount] = useState(0);
    const batchSize = 5; // Adjust the batch size as needed

    const allCities = getAllCities();
    useEffect(() => {
        const loadData = async () => {
            try {
                const totalCities = allCities.length;

                for (let i = 0; i < totalCities; i += batchSize) {
                    const batchCities = allCities.slice(i, i + batchSize);

                    // Process the city data and update state
                    setLoadedCities((prevCities) => [...prevCities, ...batchCities]);

                    // Update loading progress, current city name, and current count
                    const progress = Math.min(((i + batchSize) / totalCities) * 100, 100); // Ensure progress doesn't exceed 100%
                    setLoadingProgress(progress);
                    setCurrentCityName(batchCities[batchCities.length - 1].name); // Show the last city in the batch
                    const currentCountValue = Math.min(i + batchSize, totalCities); // Ensure count doesn't exceed totalCities
                    setCurrentCount(currentCountValue);

                    //console.log(`Loaded ${currentCountValue} out of ${totalCities} cities`);

                    // Simulate a delay for each batch
                    await new Promise((resolve) => setTimeout(resolve, 200));
                }
                // Finalize loading when both progress and count reach their maximum values
                setLoading(false);
                setCurrentCityName(''); // Clear current city name
                setCurrentCount(totalCities); // Set count to the total number of cities
            } catch (error) {
                console.error('Error loading data:', error);
                setLoading(false);
            }
        };



        loadData();
    }, [mapData.cities]);

    return (
        <>
            <div className="contentSubHead">
                <h3 className="">Cities</h3>
                {loading && (
                    <div>
                        <Alert severity="success" icon={<WarningAmberOutlinedIcon fontSize="inherit" />}>
                            {currentCount === mapData.cities.length ? (
                                <p>
                                    Finalizing loading of city data....
                                </p>
                            ) : (
                                <>
                                    <AlertTitle>Loading City data takes a decent amount of time, Due to size of the data this must be loaded each time.</AlertTitle>
                                    <p>
                                        Loading City: {currentCityName} (City {currentCount} out of {mapData.cities.length})
                                    </p>
                                    <LinearProgress variant="determinate" value={loadingProgress} />
                                </>
                            )}

                        </Alert>
                    </div>
                )}
            </div>
            <div className="contentSubBody">
                <Grid container spacing={2}>
                    {loadedCities.map((entry, index) => (
                        <Grid xs={3} key={index} id={entry._id}>
                            <div className="country-tile">
                                {loading ? (
                                    <Skeleton variant="rectangular" width="100%" height={200} />
                                ) : (
                                    <>
                                        <div className="country-tile-image">
                                            {console.log(JSON.stringify(entry))}
                                            <img
                                                src={
                                                    entry.coa === undefined
                                                        ? 'https://armoria.herokuapp.com/?size=500&format=svg'
                                                        : `https://armoria.herokuapp.com/?coa=${JSON.stringify(
                                                            entry.coa
                                                        )}`
                                                }
                                                loading="lazy"
                                                alt={"Coat of Arms for " + entry.name}
                                            />
                                        </div>
                                        <div className="country-tile-content">
                                            <h2 className="country-tile-title">{entry.name}</h2>
                                            <LinesEllipsis
                                                text={entry.description}
                                                maxLine="3"
                                                ellipsis="..."
                                                trimRight
                                                basedOn="letters"
                                                id={`entry.id-${entry._id}`}
                                                className="post-text"
                                            />
                                            <div className="country-tile-info">
                                                <span className="country-tile-category">
                                                    Tags:
                                                    <br />
                                                    {entry.tags.map((tag, index) => (
                                                        <Chip size="small" key={index} label={tag.Name} />
                                                    ))}
                                                </span>
                                                <button className="country-tile-button">Read More</button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </Grid>
                    ))}
                </Grid>
            </div>
        </>
    );
};

export default Cities;
