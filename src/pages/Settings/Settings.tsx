/* eslint-disable jsx-a11y/label-has-associated-control */
import { Button, Checkbox, Container, FormControlLabel, FormGroup } from '@mui/material';
import { useMemo, useState } from 'react';
import { IconContext } from 'react-icons';
import { TiTrash } from 'react-icons/ti';
import { useRecoilState } from 'recoil';

import './Settings.css';
// import SettingsStyles from './Styles.tsx';

import appAtom from '../../atoms/app.tsx';
import mapAtom from '../../atoms/map.tsx';
import UploadMap from '../../components/UploadMap/UploadMap.tsx';

const createEmptyMap = (): MapInfo => ({
  cities: [],
  countries: [],
  cultures: [],
  info: {
    name: '',
    seed: '',
    width: 0,
    height: 0,
    ID: '',
  },
  nameBases: [],
  notes: [],
  npcs: [],
  params: [],
  religions: [],
  settings: {
    mapName: '',
    distanceUnit: '',
    distanceScale: '',
    areaUnit: '',
    heightUnit: '',
    heightExponent: '',
    temperatureScale: '',
    barSize: '',
    barLabel: '',
    barBackOpacity: '',
    barPosX: '',
    barPosY: '',
    populationRate: 0,
    urbanization: '',
    mapSize: '',
    latitude0: '',
    prec: '',
    options: {
      pinNotes: false,
      winds: [],
      temperatureEquator: 0,
      temperatureNorthPole: 0,
      temperatureSouthPole: 0,
      stateLabelsMode: '',
      year: 0,
      era: '',
      eraShort: '',
      militaryTypes: [
        {
          icon: '',
          name: '',
          rural: 0,
          urban: 0,
          crew: 0,
          power: 0,
          type: '',
          separate: 0,
        },
      ],
    },
    hideLabels: 0,
    stylePreset: '',
    rescaleLabels: 0,
    urbanDensity: 0,
  },
  SVG: '',
  svgMod: '',
});

function Settings() {
  const [map, setMap] = useRecoilState(mapAtom);
  const [app, setApp] = useRecoilState(appAtom);
  const { userSettings } = app;
  const [selectAllDefaults, setSelectAllDefaults] = useState(false);
  const [defaults, setDefaults] = useState<Array<string>>([]);

  const defaultExports: Array<string> = [
    'Cities',
    'Countries',
    'Religions',
    'Cultures',
    'NPCs',
    'Governments',
    'Notes',
    'Map SVG',
    'Coat of Arms SVGs',
  ];
  const handleSelectAllDefaults = () => {
    setSelectAllDefaults(!selectAllDefaults);
    setDefaults(selectAllDefaults ? [] : [...defaultExports]);
  };

  const handleSelectDefault = (option: string) => {
    const updatedDefaults = defaults.includes(option)
      ? defaults.filter((item) => item !== option)
      : [...defaults, option];

    setDefaults(updatedDefaults);
  };

  const emptyMap: MapInfo = createEmptyMap();

  const IconStyles = useMemo(() => ({ size: '1.5rem' }), []);

  return (
    <Container className="Settings">
      <IconContext.Provider value={IconStyles}>
        <form>
          <h3>Settings</h3>
          <div className="contentSubBody">
            <div className="section">
              <h4>Map Settings</h4>
              {map.settings.mapName !== '' ? (
                <div>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => {
                      localStorage.removeItem('Terra_Logger_Map');
                      setMap(emptyMap as unknown as TLMapInfo);
                    }}
                  >
                    <TiTrash />
                    Delete Map
                  </Button>
                </div>
              ) : (
                <UploadMap />
              )}
            </div>

            <div className="section">
              <h4>General & Appearance Settings</h4>
              {/* <div>
                <label htmlFor="languageSelect">Language</label>
                <select id="languageSelect" className="select">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
                <div className="checkboxContainer">
                  <input
                    id="showLanguageSelector"
                    type="checkbox"
                    style={checkbox}
                  />
                  <label htmlFor="showLanguageSelector">Show Language Selector</label>
                </div>
              </div> */}
              <div>
                <label htmlFor="themeSelect">Theme</label>
                <select
                  id="themeSelect"
                  className="select"
                  value={userSettings.theme}
                  onChange={(e) =>
                    setApp((prev) => ({
                      ...prev,
                      userSettings: { ...prev.userSettings, theme: e.target.value },
                    }))
                  }
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              {/* <div className="checkboxContainer">
                <input id="darkModeToggle" type="checkbox" style={checkbox} />
                <label htmlFor="darkModeToggle">Show Dark Mode Toggle</label>
              </div> */}
              {/*<div>
                <label htmlFor="fontSizeSelect">Font Size</label>
                <select className="select" id="fontSizeSelect">
                  <option>Small</option>
                  <option>Medium</option>
                  <option>Large</option>
                </select>
              </div>  */}
            </div>

            <div className="section">
              <h4>Display Settings</h4>
              <div className="sectionAlt">
                <label htmlFor="screenSize" style={{ marginRight: '10px' }}>
                  Screen Size
                </label>
                <span id="screenSize">
                  appInfo.userSettings.screen.outerWidth x appInfo.userSettings.screen.outerHeight
                </span>
              </div>
              <div className="checkboxContainer">
                <input id="welcomeMessage" type="checkbox" className="checkbox" />
                <label htmlFor="welcomeMessage">Show Welcome Message?</label>
              </div>
            </div>

            <div className="section">
              <h4>Export Settings</h4>
              <select id="languageSelect" className="select">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
              <div className="checkboxContainer">
                <div className="sectionAlt">
                  <h5>Default Exports</h5>
                  <p>These are the default exports. (not functional currently)</p>
                </div>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox checked={selectAllDefaults} onChange={handleSelectAllDefaults} />
                    }
                    label="Select All Defaults"
                  />
                  {defaultExports.map((option) => (
                    <FormControlLabel
                      key={option}
                      control={
                        <Checkbox
                          checked={defaults.includes(option)}
                          onChange={() => handleSelectDefault(option)}
                        />
                      }
                      label={option}
                    />
                  ))}
                </FormGroup>
              </div>
            </div>
          </div>
        </form>
      </IconContext.Provider>
    </Container>
  );
}

export default Settings;
