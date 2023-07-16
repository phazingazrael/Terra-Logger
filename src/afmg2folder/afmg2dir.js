const fs = require("fs-extra");
let { render } = require("mustache");

const { createLogger, format, transports } = require("winston");

const { combine, timestamp, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} - ${level}: ${message}`;
});

const logger = createLogger({
  level: "info",
  format: combine(
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    myFormat
  ),
  defaultMeta: {},
  transports: [
    //
    // - Write to all logs with level `info` and below to `quick-start-combined.log`.
    // - Write all logs error (and below) to `quick-start-error.log`.
    //
    new transports.File({
      filename: `./logs/logs_${new Date().toJSON().slice(0, 10)}.log`,
    }),
  ],
});

//
// If we're not in production then **ALSO** log to the `console`
// with the colorized simple format.
//
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    })
  );
}

const output = "./output";
fs.ensureDirSync(output);

mapObject = {};

async function loadMapData() {
  const raw = await fs.readFile("map.json");
  const rawBurg = await fs.readFile("burgs.json");
  const burgs = JSON.parse(rawBurg);
  ////logger.log("info", burgs);
  const data = JSON.parse(raw);
  const cellData = data.cells;
  const mapObject = {
    info: data.info,
    settings: data.settings,
    coords: data.coords,
    cells: {
      cells: cellData.cells,
      features: cellData.features,
      cultures: cellData.cultures,
      burgs: cellData.burgs,
      states: cellData.states,
      provinces: cellData.provinces,
      religions: cellData.religions,
      rivers: cellData.rivers,
      markers: cellData.markers,
    },
    vertices: data.vertices,
    biomes: data.biomes,
    notes: data.notes,
    nameBases: data.nameBases,
  };

  const mapSettings = mapObject.settings;
  const states = mapObject.cells.states;
  const cities = mapObject.cells.burgs;
  const provinces = mapObject.cells.provinces;
  const cultures = mapObject.cells.cultures;
  const features = mapObject.cells.features;
  const religions = mapObject.cells.religions;
  var cityArray = cities.filter((value) => Object.keys(value).length !== 0);
  var stateArray = states.filter((value) => Object.keys(value).length !== 0);
  var religionArray = religions.filter(
    (value) => Object.keys(value).length !== 0
  );

  states.map((State) => {
    State.cities = [];
  });

  cityArray.map((City) => {
    //logger.log("info", "**************************");
    //logger.log("info", "Start City Mapping");
    //logger.log("info", "::::::::::::::::::::::::::");
    //logger.log("info", "City Name: " + City.name);

    //logger.log("info", "==========================");
    //logger.log("info", "Setting Country/State");
    //logger.log("info", "::::::::::::::::::::::::::");
    let cityState = City.state;
    let country = states[cityState];

    City.country = country.name;
    City.countryFull = country.fullName;
    City.govForm = country.form;
    City.govName = country.formName;

    //logger.log("info", "Country: " + City.country);
    //logger.log("info", "--------------------------");
    //logger.log("info", "Country Full: " + City.countryFull);
    //logger.log("info", "--------------------------");
    //logger.log("info", "Government Form: " + City.govForm);
    //logger.log("info", "--------------------------");
    //logger.log("info", "Government Name: " + City.govName);

    City.Features = [];
    //logger.log("info", "==========================");
    //logger.log("info", "Getting City Features");
    //logger.log("info", "::::::::::::::::::::::::::");

    if (City.capital === true) {
      City.capital = "Yes";
      states[cityState].capital = City.name;
      City.capitalmd = "#### Capital City of " + City.countryFull;
      City.isCap = "🏰";
      City.capitalCity = "Capital";
      City.capitalCityTag = "capitalCity: CapitalCity";
    } else {
      City.capital = "";
      City.capitalCityTag = "";
    }
    //logger.log("info", "Capital City?: " + City.capital);
    //logger.log("info", "--------------------------");
    country.cities.push(City);
    if (City.citadel === 1) {
      City.citadel = "Yes";
      City.Features.push({ name: "Citadel" });
      City.citadelmd = "#### Citadel: <Citadel Details>";
    } else {
      City.citadel = "";
    }
    //logger.log("info", "Citadel?: " + City.citadel);
    //logger.log("info", "--------------------------");

    if (City.port === 1) {
      City.port = "Yes";
      City.Features.push({ name: "Port" });
      City.portmd = "#### Port: <Port Details>";
    } else {
      City.port = "";
    }
    //logger.log("info", "Port?: " + City.port);
    //logger.log("info", "--------------------------");

    if (City.plaza === 1) {
      City.plaza = "Yes";
      City.Features.push({ name: "Plaza" });
      City.plazamd = "#### Trade Center: <Trade-Center Details>";
    } else {
      City.plaza = "";
    }
    //logger.log("info", "Plaza?: " + City.plaza);
    //logger.log("info", "--------------------------");

    if (City.walls === 1) {
      City.walls = "Yes";
      City.Features.push({ name: "Walls" });
      City.wallsmd = "#### Walls: <Walls Details>";
    } else {
      City.walls = "";
    }
    //logger.log("info", "City Walls?: " + City.walls);
    //logger.log("info", "--------------------------");

    if (City.shanty === 1) {
      City.shanty = "Yes";
      City.Features.push({ name: "Shanty Town" });
      City.shantymd = "#### Shanty: <Shanty Details>";
    } else {
      City.shanty = "";
      City.shantymd = "";
    }
    //logger.log("info", "Shanty Town?: " + City.shanty);
    //logger.log("info", "--------------------------");

    if (City.temple === 1) {
      City.templemd = "#### Temple: <Temple Details>";
      City.Features.push({ name: "Temple" });
      City.temple = "Yes";
    } else {
      City.temple = "";
      City.templemd = "";
    }
    //logger.log("info", "Temple(s)?: " + City.temple);
    //logger.log("info", "--------------------------");

    City.Features.sort((a, b) => a.name.localeCompare(b.name));

    if (City.link === undefined) {
      var result = cities.find((obj) => {
        return obj.name === City.name;
      });
      City.link = result.link;
    } else {
      City.linkmd = "[" + City.link + "](City Map)";
    }
    //logger.log("info", "==========================");
    //logger.log("info", "Is there a City Map Link?");
    //logger.log("info", "::::::::::::::::::::::::::");
    //logger.log("info", City.link);

    City.cultureName = cultures[City.culture].name;
    //logger.log("info", "==========================");
    //logger.log("info", "Primary Culture: ");
    //logger.log("info", "::::::::::::::::::::::::::");
    //logger.log("info", City.cultureName);

    const populationvalue = Math.round(
      City.population * mapSettings.populationRate * mapSettings.urbanization
    );

    City.populationout = populationvalue.toLocaleString("en-US");
    logger.log("info", "==========================");
    logger.log("info", "City Population: ");
    logger.log("info", "::::::::::::::::::::::::::");
    logger.log("info", City.populationout);
    if (populationvalue < 21) {
      City.size = "Thorp";
    } else if ((populationvalue > 21, populationvalue < 60)) {
      City.size = "Hamlet";
    } else if ((populationvalue > 61, populationvalue < 200)) {
      City.size = "Village";
    } else if ((populationvalue > 201, populationvalue < 2000)) {
      City.size = "Small Town";
    } else if ((populationvalue > 2001, populationvalue < 5000)) {
      City.size = "Large Town";
    } else if ((populationvalue > 5001, populationvalue < 10000)) {
      City.size = "Small City";
    } else if ((populationvalue > 10001, populationvalue < 25000)) {
      City.size = "Large City";
    } else if (populationvalue > 25000) {
      City.size = "Metropolis";
    }

    //logger.log("info", "==========================");
    //logger.log("info", "Getting City Size");
    //logger.log("info", "::::::::::::::::::::::::::");
    //logger.log("info", City.size);
    City.Settlement = "City - " + City.size;
    let url = "https://armoria.herokuapp.com/?coa=" + JSON.stringify(City.coa);

    const getCoa = async () => {
      fetch(url)
        .then((response) => response.text())
        .then((svg) =>
          fs.outputFileSync(
            output +
              "/" +
              mapObject.info.mapName +
              "/Locations/Cities/" +
              country.name +
              "/" +
              City.name +
              ".svg",
            svg
          )
        );
    };
    if (City.coa !== undefined) {
      //getCoa();
    } else {
      City.coa = "";
      //getCoa();
    }
    //logger.log("info", "==========================");
    //logger.log("info", "COA / Emblem URL: '" + url + "'");
    //logger.log("info", "==========================");

    //let template = fs.readFileSync("./src/template/cityInfoBox.md").toString();

    //logger.log("info", "==========================");
    //logger.log("info", "Writing File");
    let template = fs
      .readFileSync("./src/template/prostashioMod/City.md")
      .toString();

    let templateOutput = render(template, City);

    fs.outputFileSync(
      output +
        "/" +
        mapObject.info.mapName +
        "/Locations/Cities/" +
        country.name +
        "/" +
        City.name +
        ".md",
      templateOutput
    );
    /* logger.log(
      "info",
      "File Written to: '" +
      output +
      "/" +
      mapObject.info.mapName +
      "/Locations/Cities/" +
      country.name +
      "/" +
      City.name +
        ".md'"
    ); */
    //logger.log("info", "::::::::::::::::::::::::::");
    //logger.log("info", "End City Mapping");
    //logger.log("info", "**************************");
  });

  states.map((State) => {
    //logger.log("info", "**************************");
    //logger.log("info", "Start State Mapping");
    //logger.log("info", "::::::::::::::::::::::::::");
    //logger.log("info", "State Name: " + State.name);

    //logger.log("info", "==========================");
    //logger.log("info", "Setting 'Settlement' Type");
    State.Settlement = "Country";
    //logger.log("info", "Settlement: " + State.Settlement);

    if (cultures[State.culture] === undefined) {
      cultures[State.culture] = 0;
    }
    //logger.log("info", "==========================");
    //logger.log("info", "Get Culture Name");
    State.cultureName = cultures[State.culture].name;
    //logger.log("info", "Culture: " + State.cultureName);
    //logger.log("info", "==========================");
    //logger.log("info", "Getting Diplomacy");
    State.diplomacy.map((Diplomat) => {
      const diplomats = [];
      let i = 0;
      while (i < State.diplomacy.length) {
        dipObj = {
          id: i,
          name: states[i].fullName || "",
          status: State.diplomacy[i] || "",
        };
        diplomats.push(dipObj);
        i++;
      }
      State.diplomats = diplomats;
    });
    State.diplomats.map((diplo) => {
      //logger.log("info", diplo.name + ": " + diplo.status);
      //logger.log("info", "--------------------------");
    });

    let url = "https://armoria.herokuapp.com/?coa=" + JSON.stringify(State.coa);

    const getCoa = async () => {
      fetch(url)
        .then((response) => response.text())
        .then((svg) =>
          fs.outputFileSync(
            output +
              "/" +
              mapObject.info.mapName +
              "/Locations/Countries/" +
              State.name +
              "/" +
              State.fullName +
              ".svg",
            svg
          )
        );
    };
    //logger.log("info", "==========================");
    //logger.log("info", "Getting Coat of Arms / Emblem");
    if (State.coa !== undefined) {
      //getCoa();
    }
    //logger.log("info", "COA / Emblem URL: '" + url + "'");

    //logger.log("info", "==========================");
    //logger.log("info", "Getting Population Values");
    const urbanvalue = Math.round(
      State.urban * mapSettings.populationRate * mapSettings.urbanization
    );
    State.urbanPop = urbanvalue.toLocaleString("en-US");
    //logger.log("info", "::::::::::::::::::::::::::");
    //logger.log("info", "Urban Population: " + urbanvalue);
    //logger.log("info", "::::::::::::::::::::::::::");
    /* logger.log(
      "info",
      "Urban Population 'toLocaleString': " + urbanvalue.toLocaleString("en-US")
    ); */

    const ruralvalue = Math.round(State.rural * mapSettings.populationRate);
    //logger.log("info", "rural value: " + ruralvalue);
    State.ruralPop = ruralvalue.toLocaleString("en-US");
    //logger.log("info", "::::::::::::::::::::::::::");
    //logger.log("info", "Rural Population: " + ruralvalue);
    //logger.log("info", "::::::::::::::::::::::::::");
    //logger.log(
    //  "info",
    //  "Rural Population 'toLocaleString': " + ruralvalue.toLocaleString("en-US")
    //);

    State.populationout = Math.round(ruralvalue + urbanvalue);
    //logger.log("info", "::::::::::::::::::::::::::");
    //logger.log("info", "Population Total: " + State.populationout);
    //logger.log("info", "::::::::::::::::::::::::::");
    //logger.log(
    //  "info",
    //  "Population Total 'toLocaleString': " +
    //    State.populationout.toLocaleString("en-US")
    //);
    State.populationout = State.populationout.toLocaleString("en-US");
    //logger.log("info", "TOTAL POP: " + State.populationout);
    //logger.log("info", "==========================");
    //logger.log("info", "Writing File");
    let template = fs
      .readFileSync("./src/template/prostashioMod/Country.md")
      .toString();
    let templateOutput = render(template, State);
    if (State.name !== "Neutrals") {
      fs.outputFileSync(
        output +
          "/" +
          mapObject.info.mapName +
          "/Locations/Countries/" +
          State.name +
          "/" +
          State.fullName +
          ".md",
        templateOutput
      );
    }
    //logger.log("info","File Written to: '" +output +"/" +mapObject.info.mapName +"/Locations/Countries/" +State.name +"/" +State.fullName +".md'");
    //logger.log("info", "::::::::::::::::::::::::::");
    //logger.log("info", "End State Mapping");
    //logger.log("info", "**************************");
  });

  religions.map((Religion) => {
    const urbanvalue = Math.round(
      Religion.urban * mapSettings.populationRate * mapSettings.urbanization
    ).toLocaleString("en-US");
    Religion.urbanPop = urbanvalue;

    const ruralvalue = Math.round(
      Religion.rural * mapSettings.populationRate
    ).toLocaleString("en-US");
    Religion.ruralPop = ruralvalue;

    religObj = {
      i: Religion.i || "",
      name: Religion.name || "",
      color: Religion.color || "",
      culture: Religion.culture || "",
      type: Religion.type || "",
      form: Religion.form || "",
      deity: Religion.deity || "",
      center: Religion.center || "",
      origins: Religion.origins || "",
      code: Religion.code || "",
    };

    let template = fs
      .readFileSync("./src/template/religionTemplate.md")
      .toString();
    let templateOutput = render(template, religObj);

    fs.outputFileSync(
      output +
        "/" +
        mapObject.info.mapName +
        "/Factions/ReligiousGroups/" +
        Religion.name +
        ".md",
      templateOutput
    );
  });
}
loadMapData();
