import * as React from 'react';
import { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { LoremIpsum } from "lorem-ipsum";
import { useOutletContext } from "react-router-dom";

import { ShowMessageDialog } from '../showDialog';


import { parseLoadedResult, uncompress, parseLoadedData } from '../afmg/index'

import './upload.css';
import { Alert, AlertTitle, Stack } from '@mui/material';




const lorem = new LoremIpsum({
    sentencesPerParagraph: {
        max: 8,
        min: 4
    },
    wordsPerSentence: {
        max: 16,
        min: 4
    }
});

let rawMap = {
    "biomesData": {},
    "cities": [],
    "countries": [],
    "grid": {},
    "info": {},
    "mapCoordinates": {},
    "nameBases": [],
    "notes": [],
    "pack": {},
    "religions": [],
    "settings": {},
    "SVG": null
}


const UploadForm = () => {
    const [mapData, setMap, appInfo] = useOutletContext();
    //const [loading, setLoading] = useState(true);

    const OLDEST_SUPPORTED_VERSION = 0.7;
    const afmgMin = "1.95";
    const currentVersion = parseFloat(appInfo.application.afmgVer);
    //console.log(currentVersion)

    const readMAP = (e) => {

        const file = e.target.files[0];

        const fileReader = new FileReader();

        fileReader.onload = async function (e) {



        };
        fileReader.onloadend = async function (e) {
            const result = e.target.result;

            const [mapFile, mapVersion] = await parseLoadedResult(result);

            const isInvalid = !mapFile || isNaN(mapVersion) || mapFile.length < 26 || !mapFile[5];
            const isUpdated = mapVersion == currentVersion;
            const isAncient = mapVersion < OLDEST_SUPPORTED_VERSION;
            const isNewer = mapVersion > currentVersion;
            const isOutdated = mapVersion < currentVersion;


            if (isUpdated) {
                //setLoading(true);
                return setMap(parseLoadedData(mapFile, appInfo))
            }
            if (isInvalid) return (
                ShowMessageDialog({
                    open: true,
                    handleClose: () => { },
                    handleConfirm: () => { },
                    message: "The file does not look like a valid save file.\nPlease check the data format",
                    title: "Invalid file"
                })
            );
            if (isAncient) return (
                ShowMessageDialog({
                    open: true,
                    handleClose: () => { },
                    handleConfirm: () => { },
                    message: `The map version you are trying to load (${mapVersion}) is too old and cannot be updated to the current version.`,
                    title: "Ancient file"
                })
            );
            if (isNewer) return ShowMessageDialog({
                open: true,
                handleClose: () => { },
                handleConfirm: () => { },
                message: `The map version you are trying to load (${mapVersion}) is newer than the current version.\nPlease load the file in the appropriate version`,
                title: "Newer file"
            });
            if (isOutdated) return ShowMessageDialog({
                open: true,
                handleClose: () => { },
                handleConfirm: () => { },
                message: `The map version (${mapVersion}) does not match the Generator version (${currentVersion}).\nThat is fine, however, as data still is able to be loaded without issue.`,
                title: "Outdated file"
            });
        };

        fileReader.readAsArrayBuffer(file);
    };


    useEffect(() => {

    }, []);

    return (
        <div className="uploadForm">
            <div>
                <div className="custom-card" data-v0-t="card">
                    <div className="card-header">
                        <h5 className="card-title">
                            Uh Oh, Looks like there isn&apos;t anything loaded, Want to load an exported map file?
                        </h5>
                    </div>
                    <div>
                        <div className="file-grid">
                            <div className="file-input">
                                <Stack sx={{ width: "100%" }} spacing={2}>
                                    <Alert severity="success" className="UploadBox">
                                        <AlertTitle>Upload your .map File</AlertTitle>
                                        <label htmlFor="map-file-upload">Select a MAP file</label>
                                        <input
                                            type="file"
                                            name="map-file-upload"
                                            id="map-file-upload"
                                            accept=".map"
                                            onChange={readMAP}
                                        />
                                    </Alert>
                                    <Alert severity="info">
                                        <p>
                                            Please note, This will only work with maps exported from versions of Azgaar&apos;s Fantasy Map Generator V{afmgMin} and Newer.
                                            <br />
                                            The current maximum version supported by this program is V{currentVersion}.
                                        </p>
                                    </Alert>
                                </Stack>
                            </div>
                            <div className="file-input">
                                <Alert severity="info">
                                    <AlertTitle>Why use the .map file instead of exported .json?</AlertTitle>
                                    <p>
                                        This is a very good question, One of the main reasons to use the map file instead of an exported json file is that the map file itself contains a copy of what your map looked like at the time of save.
                                    </p>
                                    <h4>Why does this matter?</h4>
                                    <p>
                                        In honesty, It really does not have any effect on how things would be handled but it will make it so that your map is shown in the background of the program as well as exporting an svg copy of the map when you export the rest of the files as well.
                                    </p>
                                </Alert>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div id="alert" style={{ display: "none" }} className="custom-alert">
                <p id="alertMessage">Warning!</p>
            </div>
        </div>
    );
}

export default UploadForm;
