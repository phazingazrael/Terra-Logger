import { Alert, AlertTitle, Stack } from '@mui/material';
import React, { Dispatch, SetStateAction } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AppInfo } from '../../definitions/AppInfo';
import { MapInfo } from '../../definitions/MapInfo';
import ShowMessageDialog from '../ShowMessageDialog/ShowMessageDialog';

import { parseLoadedData, parseLoadedResult } from './Parse';

import { useNavigate } from 'react-router-dom';

import './UploadMap.css';

function UploadMap() {
  const [, setMapInfo, appInfo] =
    useOutletContext<
      [
        MapInfo,
        Dispatch<SetStateAction<MapInfo | undefined>>,
        AppInfo,
        Dispatch<SetStateAction<AppInfo | undefined>>
      ]
    >();

  const navigate = useNavigate();

  const navigateToMain = () => {
    console.log('Navigating to main');
    navigate('/', { replace: true });
  };

  const OLDEST_SUPPORTED_VERSION = 1.95;
  const afmgMin = '1.95';
  const currentVersion = parseFloat(appInfo.application.afmgVer);

  const readMAP = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      const fileReader = new FileReader();

      fileReader.onloadend = function (e) {
        if (e.target) {
          const result = e.target.result;
          // version logic here: check if version is supported
          // if not supported, throw error
          // if supported, load the map
          // if error, display error
          // needs to be implemented
          if (result instanceof ArrayBuffer) {
            const [mapFile, mapVersion] = parseLoadedResult(result);
            const isInvalid =
              !mapFile ||
              mapVersion === null ||
              isNaN(mapVersion) ||
              mapFile.length < 26 ||
              !mapFile[5];
            const isUpdated = mapVersion == currentVersion;
            const isAncient = mapVersion < OLDEST_SUPPORTED_VERSION;
            const isNewer = mapVersion > currentVersion;
            const isOutdated = mapVersion < currentVersion;

            if (isUpdated) {
              console.log('updated');
              // setLoading(true);
              parseLoadedData(mapFile);
              // need to redirect to the main page '/'
              navigateToMain();
            }
            if (isInvalid) {
              console.log('invalid');
              return ShowMessageDialog({
                open: true,
                handleClose: () => {},
                handleConfirm: () => {},
                message:
                  'The file does not look like a valid save file.\nPlease check the data format',
                title: 'Invalid file'
              });
            }
            if (isAncient) {
              console.log('ancient');
              return ShowMessageDialog({
                open: true,
                handleClose: () => {},
                handleConfirm: () => {},
                message: `The map version you are trying to load (${mapVersion}) is too old and cannot be updated to the current version.`,
                title: 'Ancient file'
              });
            }
            if (isNewer) {
              console.log('newer');
              const parsedMap = parseLoadedData(mapFile);
              console.log('parsed map?');
              console.log(parsedMap);
              ShowMessageDialog({
                open: true,
                handleClose: () => {},
                handleConfirm: () => {},
                message: `The map version you are trying to load (${mapVersion}) is newer than the current version.\nPlease load the file in the appropriate version`,
                title: 'Newer file'
              });
            }
            if (isOutdated) {
              console.log('outdated');
              return ShowMessageDialog({
                open: true,
                handleClose: () => {},
                handleConfirm: () => {},
                message: `The map version (${mapVersion}) does not match the Generator version (${currentVersion}).\nThat is fine, however, as data still is able to be loaded without issue.`,
                title: 'Outdated file'
              });
            }
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
                      Azgaar&apos;s Fantasy Map Generator V{afmgMin} and Newer.
                      <br />
                      The current maximum version supported by this program is V{/*currentVersion*/}
                      .
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
