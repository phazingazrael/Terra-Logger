import * as React from 'react'
import { useState, useEffect } from 'react'
import { nanoid } from 'nanoid'
import { LoremIpsum } from 'lorem-ipsum'
import { useOutletContext, useNavigate } from 'react-router-dom'

import './upload.css'
import { Alert, AlertTitle, Stack } from '@mui/material'

const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4
  },
  wordsPerSentence: {
    max: 16,
    min: 4
  }
})

const TL_Map = {
  cities: [],
  countries: [],
  cultures: [],
  info: {},
  nameBases: [],
  notes: [],
  provinces: [],
  religions: [],
  settings: {}
}

const UploadForm = () => {
  const navigate = useNavigate()
  const [mapData, setMap] = useOutletContext()
  const [loading, setLoading] = useState(false)

  const OLDEST_SUPPORTED_VERSION = '1.95.05'
  const currentVersion = '1.95.05'

  const RawMap = []

  const readMAP = (e) => {
    const file = e.target.files[0]

    const fileReader = new FileReader()

    fileReader.onload = function (e) {
      const lines = e.target.result.split('\n')

      let isInsideSVG = false
      let svgContent = ''

      for (const line of lines) {
        if (isInsideSVG) {
          // Continue collecting lines until the closing </svg> tag is found
          svgContent += line + '\n'

          if (line.includes('</svg>')) {
            isInsideSVG = false
            handleSVG(svgContent)
          }
        } else if (line.startsWith('{')) {
          // JSON object
          handleJSON(JSON.parse(line))
        } else if (line.startsWith('[')) {
          // JSON array
          handleJSONArray(JSON.parse(line))
        } else if (line.startsWith('<svg')) {
          // SVG
          isInsideSVG = true
          svgContent = line + '\n'
        } else if (line.includes('|')) {
          // Pipe Separated Values
          const values = line.split('|')
          handlePSV(values)
        } else if (line.includes('Ruler:')) {
          // Ruler line
          handleRuler(line)
        } else if (line.includes(',')) {
          // CSV (Comma Separated Values)
          const values = line.split(',')
          handleCSV(values)
        }
      }
      localStorage.setItem('TL_MAP_RAW', JSON.stringify(RawMap))
      parseMap(RawMap)
    }
    fileReader.onloadend = function (e) {
      const Countries = JSON.parse(localStorage.getItem('TL_Map.countries'))
      const Cities = JSON.parse(localStorage.getItem('TL_Map.cities'))
      const Religions = JSON.parse(localStorage.getItem('TL_Map.religions'))

      const countries = [...Countries]
      const cities = [...Cities]
      const religions = [...Religions]

      // Loop through each country
      countries.forEach(country => {
        const matchingCities = []
        // Find cities that match the current country's id
        const countryCities = cities.filter(city => city.country.id === country.id)

        // Add the matching cities to the result array
        matchingCities.push(...countryCities)

        matchingCities.forEach(city => {
          country.cities.push(city._id)
          city.country._id = country._id
        })
      })
      localStorage.setItem('TL_Map.countries', JSON.stringify(countries))
      localStorage.setItem('TL_Map.cities', JSON.stringify(cities))

      // console.log(TL_Map);
      localStorage.setItem('TL_Map', JSON.stringify(TL_Map))
      setMap(TL_Map)
      navigate('/settings')
    }

    fileReader.readAsText(file)
  }

  function parseMap (data) {
    const cities = data[15].ARR
    const countries = data[14].ARR
    const provinces = data[30].ARR
    const religions = data[29].ARR
    const cultures = data[13].ARR
    const nameBases = data[31].PSV
    TL_Map.nameBases = fixNameBases(nameBases)
    localStorage.setItem('TL_Map.nameBases', JSON.stringify(TL_Map.nameBases))

    // parse info Object.
    void (function parseInfo () {
      const inf = data[0].PSV
      TL_Map.info = {
        version: inf[0],
        description: "An exported .map file from Azgaar's Fantasy Map Generator.",
        exportedAt: inf[2],
        seed: inf[3],
        mapId: inf[6],
        graphHeight: inf[4],
        graphWidth: inf[5]
      }
    })()

    // parse settings Object.
    void (function parseSettings () {
      const sett = data[1].PSV
      TL_Map.settings = {
        distanceUnit: sett[0],
        distanceScale: sett[1],
        areaUnit: sett[2],
        heightUnit: sett[3],
        heightExponent: sett[4],
        temperatureScale: sett[5],
        barSize: sett[6],
        barLabel: sett[7] || '',
        barBackOpacity: sett[8],
        barBackColor: sett[9],
        barPosX: sett[10],
        barPosY: sett[11],
        populationRate: sett[12],
        urbanization: sett[13],
        mapSize: sett[14],
        latitudeO: sett[15],
        prec: sett[18],
        options: JSON.parse(sett[19]),
        mapName: sett[20],
        hideLabels: sett[21],
        stylePreset: sett[22],
        rescaleLabels: sett[23],
        urbanDensity: sett[24]
      }
      TL_Map.info.mapName = sett[20]
      localStorage.setItem('TL_Map.info', JSON.stringify(TL_Map.info))
      localStorage.setItem('TL_Map.settings', JSON.stringify(TL_Map.settings))
    })()

    void (function parseSettings () {
      // TL_Map.mapCoordinates = data[2].OBJ;
    })()

    void (function parseNotes () {
      TL_Map.notes = data[4].ARR
      localStorage.setItem('TL_Map.notes', JSON.stringify(TL_Map.notes))
    })()

    void (function parseSVG () {
      function addSpaceAfterFourCharacters (inputString) {
        if (inputString.length > 4) {
          return inputString.substring(0, 4) + ' ' + inputString.substring(4)
        } else {
          return inputString
        }
      }
      TL_Map.SVG = addSpaceAfterFourCharacters(data[5].SVG)

      localStorage.setItem('TL_Map.SVG', JSON.stringify(TL_Map.SVG))
    })()

    void (function parseCultures () {
      cultures.map((Culture) => {
        const culObj = {
          urbanPop: '',
          ruralPop: '',
          tags: []
        }

        const urbanvalue = Math.round(
          Culture.urban * TL_Map.settings.populationRate * TL_Map.settings.urbanization
        ).toLocaleString('en-US')

        const ruralvalue = Math.round(
          Culture.rural * TL_Map.settings.populationRate
        ).toLocaleString('en-US')

        culObj.urbanPop = urbanvalue
        culObj.ruralPop = ruralvalue
        culObj.name = Culture.name
        culObj.base = Culture.base
        culObj.shield = Culture.shield
        culObj.id = Culture.i.toString()
        culObj.color = Culture.color
        culObj.type = Culture.type
        culObj.expansionism = Culture.expansionism
        culObj.origins = Culture.origins
        culObj.code = Culture.code
        culObj.urban = Culture.urban
        culObj.rural = Culture.rural
        culObj.area = Culture.area
        culObj.cells = Culture.cells
        culObj._id = nanoid()
        culObj.tags.push({
          _id: '3za6JbQcWqraNj0guhnqk',
          Name: 'Culture',
          Type: 'WorldOverview',
          Description: "The customs, arts, social institutions, and achievements of the world's inhabitants."
        })

        TL_Map.cultures.push(culObj)
      })
      localStorage.setItem('TL_Map.cultures', JSON.stringify(TL_Map.cultures))
    })()

    void (function parseCountries () {
      const countryArray = countries.filter((value) => Object.keys(value).length !== 0)
      countryArray.map((Country) => {
        const countryObj = {
          _id: '',
          cities: [],
          coa: {},
          color: '',
          culture: '',
          description: '',
          fullName: '',
          id: '',
          name: '',
          political: {
            diplomacy: [],
            form: '',
            formName: '',
            military: [],
            neighbors: [],
            ruler: '',
            leaders: []
          },
          population: {
            rural: '',
            total: '',
            urban: ''
          },
          tags: [],
          type: '',
          warCampaigns: []
        }

        countryObj.name = Country.name || ''
        countryObj.fullName = Country.fullName || Country.name
        countryObj.warCampaigns = Country.campaigns || ''
        countryObj.color = Country.color || '#231e39'
        countryObj.political.form = Country.form || ''
        countryObj.political.formName = Country.formName || ''
        countryObj.id = Country.i.toString() || 0
        countryObj._id = nanoid()
        countryObj.coa = Country.coa || undefined
        countryObj.political.military = Country.military || ''

        countryObj.description = lorem.generateParagraphs(2)

        countryObj.tags.push({
          _id: 'TJaHO2uqBFZcoXWIfc5hJ',
          Name: 'Country',
          Type: 'Locations',
          Description: 'A distinct and sovereign nation within the world, often with defined borders.'
        })

        Country.Settlement = 'Country'
        countryObj.type = Country.Settlement

        Country.diplomacy.map((Diplomat, index) => {
          if (Diplomat === 'Suspicion') {
            Diplomat = 'Suspicious'
          }

          const dipObj = {
            name: countries[index].fullName || countries[index].name,
            status: Diplomat
          }
          countryObj.political.diplomacy.push(dipObj)
        })

        Country.neighbors.map((neighbor, index) => {
          const nObj = {
            name: countries[neighbor].fullName || countries[neighbor].name
          }
          countryObj.political.neighbors.push(nObj)
        })

        countryObj.political.diplomacy.sort((a, b) => a.name.localeCompare(b.name))

        if (cultures[Country.culture] === undefined) {
          cultures[Country.culture] = 0
        }

        countryObj.culture = cultures[Country.culture].name || ''

        const urbanvalue = Math.round(
          Country.urban * TL_Map.settings.populationRate * TL_Map.settings.urbanization
        )
        countryObj.population.urban = urbanvalue.toLocaleString('en-US') || ''
        Country.urbanPop = urbanvalue.toLocaleString('en-US')

        const ruralvalue = Math.round(Country.rural * TL_Map.settings.populationRate)

        Country.ruralPop = ruralvalue.toLocaleString('en-US')
        countryObj.population.rural = ruralvalue.toLocaleString('en-US') || ''

        Country.populationout = Math.round(ruralvalue + urbanvalue)
        Country.populationout = Country.populationout.toLocaleString('en-US')
        countryObj.population.total = Country.populationout || ''

        TL_Map.countries.push(countryObj)
        // mapData.Locations.countries.push(countryObj);
      })
      localStorage.setItem('TL_Map.countries', JSON.stringify(TL_Map.countries))
    })()

    void (function parseCities () {
      const cityArray = cities.filter((value) => Object.keys(value).length !== 0)
      cityArray.map((City) => {
        const cityObj = {
          _id: '',
          capital: null,
          coa: {},
          country: {},
          culture: null,
          features: [],
          id: null,
          isCapital: null,
          mapLink: null,
          name: null,
          population: null,
          size: null,
          tags: [{
            _id: '1IZunX27kOFP-ff4kpeLQ',
            Name: 'City',
            Type: 'Locations',
            Description: 'A large and permanent human settlement within the world.'
          }],
          type: null
        }

        cityObj.name = City.name
        cityObj.id = City.i.toString()
        cityObj._id = nanoid()
        cityObj.description = '' || lorem.generateParagraphs(2)

        const cityState = City.state
        const country = TL_Map.countries[cityState]
        cityObj.country = {
          name: country.name || '',
          nameFull: country.fullName || '',
          govForm: country.political.form || '',
          govName: country.political.formName || '',
          id: country.id,
          _id: country._id || ''
        }

        if (City.capital === true) {
          cityObj.capital = 'Yes'
          cityObj.isCapital = true
          cityObj.features.push('Capital')
          cityObj.tags.push({
            _id: '77eqKucwMaNXbgw_v-810',
            Name: 'Capital',
            Type: 'Maps',
            Description: 'The primary city or town serving as the seat of government and administrative center.'
          })
        } else {
          cityObj.capital = 'No'
          cityObj.isCapital = false
        }
        if (City.citadel === 1) {
          cityObj.features.push('Citadel')
          cityObj.tags.push({
            _id: 'lTnDEGrVvLDS2feESzZPV',
            Name: 'Citadel',
            Type: 'Maps',
            Description: 'A fortress, typically on high ground, protecting or dominating a city.'
          })
        }
        if (City.port === 1) {
          cityObj.features.push('Port')
          cityObj.tags.push({
            _id: '3OVpUylcH9JCUZMSX9nK4',
            Name: 'Port',
            Type: 'Maps',
            Description: 'Locations designated for harboring and facilitating the arrival, departure, and storage of ships and vessels. Ports are key points of trade, transportation, and naval activities within the world, often situated along coastlines or major waterways.'
          })
        }
        if (City.plaza === 1) {
          cityObj.features.push('Plaza')
          cityObj.tags.push({
            _id: '4CoOX8cSxMIjSBOzlcWzT',
            Name: 'Plaza',
            Type: 'Maps',
            Description: 'An open public square, especially in a city or town.'
          })
        }
        if (City.walls === 1) {
          cityObj.features.push('Walls')
          cityObj.tags.push({
            _id: '7SfAGH2dfmCZVsaU8JNbt',
            Name: 'Walls',
            Type: 'Maps',
            Description: 'Defensive barriers or fortifications enclosing a city or settlement.'
          })
        }
        if (City.shanty === 1) {
          cityObj.features.push('Shanty Town')
          cityObj.tags.push({
            _id: 'tgFP5-2syOFdgXGQS11hB',
            Name: 'Shanty Town',
            Type: 'Maps',
            Description: 'A deprived area on the outskirts of a town consisting of makeshift dwellings.'
          })
        }
        if (City.temple === 1) {
          cityObj.features.push('Temple')
          cityObj.tags.push({
            _id: 'FeS5jSkiM7N6-yhVccuwZ',
            Name: 'Temple',
            Type: 'Maps',
            Description: 'A building dedicated to the worship of deities or a place of religious practices.'
          })
        }

        cityObj.features.sort((a, b) => a.localeCompare(b))

        cityObj.culture = cultures[City.culture].name

        cityObj.coa = City.coa || undefined

        if (City.link !== undefined) {
          cityObj.mapLink = City.link
        }

        const populationvalue = Math.round(
          City.population * TL_Map.settings.populationRate * TL_Map.settings.urbanization
        )

        cityObj.population = populationvalue.toLocaleString('en-US')

        if (populationvalue < 21) {
          cityObj.size = 'Thorp'
        } else if ((populationvalue > 21, populationvalue < 60)) {
          cityObj.size = 'Hamlet'
        } else if ((populationvalue > 61, populationvalue < 200)) {
          cityObj.size = 'Village'
        } else if ((populationvalue > 201, populationvalue < 2000)) {
          cityObj.size = 'Small Town'
        } else if ((populationvalue > 2001, populationvalue < 5000)) {
          cityObj.size = 'Large Town'
        } else if ((populationvalue > 5001, populationvalue < 10000)) {
          cityObj.size = 'Small City'
        } else if ((populationvalue > 10001, populationvalue < 25000)) {
          cityObj.size = 'Large City'
        } else if (populationvalue > 25000) {
          cityObj.size = 'Metropolis'
        }
        cityObj.type = 'City - ' + cityObj.size

        TL_Map.cities.push(cityObj)
      })
      localStorage.setItem('TL_Map.cities', JSON.stringify(TL_Map.cities))
    })()

    void (function parseReligions () {
      religions.map((Religion) => {
        // console.log(Religion)
        const urbanvalue = Math.round(
          Religion.urban * TL_Map.settings.populationRate * TL_Map.settings.urbanization
        ).toLocaleString('en-US')
        Religion.urbanPop = urbanvalue

        const ruralvalue = Math.round(
          Religion.rural * TL_Map.settings.populationRate
        ).toLocaleString('en-US')
        Religion.ruralPop = ruralvalue

        const religObj = {
          i: Religion.i.toString() || '',
          name: Religion.name || '',
          culture: Religion.culture || '',
          type: Religion.type || '',
          form: Religion.form || '',
          deity: Religion.deity || '',
          origins: Religion.origins || '',
          code: Religion.code || ''
        }
        // console.log(religObj)
        TL_Map.religions.push(religObj)
      })
      localStorage.setItem('TL_Map.religions', JSON.stringify(TL_Map.religions))
    })()
  }

  function minifySVG (svgCode) {
    // Remove comments
    svgCode = svgCode.replace(/<!--[\s\S]*?-->/g, '')

    // Remove newline characters and extra whitespaces
    svgCode = svgCode.replace(/\s+/g, ' ').trim()

    // Collapse the path data
    svgCode = svgCode.replace(/(\s?[a-zA-Z])\s+/g, '$1')

    return svgCode
  }

  function handleJSON (data) {
    // Your logic to handle JSON object

    const jsonObj = { OBJ: data }
    RawMap.push(jsonObj)
  }

  function handleJSONArray (data) {
    // Your logic to handle JSON array
    const jsonARR = { ARR: data }
    RawMap.push(jsonARR)
  }

  function handleSVG (content) {
    // Your logic to handle SVG content
    const svgObj = { SVG: content }
    RawMap.push(svgObj)
  }

  function handlePSV (values) {
    // Replace empty values with null
    const processedData = values.map(value => value.trim() === '' ? null : value)

    // Your logic to handle Pipe Separated Values without headers
    const psvObj = { PSV: processedData }
    RawMap.push(psvObj)
  }

  function handleCSV (values) {
    // Your logic to handle CSV (Comma Separated Values)
    const csvObj = { CSV: values }
    RawMap.push(csvObj)
  }

  function handleRuler (line) {
    const rulerValues = line.match(/\d+/g)
    if (rulerValues && rulerValues.length === 4) {
      const rulerObject = {
        Ruler: {
          start: { x: Number(rulerValues[0]), y: Number(rulerValues[1]) },
          end: { x: Number(rulerValues[2]), y: Number(rulerValues[3]) }
        }
      }

      RawMap.push(rulerObject)
    } else {
      console.log('Invalid Ruler Line:', line)
    }
  }

  function fixNameBases (data) {
    const resultArray = []
    let currentLanguage = null

    for (const item of data) {
      if (item && item.startsWith && item.startsWith('/')) {
        currentLanguage = item.substring(1)
        resultArray.push({ [currentLanguage]: [] })
      } else if (currentLanguage) {
        resultArray[resultArray.length - 1][currentLanguage].push(item)
      }
    }

    return resultArray
  }

  useEffect(() => {

  }, [loading, setLoading])

  return (
    <div className='uploadForm'>
      <div>
        <div className='custom-card' data-v0-t='card'>
          <div className='card-header'>
            <h5 className='card-title'>
              Uh Oh, Looks like there isn&apos;t anything loaded, Want to load an exported map file?
            </h5>
          </div>
          <div>
            <div className='file-grid'>
              <div className='file-input'>
                <Stack sx={{ width: '100%' }} spacing={2}>
                  <Alert severity='success' className='UploadBox'>
                      <AlertTitle>Upload your .map File</AlertTitle>
                      <label htmlFor='map-file-upload'>Select a MAP file</label>
                      <input
                        type='file'
                        name='map-file-upload'
                        id='map-file-upload'
                        accept='.map'
                        onChange={readMAP}
                      />
                    </Alert>
                  <Alert severity='info'>
                      <p>
                        Please note, This will only work with maps exported from versions of Azgaar&apos;s Fantasy Map Generator V{OLDEST_SUPPORTED_VERSION} and Newer.
                        <br />
                        The current maximum version supported by this program is V{currentVersion}.
                      </p>
                    </Alert>
                </Stack>
              </div>
              <div className='file-input'>
                <Alert severity='info'>
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

    </div>
  )
}

export default UploadForm
