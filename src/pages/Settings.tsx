import { Container} from '@mui/material'
import { IconContext } from 'react-icons'
// import UploadForm from '../components/UploadForm.tsx';

interface SettingsProperties {
    name: string;
    private?: boolean;
    version: string;
    description: string;
    descriptionFull?: string;
    author?: {
        name: string;
        email: string;
    };
    type?: string;
    license: string;
    scripts?: {
        dev: string;
        build: string;
        lint: string;
        preview: string;
        licenses: string;
        changelog: string;
    };
}

const Settings = (props: SettingsProperties) => {
    const { name, private: isPrivate, version, description, descriptionFull, author, type, license, scripts } = props;
    console.log({ name, private: isPrivate, version, description, descriptionFull, author, type, license, scripts })

    const styles = {
      section: {
        backgroundColor: '#fff',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '24px',
      },
      subSection: {
        backgroundColor: '#fff',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '24px',
      },
      checkboxContainer: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '16px',
      },
      checkbox: {
        width: '20px',
        height: '20px',
        marginRight: '8px',
      },
      select: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        marginBottom: '16px',
      },
      input: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
      },
    };



    return (
      <Container className="Settings">
        <IconContext.Provider value={{ size: '1.5rem' }}>
          <h3>
            Settings
          </h3>
          <div className='contentSubBody'>


            {/* {appInfo && appInfo.mapInfo.name.length > 0
              ? (
                <div style={styles.section}>
                  <h4>Map Settings</h4>
                  <Button variant="contained" color="error" onClick={() => {
                    handleClear()
                  }}><TiTrash />Delete Map</Button>
                </div>
              )
              : ( */}
                <div style={styles.section}>
                  <h4>Map Settings</h4>
                  <p>You need to load a map to use these settings.</p>
                  {/* <UploadForm /> */}
                </div>
               {/* )} */}

            <div style={styles.section}>
              <h4>General & Appearance Settings</h4>
              <div>
                <label>Theme</label>
                <select style={styles.select}>
                  <option>Light</option>
                  <option>Dark</option>
                </select>
              </div>
              <div>
                <label>Language</label>
                <select style={styles.select}>
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
              <div style={styles.checkboxContainer}>
                <input type="checkbox" style={styles.checkbox} />
                <label>Show Dark Mode Toggle</label>
              </div>
              <div style={styles.checkboxContainer}>
                <input type="checkbox" style={styles.checkbox} />
                <label>Show Language Selector</label>
              </div>
            </div>

            <div style={styles.section}>
              <h4>Data Settings</h4>
              <div style={styles.checkboxContainer}>
                <input type="checkbox" style={styles.checkbox} />
                <label>Enable Data Sync</label>
              </div>
              <div style={styles.checkboxContainer}>
                <input type="checkbox" style={styles.checkbox} />
                <label>Show Data Backup Options</label>
              </div>
              <div style={styles.checkboxContainer}>
                <input type="checkbox" style={styles.checkbox} />
                <label>Enable Data Importing</label>
              </div>
              <div style={styles.checkboxContainer}>
                <input type="checkbox" style={styles.checkbox} />
                <label>Enable Data Exporting</label>
              </div>
            </div>

            <div style={styles.section}>
              <h4>Advanced Settings</h4>
              <div style={styles.checkboxContainer}>
                <input type="checkbox" style={styles.checkbox} />
                <label>Enable Advanced Features</label>
              </div>
              <div style={styles.checkboxContainer}>
                <input type="checkbox" style={styles.checkbox} />
                <label>Show Developer Options</label>
              </div>
            </div>

            <div style={styles.section}>
              <h4>Accessibility Settings</h4>
              <div style={styles.checkboxContainer}>
                <input type="checkbox" style={styles.checkbox} />
                <label>Enable Screen Reader Support</label>
              </div>
              <div style={styles.checkboxContainer}>
                <input type="checkbox" style={styles.checkbox} />
                <label>High Contrast Mode</label>
              </div>
            </div>

            <div style={styles.section}>
              <h4>Display Settings</h4>
              <div style={styles.checkboxContainer}>
                <input type="checkbox" style={styles.checkbox} />
                <label>Show Grid Lines</label>
              </div>
              <div style={styles.checkboxContainer}>
                <input type="checkbox" style={styles.checkbox} />
                <label>Show Rulers</label>
              </div>
            </div>
          </div>
        </IconContext.Provider>
      </Container>
    )
  }

  export default Settings
