import { useOutletContext } from 'react-router-dom'
import { Container } from '@mui/material'

const Root = () => {
  const [mapData, setMap, appInfo] = useOutletContext()

  return (
    <Container>
      <div className='contentSubHead'>
        <h3>Welcome to Terra-Logger!</h3>
      </div>
      <div className='contentSubBody'>
        <p>
          Terra-Logger is a powerful tool designed to simplify the process of organizing
          and managing data from Azgaar&#39;s Fantasy Map Generator. With Terra-Logger,
          you can streamline your world-building project by effortlessly converting
          exported JSON files into meticulously organized Markdown files.
        </p>
        <h4>Currently compatable with version {appInfo.application.afmgVer} of Azgaar&#39;s Fantasy Map Generator</h4>
        <h2>What Terra-Logger Offers:</h2>
        <ul>
          <li>
            <strong>Structured Organization:</strong> Automatically generate individual
            Markdown files for each city, province, country, religious detail, and more.
          </li>
          <li>
            <strong>Customization:</strong> Edit and customize information before
            exporting, ensuring your documentation suits your unique needs.
          </li>
          <li>
            <strong>Visual Enhancement:</strong> Automatically include relevant emblems
            or coat of arms as SVG files to enrich your world-building documentation.
          </li>
          <li>
            <strong>Ease of Use:</strong> A user-friendly interface for a seamless
            experience.
          </li>
        </ul>
        <h2>Get Started</h2>
        <p>To get started with Terra-Logger:</p>
        <ol>
          <li>Export a JSON file from Azgaar&#39;s Fantasy Map Generator.</li>
          <li>Launch Terra-Logger.</li>
          <li>Import the exported JSON file.</li>
          <li>Customize your data.</li>
          <li>Export organized Markdown files for each location and detail.</li>
        </ol>
      </div>
    </Container>
  )
}

export default Root
