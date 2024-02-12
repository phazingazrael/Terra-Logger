import { app, BrowserWindow } from 'electron'
import * as path from 'path'

import Package from '../../package.json'

import global from '../renderer/global'
import { createServer } from 'http'
const express = require('express')

const fs = require('fs')
const cors = require('cors')
const Datastore = require('nedb')

const os = require('node:os')

// Function to check and create a database if it doesn't exist
function initializeDatabase(dbFilePath) {
  if (!fs.existsSync(dbFilePath)) {
    // Database doesn't exist, create it
    const newDatabase = new nedb({ filename: dbFilePath, autoload: true, timestampData: true })
    console.log(`Created database: ${dbFilePath}`)
    return newDatabase
  }

  // Database already exists, load it
  return new nedb({ filename: dbFilePath, autoload: true })
}

const db = {}
db.cities = new Datastore('src/main/databases/cities.db')
db.countries = new Datastore('src/main/databases/countries.db')
db.cultures = new Datastore('src/main/databases/cultures.db')
db.religions = new Datastore('src/main/databases/religions.db')
db.namebases = new Datastore('src/main/databases/namebases.db')
db.notes = new Datastore('src/main/databases/notes.db')
db.info = new Datastore('src/main/databases/info.db')
db.settings = new Datastore('src/main/databases/settings.db')
db.application = new Datastore('src/main/databases/application.db')
db.SVG = new Datastore('src/main/databases/SVG.db')
db.svgMod = new Datastore('src/main/databases/svgMod.db')
db.tags = new Datastore('src/main/databases/tags.db')

db.cities.loadDatabase()
db.countries.loadDatabase()
db.cultures.loadDatabase()
db.religions.loadDatabase()
db.namebases.loadDatabase()
db.notes.loadDatabase()
db.info.loadDatabase()
db.settings.loadDatabase()
db.application.loadDatabase()
db.SVG.loadDatabase()
db.svgMod.loadDatabase()
db.tags.loadDatabase()

const Globals = global.shared

Globals.settings.version = Package.version
Globals.settings.os = {
  architecture: os.arch(),
  cpu: os.cpus(),
  platform: os.platform()
}
Globals.settings.os.cpu = Globals.settings.os.cpu[0].model

let mainWindow

/**
 * #######################################################################
 *
 * #######################################################################
 */

// Serialize function
const serializeData = (data) => {
  // Assuming the data is a single object
  return JSON.stringify(data)
}

// Deserialize function
const deserializeData = (data) => {
  // Assuming the data is a single object
  return JSON.parse(data)
}

// Create an Express app
const expressApp = express()
const expressServer = createServer(expressApp)
const PORT = process.env.PORT || 3000

const corsOptions = {
  origin: 'http://localhost:5173', // Replace with your frontend's URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: false // Enable credentials (cookies, authorization headers, etc.)
}

expressApp.use(express.json({ limit: '20mb' }))

// Serve static files from the renderer directory
expressApp.use(express.static(path.join(__dirname, '../renderer')))

expressApp.use(cors(corsOptions))

// Example API endpoint
// Primarily to test.
expressApp.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Express!' })
})

