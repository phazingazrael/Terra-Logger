const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const nedb = require('nedb');
const cors = require('cors');


const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(bodyParser.json());

const corsOptions = {
    origin: 'http://localhost:5173', // Replace with your frontend's URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Enable credentials (cookies, authorization headers, etc.)
};

app.use(cors());

// Define database paths

const cities = new nedb({ filename: 'databases/cities.db', autoload: true });
const countries = new nedb({ filename: 'databases/countries.db', autoload: true });
const cultures = new nedb({ filename: 'databases/cultures.db', autoload: true });
const religions = new nedb({ filename: 'databases/religions.db', autoload: true });
const namebases = new nedb({ filename: 'databases/namebases.db', autoload: true });
const notes = new nedb({ filename: 'databases/notes.db', autoload: true });
const info = new nedb({ filename: 'databases/info.db', autoload: true });
const settings = new nedb({ filename: 'databases/settings.db', autoload: true });
const application = new nedb({ filename: 'databases/application.db', autoload: true });
const SVG = new nedb({ filename: 'databases/SVG.db', autoload: true });
const svgMod = new nedb({ filename: 'databases/svgMod.db', autoload: true });
const tags = new nedb({ filename: 'databases/svgMod.db', autoload: true });
const tagsDefault = new nedb({ filename: 'databases/svgMod.db', autoload: true });


// Function to ensure the database exists
const ensureDatabaseExists = async (db) => {
    return new Promise((resolve, reject) => {
        // Check if the database file exists
        fs.access(db.filename, fs.constants.F_OK, async (err) => {
            if (err) {
                // If the file doesn't exist, insert an empty document to create the database
                const insertedData = await db.insert({});
                resolve(insertedData);
            } else {
                // If the file exists, resolve with the existing database
                resolve(db);
            }
        });
    });
};

// Serialize function
const serializeData = (data) => {
    // Assuming the data is a single object
    return JSON.stringify(data);
};

// Deserialize function
const deserializeData = (data) => {
    // Assuming the data is a single object
    return JSON.parse(data);
};

// Routes



// GET route - Retrieve data from the database
app.get("/cities", (req, res) => {
    res.header('Access-Control-Allow-Origin', '*'); // Or specify your origin(s)
    cities.find({}, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(data.map(deserializeData));
        }
    });
});

// POST route - Add data to the database
app.post("/cities", (req, res) => {
    const newData = req.body;
    console.log(newData);
    cities.insert(newData, (err, addedData) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(deserializeData(addedData));
        }
    });
});

// PUT route - Update data in the database
app.put("/cities", (req, res) => {
    const newData = req.body;
    cities.update({}, newData, { multi: true }, (err, numReplaced) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json({ updated: numReplaced });
        }
    });
});

// DELETE route - Remove all data from the database
app.delete("/cities", (req, res) => {
    cities.remove({}, { multi: true }, (err, numRemoved) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json({ removed: numRemoved });
        }
    });
});
// Routes for Cities with Pagination
app.get('/cities/:page/:limit', (req, res) => {
    const { page, limit } = req.params;
    const skip = (page - 1) * limit;

    cities.find({}).skip(skip).limit(Number(limit)).exec((err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(data);
        }
    });
});

// Routes for Cities by Country
app.get('/cities/country/:countryName', (req, res) => {
    const { countryName } = req.params;

    cities.find({ 'country.name': countryName }, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(data);
        }
    });
});

// Routes for Cities by Tag(s)
app.get('/cities/tags/:tags', (req, res) => {
    const tags = req.params.tags.split(',');

    cities.find({ 'tags.Name': { $in: tags } }, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(data);
        }
    });
});

// Routes for Cities by Type, Size, and Features
app.get('/cities/type/:type', (req, res) => {
    const { type } = req.params;

    cities.find({ type }, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(data);
        }
    });
});

app.get('/cities/size/:size', (req, res) => {
    const { size } = req.params;

    cities.find({ size }, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(data);
        }
    });
});

app.get('/cities/features/:feature', (req, res) => {
    const { feature } = req.params;

    cities.find({ features: feature }, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(data);
        }
    });
});

// Route to Delete a City by ID
app.delete('/cities/:id', (req, res) => {
    const { id } = req.params;

    cities.remove({ _id: id }, {}, (err, numRemoved) => {
        if (err) {
            res.status(500).send(err);
        } else if (numRemoved === 0) {
            res.status(404).send({ error: 'City not found' });
        } else {
            res.sendStatus(200);
        }
    });
});

// Routes for Countries with Pagination
app.get('/countries/:page/:limit', (req, res) => {
    const { page, limit } = req.params;
    const skip = (page - 1) * limit;

    countries.find({}).skip(skip).limit(Number(limit)).exec((err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(data);
        }
    });
});

// Routes for Countries by Tag(s)
app.get('/countries/tags/:tags', (req, res) => {
    const tags = req.params.tags.split(',');

    countries.find({ 'tags.Name': { $in: tags } }, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(data);
        }
    });
});

// Routes for Countries by Type, Size, and Features
app.get('/countries/type/:type', (req, res) => {
    const { type } = req.params;

    countries.find({ type }, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(data);
        }
    });
});

// Route to Delete a country by ID
app.delete('/countries/:id', (req, res) => {
    const { id } = req.params;

    countries.remove({ _id: id }, {}, (err, numRemoved) => {
        if (err) {
            res.status(500).send(err);
        } else if (numRemoved === 0) {
            res.status(404).send({ error: 'Country not found' });
        } else {
            res.sendStatus(200);
        }
    });
});


//Routes for Countries
app.post('/api/countries', (req, res) => {
    const country = req.body;
    countries.insert(country, (err, newCountry) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(201).json(newCountry);
    });
});

app.post('/api/religions', (req, res) => {
    const religion = req.body;
    religionsDB.insert(religion, (err, newReligion) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(201).json(newReligion);
    });
});

app.post('/api/provinces', (req, res) => {
    const province = req.body;
    provincesDB.insert(province, (err, newProvince) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(201).json(newProvince);
    });
});


// Example API endpoint
app.get('/hello', (req, res) => {
    res.json({ message: 'Hello from Express!' });
});
// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});