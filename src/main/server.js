const path = require('path')
const cors = require('cors')
// Create an Express app
const express = require('express')
const server = express()
const port = 3000

const Datastore = require('nedb')

const db = {}
db.application = new Datastore('../../resources/databases/application.db')
db.cities = new Datastore('../../resources/databases/cities.db')
db.countries = new Datastore('../../resources/databases/countries.db')
db.cultures = new Datastore('../../resources/databases/cultures.db')
db.info = new Datastore('../../resources/databases/info.db')
db.namebases = new Datastore('../../resources/databases/namebases.db')
db.notes = new Datastore('../../resources/databases/notes.db')
db.npcs = new Datastore('../../resources/databases/npcs.db')
db.religions = new Datastore('../../resources/databases/religions.db')
db.settings = new Datastore('../../resources/databases/settings.db')
db.SVG = new Datastore('../../resources/databases/SVG.db')
db.svgMod = new Datastore('../../resources/databases/svgMod.db')
db.tags = new Datastore('../../resources/databases/tags.db')

db.application.loadDatabase()
db.cities.loadDatabase()
db.countries.loadDatabase()
db.cultures.loadDatabase()
db.info.loadDatabase()
db.namebases.loadDatabase()
db.notes.loadDatabase()
db.npcs.loadDatabase()
db.religions.loadDatabase()
db.settings.loadDatabase()
db.SVG.loadDatabase()
db.svgMod.loadDatabase()
db.tags.loadDatabase()

const corsOptions = {
  origin: 'http://localhost:3000', // Replace with your frontend's URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: false // Enable credentials (cookies, authorization headers, etc.)
}

server.use(express.json({ limit: '20mb' }))

// Serve static files from the renderer directory
server.use(express.static(path.join(__dirname, '../renderer')))

// Enable Cross-Origin Resource Sharing (CORS)
server.use(cors(corsOptions))

// Example API endpoint
// Primarily to test.
server.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Express!' })
})

// Cities
server
  .route('/api/cities')
  .get((req, res) => {
    db.cities.find({}, (err, data) => {
      if (err) {
        res.status(500).send(err)
      } else {
        res.json(data)
      }
    })
  })
  .put(() => {})
  .post((req, res) => {
    const newData = req.body
    db.cities.insert(newData)
    res.json(newData)
  })

// Countries
server
  .route('/api/countries')
  .get((req, res) => {
    db.countries.find({}, (err, data) => {
      if (err) {
        res.status(500).send(err)
      } else {
        res.json(data)
      }
    })
  })
  .put(() => {})
  .post((req, res) => {
    const newData = req.body
    db.countries.insert(newData)
    res.json(newData)
  })

// Cultures
server
  .route('/api/cultures')
  .get((req, res) => {
    db.cultures.find({}, (err, data) => {
      if (err) {
        res.status(500).send(err)
      } else {
        res.json(data)
      }
    })
  })
  .put(() => {})
  .post((req, res) => {
    const newData = req.body
    db.cultures.insert(newData)
    res.json(newData)
  })

// Religions
server
  .route('/api/religions')
  .get((req, res) => {
    db.religions.find({}, (err, data) => {
      if (err) {
        res.status(500).send(err)
      } else {
        res.json(data)
      }
    })
  })
  .put(() => {})
  .post((req, res) => {
    const newData = req.body
    db.religions.insert(newData)
    res.json(newData)
  })

// Namebases
server
  .route('/api/namebases')
  .get((req, res) => {
    db.namebases.find({}, (err, data) => {
      if (err) {
        res.status(500).send(err)
      } else {
        res.json(data)
      }
    })
  })
  .put(() => {})
  .post((req, res) => {
    const newData = req.body
    db.namebases.insert(newData)
    res.json(newData)
  })

// Notes
server
  .route('/api/notes')
  .get((req, res) => {
    db.notes.find({}, (err, data) => {
      if (err) {
        res.status(500).send(err)
      } else {
        res.json(data)
      }
    })
  })
  .put(() => {})
  .post((req, res) => {
    const newData = req.body
    db.notes.insert(newData)
    res.json(newData)
  })

// NPC's
server
  .route('/api/npc')
  .get((req, res) => {
    db.npcs.find({}, (err, data) => {
      if (err) {
        res.status(500).send(err)
      } else {
        res.json(data)
      }
    })
  })
  .put(() => {})
  .post((req, res) => {
    const newData = req.body
    db.npcs.insert(newData)
    res.json(newData)
  })

// Info
server
  .route('/api/info')
  .get((req, res) => {
    db.info.find({}, (err, data) => {
      if (err) {
        res.status(500).send(err)
      } else {
        res.json(data)
      }
    })
  })
  .put(() => {})
  .post((req, res) => {
    const newData = req.body
    db.info.insert(newData)
    res.json(newData)
  })

// Settings
server
  .route('/api/settings')
  .get((req, res) => {
    db.settings.find({}, (err, data) => {
      if (err) {
        res.status(500).send(err)
      } else {
        res.json(data)
      }
    })
  })
  .put(() => {})
  .post((req, res) => {
    const newData = req.body
    db.settings.insert(newData)
    res.json(newData)
  })

