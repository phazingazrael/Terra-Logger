/*
  # TODO: 
  - Currently using ONLY Pathfinder 2nd Edition data. Refactor to include ability to choose between PF2E and D&D 5e
*/
import classes from './classes.json';
import languages from './languages.json';
import occupations from './occupations.json';
import races from './races.json';
//import subclasses from './subclasses.json'; //D&D only, not p2e.

// Make classes, languages, occupations, and races customizable
let Classes = [...classes];
let Languages = [...languages];
let Occupations = [...occupations];
let Races = { ...races };
//let Subclasses = JSON.parse(JSON.stringify(subclasses));
