/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable no-console */
import { Alert, AlertTitle, Stack } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';

import ShowMessageDialog from '../ShowMessageDialog/ShowMessageDialog.tsx';
import mutateData from './Mutate.tsx';
import { parseLoadedData, parseLoadedResult } from './Parse.tsx';

import appAtom from '../../atoms/app.tsx';
import mapAtom from '../../atoms/map.tsx';

import './UploadMap.css';

function UploadMap() {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [map, setMap] = useRecoilState(mapAtom);
  const [app] = useRecoilState(appAtom);
  /* eslint-enable @typescript-eslint/no-unused-vars */

  const navigate = useNavigate();

  const OLDEST_SUPPORTED_VERSION = 1.95;
  const afmgMin = '1.95';
  const currentVersion = parseFloat(app.application.afmgVer);

  const navigateToMain = () => {
    console.log('Navigating to main');
    navigate('/', { replace: true });
  };

  function processLoadedData(mapFile: string[], mapVersion: number) {
    const isInvalid = !mapFile || Number.isNaN(mapVersion) || mapFile?.length < 26 || !mapFile?.[5];
    const isUpdated = Number(mapVersion) === currentVersion;
    const isAncient = mapVersion < OLDEST_SUPPORTED_VERSION;
    const isNewer = mapVersion > currentVersion;
    const isOutdated = mapVersion < currentVersion;

    return {
      isUpdated,
      isNewer,
      isInvalid,
      isAncient,
      isOutdated,
    };
  }

  function handleLoadedData(
    isUpdated: boolean,
    isNewer: boolean,
    isInvalid: boolean,
    isAncient: boolean,
    isOutdated: boolean,
    mapVersion: number,
    mapFile: string[],
  ) {
    if (isUpdated) {
      console.log('updated');
      const parsedMap = parseLoadedData(mapFile);
      saveMapData(parsedMap);
      // need to redirect to the main page '/'
      navigateToMain();
    }
    if (isNewer) {
      console.log('newer');
      const parsedMap = parseLoadedData(mapFile);
      saveMapData(parsedMap);
      ShowMessageDialog({
        open: true,
        handleClose: () => {},
        handleConfirm: () => {},
        message: `The map version you are trying to load (${mapVersion}) is newer than the current version.\nPlease load the file in the appropriate version`,
        title: 'Newer file',
      });
    }
    if (isInvalid) {
      console.log('invalid');
      return ShowMessageDialog({
        open: true,
        handleClose: () => {},
        handleConfirm: () => {},
        message: 'The file does not look like a valid save file.\nPlease check the data format',
        title: 'Invalid file',
      });
    }
    if (isAncient) {
      console.log('ancient');
      return ShowMessageDialog({
        open: true,
        handleClose: () => {},
        handleConfirm: () => {},
        message: `The map version you are trying to load (${mapVersion}) is too old and cannot be updated to the current version.`,
        title: 'Ancient file',
      });
    }
    if (isOutdated) {
      console.log('outdated');
      return ShowMessageDialog({
        open: true,
        handleClose: () => {},
        handleConfirm: () => {},
        message: `The map version (${mapVersion}) does not match the Generator version (${currentVersion}).\nThat is fine, however, as data still is able to be loaded without issue.`,
        title: 'Outdated file',
      });
    }
    return null;
  }

  function saveMapData(data: MapInfo) {
    let mapData = mutateData(data as unknown as MapInfo);
    mapData = JSON.parse(JSON.stringify(mapData));
    setMap(mapData as unknown as TLMapInfo);
    console.log(mapData);
  }

  const readMAP = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      const fileReader = new FileReader();

      fileReader.onloadend = function onLoadEnd(event) {
        if (event.target) {
          const { result } = event.target;
          if (result instanceof ArrayBuffer) {
            const [mapFile, mapVersion] = parseLoadedResult(result);
            const { isUpdated, isNewer, isInvalid, isAncient, isOutdated } = processLoadedData(
              mapFile,
              mapVersion,
            );
            handleLoadedData(
              isUpdated,
              isNewer,
              isInvalid,
              isAncient,
              isOutdated,
              mapVersion,
              mapFile,
            );
          }
        }
      };

      fileReader.readAsArrayBuffer(file);
    }
  };

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
                <Stack sx={{ width: '100%' }} spacing={2}>
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
                      Please note, This will only work with maps exported from versions of
                      Azgaar&apos;s Fantasy Map Generator V{afmgMin}
                      &nbsp; and Newer.
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
                    This is a very good question, One of the main reasons to use the map file
                    instead of an exported json file is that the map file itself contains a copy of
                    what your map looked like at the time of save.
                  </p>
                  <h4>Why does this matter?</h4>
                  <p>
                    In honesty, It really does not have any effect on how things would be handled
                    but it will make it so that your map is shown in the background of the program
                    as well as exporting an svg copy of the map when you export the rest of the
                    files as well.
                  </p>
                </Alert>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="alert" style={{ display: 'none' }} className="custom-alert">
        <p id="alertMessage">Warning!</p>
      </div>
    </div>
  );
}

export default UploadMap;