// Cities
expressApp.route('/api/cities')
  .get((req, res) => {
    db.cities.find({}, (err, data) => {
      if (err) {
        res.status(500).send(err)
      } else {
        res.json(data)
      }
    })
  })
  .put(() => { })
  .post(async (req, res) => {
    try {
      const newData = req.body;

      // Check if the database is empty
      const isEmpty = await new Promise((resolve, reject) => {
        db.cities.find({}, (err, docs) => {
          if (err) {
            reject(err);
          } else {
            resolve(docs.length === 0);
          }
        });
      });

      if (isEmpty) {
        console.log('Database is empty, inserting...');
        // Database is empty, insert the new document
        db.cities.insert(newData);
      } else {
        // Check if the document already exists based _id
        const existingData = await db.cities.findOne({ _id: newData._id });

        if (existingData) {
          console.log('Data exists, updating...');
          // Update the existing document
          db.cities.update({ _id: newData._id }, newData);
        } else {
          console.log('Data does not exist, inserting...');
          // Insert a new document
          db.cities.insert(newData);
        }
      }
      res.json(newData);
    } catch (error) {
      console.error('Error processing POST request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  })

// Countries
expressApp.route('/api/countries')
  .get((req, res) => {
    db.countries.find({}, (err, data) => {
      if (err) {
        res.status(500).send(err)
      } else {
        res.json(data)
      }
    })
  })
  .put(() => { })
  .post((req, res) => {
    const newData = req.body
    db.countries.insert(newData)
    res.json(newData)
  })

// Cultures
expressApp.route('/api/cultures')
  .get((req, res) => {
    db.cultures.find({}, (err, data) => {
      if (err) {
        res.status(500).send(err)
      } else {
        res.json(data)
      }
    })
  })
  .put(() => { })
  .post((req, res) => {
    const newData = req.body
    db.cultures.insert(newData)
    res.json(newData)
  })

// Religions
expressApp.route('/api/religions')
  .get((req, res) => {
    db.religions.find({}, (err, data) => {
      if (err) {
        res.status(500).send(err)
      } else {
        res.json(data)
      }
    })
  })
  .put(() => { })
  .post((req, res) => {
    const newData = req.body
    db.religions.insert(newData)
    res.json(newData)
  })



// Namebases
expressApp.route('/api/namebases')
  .get((req, res) => {
    db.namebases.find({}, (err, data) => {
      if (err) {
        res.status(500).send(err)
      } else {
        res.json(data)
      }
    })
  })
  .put(() => { })
  .post((req, res) => {
    const newData = req.body
    db.namebases.insert(newData)
    res.json(newData)
  })

// Notes
expressApp.route('/api/notes')
  .get((req, res) => {
    db.notes.find({}, (err, data) => {
      if (err) {
        res.status(500).send(err)
      } else {
        res.json(data)
      }
    })
  })
  .put(() => { })
  .post((req, res) => {
    const newData = req.body
    db.notes.insert(newData)
    res.json(newData)
  })

// Info
expressApp.route('/api/info')
  .get((req, res) => {
    db.info.find({}, (err, data) => {
      if (err) {
        res.status(500).send(err)
      } else {
        res.json(data)
      }
    })
  })
  .put(() => { })
  .post((req, res) => {
    const newData = req.body
    db.info.insert(newData)
    res.json(newData)
  })

// Settings
expressApp.route('/api/settings')
  .get((req, res) => {
    db.settings.find({}, (err, data) => {
      if (err) {
        res.status(500).send(err)
      } else {
        res.json(data)
      }
    })
  })
  .put(() => { })
  .post((req, res) => {
    const newData = req.body
    db.settings.insert(newData)
    res.json(newData)
  })

// Application
expressApp.route('/api/application')
  .get((req, res) => {
    db.application.find({}, (err, data) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(data);
      }
    });
  })
  .put(() => { })
  .post(async (req, res) => {
    try {
      const newData = req.body;

      // Check if the database is empty
      const isEmpty = await new Promise((resolve, reject) => {
        db.application.find({}, (err, docs) => {
          if (err) {
            reject(err);
          } else {
            resolve(docs.length === 0);
          }
        });
      });

      if (isEmpty) {
        console.log('Database is empty, inserting...');
        // Database is empty, insert the new document
        db.application.insert(newData);
      } else {
        // Check if the document already exists based on a condition (you may adjust this condition)
        const existingData = await db.application.findOne({ _id: newData._id });

        if (existingData) {
          console.log('Data exists, updating...');
          // Update the existing document
          db.application.update({ _id: newData._id }, newData);
        } else {
          console.log('Data does not exist, inserting...');
          // Insert a new document
          db.application.insert(newData);
        }
      }

      res.json(newData);
    } catch (error) {
      console.error('Error processing POST request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  })

// SVG
expressApp.route('/api/SVG')
  .get((req, res) => {
    db.SVG.find({}, (err, data) => {
      if (err) {
        res.status(500).send(err)
      } else {
        res.json(data)
      }
    })
  })
  .put(() => { })
  .post((req, res) => {
    const newData = req.body
    db.SVG.insert(newData)
    res.json(newData)
  })

// svgMod
expressApp.route('/api/svgMod')
  .get((req, res) => {
    db.svgMod.find({}, (err, data) => {
      if (err) {
        res.status(500).send(err)
      } else {
        res.json(data)
      }
    })
  })
  .put(() => { })
  .post((req, res) => {
    const newData = req.body
    db.svgMod.insert(newData)
    res.json(newData)
  })

// Tags
expressApp.route('/api/tags')
  .get((req, res) => {
    db.tags.find({}, (err, data) => {
      if (err) {
        res.status(500).send(err)
      } else {
        res.json(data)
      }
    })
  })
  .put(() => { })
  .post((req, res) => {
    const newData = req.body
    db.tags.insert(newData)
    res.json(newData)
  })

// Delete all entries route
expressApp.delete('/api/deleteAll', async (req, res) => {
  try {
    db.cities.remove({}, { multi: true }, (err, numRemoved) => {
      console.log(`Deleted ${numRemoved} entries.`);
    });

    db.countries.remove({}, { multi: true }, (err, numRemoved) => {
      console.log(`Deleted ${numRemoved} entries.`);
    });

    db.cultures.remove({}, { multi: true }, (err, numRemoved) => {
      console.log(`Deleted ${numRemoved} entries.`);
    });

    db.religions.remove({}, { multi: true }, (err, numRemoved) => {
      console.log(`Deleted ${numRemoved} entries.`);
    });

    db.namebases.remove({}, { multi: true }, (err, numRemoved) => {
      console.log(`Deleted ${numRemoved} entries.`);
    });

    db.notes.remove({}, { multi: true }, (err, numRemoved) => {
      console.log(`Deleted ${numRemoved} entries.`);
    });

    db.info.remove({}, { multi: true }, (err, numRemoved) => {
      console.log(`Deleted ${numRemoved} entries.`);
    });

    db.settings.remove({}, { multi: true }, (err, numRemoved) => {
      console.log(`Deleted ${numRemoved} entries.`);
    });

    db.application.remove({}, { multi: true }, (err, numRemoved) => {
      console.log(`Deleted ${numRemoved} entries.`);
    });

    db.SVG.remove({}, { multi: true }, (err, numRemoved) => {
      console.log(`Deleted ${numRemoved} entries.`);
    });

    db.svgMod.remove({}, { multi: true }, (err, numRemoved) => {
      console.log(`Deleted ${numRemoved} entries.`);
    });

    db.tags.remove({}, { multi: true }, (err, numRemoved) => {
      console.log(`Deleted ${numRemoved} entries.`);
    });

    // Respond with a success message
    res.json({ message: 'All entries deleted successfully' });
  } catch (err) {
    console.error('Error deleting entries:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

expressApp.post('/api/export', async (req, res) => {
  const exportOptions = req.body.exportOptions;
  const dataToExport = req.body.dataToExport;

  // Perform the export logic based on exportOptions and dataToExport
  // For simplicity, let's just log the received data
  console.log('Export Options:', exportOptions);
  console.log('Data to Export:', dataToExport);

  // Respond with success message (adjust as needed)
  res.json({ success: true, message: 'Export successful' });
});



// Start the Express server
expressServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

const title = "Terra-Logger v" + Package.version;

/**
 * #######################################################################
 *
 * #######################################################################
 */

app.whenReady().then(async () => {
  // Create a BrowserWindow with contextIsolation enabled.
  const bw = new BrowserWindow({
    title: title,
    minWidth: 1280,
    minHeight: 720,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/preload.js')
    }
  })

  bw.maximize()
  bw.loadURL('http://localhost:5173')
  bw.on('closed', () => mainWindow = null)
  bw.webContents.openDevTools()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