// Application
server
  .route('/api/application')
  .get((req, res) => {
    db.application.find({}, (err, data) => {
      if (err) {
        res.status(500).send(err)
      } else {
        res.json(data)
      }
    })
  })
  .put(() => {})
  .post(async (req, res) => {
    try {
      const newData = req.body

      // Check if the database is empty
      const isEmpty = await new Promise((resolve, reject) => {
        db.application.find({}, (err, docs) => {
          if (err) {
            reject(err)
          } else {
            resolve(docs.length === 0)
          }
        })
      })

      if (isEmpty) {
        // Database is empty, insert the new document
        db.application.insert(newData)
      } else {
        // Check if the document already exists based on a condition (you may adjust this condition)
        const existingData = await db.application.findOne({ _id: newData._id })

        if (existingData) {
          // Update the existing document
          db.application.update({ _id: newData._id }, newData)
        } else {
          // Insert a new document
          db.application.insert(newData)
        }
      }

      res.json(newData)
    } catch (error) {
      console.error('Error processing POST request:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  })

// SVG
server
  .route('/api/SVG')
  .get((req, res) => {
    db.SVG.find({}, (err, data) => {
      if (err) {
        res.status(500).send(err)
      } else {
        res.json(data)
      }
    })
  })
  .put(() => {})
  .post((req, res) => {
    const newData = req.body
    db.SVG.insert(newData)
    res.json(newData)
  })

// svgMod
server
  .route('/api/svgMod')
  .get((req, res) => {
    db.svgMod.find({}, (err, data) => {
      if (err) {
        res.status(500).send(err)
      } else {
        res.json(data)
      }
    })
  })
  .put(() => {})
  .post((req, res) => {
    const newData = req.body
    db.svgMod.insert(newData)
    res.json(newData)
  })

// Tags
server
  .route('/api/tags')
  .get((req, res) => {
    db.tags.find({}, (err, data) => {
      if (err) {
        res.status(500).send(err)
      } else {
        res.json(data)
      }
    })
  })
  .put(() => {})
  .post((req, res) => {
    const newData = req.body
    db.tags.insert(newData)
    res.json(newData)
  })

// Delete all entries route
server.delete('/api/deleteAll', async (req, res) => {
  try {
    // Remove all documents from each collection
    db.application.remove({}, { multi: true }, (err, numRemoved) => {
      err ? console.log(err) : console.log(`Deleted ${numRemoved} entries.`)
    })

    db.cities.remove({}, { multi: true }, (err, numRemoved) => {
      err ? console.log(err) : console.log(`Deleted ${numRemoved} entries.`)
    })

    db.countries.remove({}, { multi: true }, (err, numRemoved) => {
      err ? console.log(err) : console.log(`Deleted ${numRemoved} entries.`)
    })

    db.cultures.remove({}, { multi: true }, (err, numRemoved) => {
      err ? console.log(err) : console.log(`Deleted ${numRemoved} entries.`)
    })

    db.religions.remove({}, { multi: true }, (err, numRemoved) => {
      err ? console.log(err) : console.log(`Deleted ${numRemoved} entries.`)
    })

    db.namebases.remove({}, { multi: true }, (err, numRemoved) => {
      err ? console.log(err) : console.log(`Deleted ${numRemoved} entries.`)
    })

    db.npcs.remove({}, { multi: true }, (err, numRemoved) => {
      err ? console.log(err) : console.log(`Deleted ${numRemoved} entries.`)
    })

    db.notes.remove({}, { multi: true }, (err, numRemoved) => {
      err ? console.log(err) : console.log(`Deleted ${numRemoved} entries.`)
    })

    db.info.remove({}, { multi: true }, (err, numRemoved) => {
      err ? console.log(err) : console.log(`Deleted ${numRemoved} entries.`)
    })

    db.settings.remove({}, { multi: true }, (err, numRemoved) => {
      err ? console.log(err) : console.log(`Deleted ${numRemoved} entries.`)
    })

    db.SVG.remove({}, { multi: true }, (err, numRemoved) => {
      err ? console.log(err) : console.log(`Deleted ${numRemoved} entries.`)
    })

    db.svgMod.remove({}, { multi: true }, (err, numRemoved) => {
      err ? console.log(err) : console.log(`Deleted ${numRemoved} entries.`)
    })

    db.tags.remove({}, { multi: true }, (err, numRemoved) => {
      err ? console.log(err) : console.log(`Deleted ${numRemoved} entries.`)
    })

    // Respond with a success message
    res.json({ message: 'All entries deleted successfully' })
  } catch (err) {
    console.error('Error deleting entries:', err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
  db.application.loadDatabase()
  db.cities.loadDatabase()
  db.countries.loadDatabase()
  db.cultures.loadDatabase()
  db.info.loadDatabase()
  db.namebases.loadDatabase()
  db.notes.loadDatabase()
  db.npcs.loadDatabase()
  db.religions.loadDatabase()
  db.settings.loadDatabase()
  db.SVG.loadDatabase()
  db.svgMod.loadDatabase()
  db.tags.loadDatabase()
})

server.post('/api/export', async (req, res) => {
  const exportOptions = req.body.exportOptions
  const dataToExport = req.body.dataToExport

  // Perform the export logic based on exportOptions and dataToExport
  // For simplicity, let's just log the received data
  console.log('Export Options:', exportOptions)
  console.log('Data to Export:', dataToExport)

  // Respond with success message (adjust as needed)
  res.json({ success: true, message: 'Export successful' })
})

// Start the Express server
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})

export default server
