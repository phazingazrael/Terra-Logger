/*
 **********************************************
 *    A systems agnostic RPG NPC Generator.   *
 *           Created by Shuggaloaf            *
 *  Reddit: u/shuggaloaf; Discord: Earl#7716  *
 **********************************************
 *    This has been modified to work with     *
 *    the Terra-Logger project.               *
 **********************************************
 */

//***********************************
//*           NAMES LISTS           *
//*  EXTRACTED TO INDIVIDUAL FILES  *
//***********************************

import DBFemale from './names/dragonborn.f.json';
import DBSurname from './names/dragonborn.last.json';
import DBMale from './names/dragonborn.m.json';
import DBNickname from './names/dragonborn.nick.json';
import DwFemale from './names/dwarf.f.json';
import DwSurname from './names/dwarf.last.json';
import DwMale from './names/dwarf.m.json';
import ElfFemale from './names/elf.f.json';
import ElfSurname from './names/elf.last.json';
import ElfMale from './names/elf.m.json';
import GnomeFemale from './names/gnome.f.json';
import GnomeSurname from './names/gnome.last.json';
import GnomeMale from './names/gnome.m.json';
import Goblin from './names/goblin.json';
import GoliathFemale from './names/goliath.f.json';
import GoliathSurname from './names/goliath.last.json';
import GoliathMale from './names/goliath.m.json';
import GoliathNick from './names/goliath.nick.json';
import HalfelfFemale from './names/halfelf.f.json';
import HalfelfSurname from './names/halfelf.last.json';
import HalfelfMale from './names/halfelf.m.json';
import HalflingNick1 from './names/halfling.1.json';
import HalflingNick2 from './names/halfling.2.json';
import HalflingFemale from './names/halfling.f.json';
import HalflingSurname from './names/halfling.last.json';
import HalflingMale from './names/halfling.m.json';
import HumanFemale from './names/human.f.json';
import HumanSurname from './names/human.last.json';
import HumanMale from './names/human.m.json';
import LizardFemale from './names/lizard.f.json';
import LizardSurname from './names/lizard.last.json';
import LizardMale from './names/lizard.m.json';
import Orc from './names/orc.json';
import OrcSurname from './names/orc.last.json';
import TiefFemale from './names/tief.f.json';
import TiefSurname from './names/tief.last.json';
import TiefMale from './names/tief.m.json';
import TiefNickname from './names/tief.nick.json';

//***********************************
//*      CHARACTERISTICS LISTS      *
//*  EXTRACTED TO INDIVIDUAL FILES  *
//***********************************
import Activities from './details/activities.json';
import Build from './details/build.json';
import Complexion from './details/complexion.json';
import Demeanor from './details/demeanor.json';
import Descriptors1 from './details/descriptors1.json';
import Descriptors2 from './details/descriptors2.json';
import Descriptors3 from './details/descriptors3.json';
import Dragonborn from './details/dragonborn.json';
import EyeColor from './details/eye.color.1.json';
import EyeColor2 from './details/eye.color.2.json';
import EyeColor3 from './details/eye.color.3.json';
import EyeShape from './details/eye.shape.json';
import HairColor from './details/hair.color.json';
import FacialHair from './details/hair.face.json';
import HairStyle from './details/hair.style.json';
import Height from './details/height.json';
import Lizard from './details/lizard.json';
import OrcGob from './details/orcGob.json';
import SkinTone from './details/skin.json';
import Tiefling from './details/tiefling.json';

//***********************************
//*       PROFFESSIONS LISTS        *
//*  EXTRACTED TO INDIVIDUAL FILES  *
//***********************************\
import GovProfessions from './details/govProfessions.json';
import ProfessionDescriptions from './details/professionDescriptions.json';
import Professions from './details/professions.json';

//***********************************
//*      NAMES LISTS                  *
//*  - Dragonborn_Female: List of dragonborn female first names
//*  - Dragonborn_Male: List of dragonborn male first names
//*  - Dragonborn_Nickname: List of dragonborn nicknames
//*  - Dragonborn_Surname: List of dragonborn surnames
//*  - Dwarf_Female: List of dwarf female first names
//*  - Dwarf_Male: List of dwarf male first names
//*  - Dwarf_Surname: List of dwarf surnames
//*  - Elf_Female: List of elf female first names
//*  - Elf_Male: List of elf male first names
//*  - Elf_Surname: List of elf surnames
//*  - Gnome_Female: List of gnome female first names
//*  - Gnome_Male: List of gnome male first names
//*  - Gnome_Surname: List of gnome surnames
//*  - GoblinNames: List of goblin names
//*  - Goliath_Female: List of goliath female first names
//*  - Goliath_Male: List of goliath male first names
//*  - Goliath_Nickname: List of goliath nicknames
//*  - Goliath_Surname: List of goliath surnames
//*  - HalfElf_Female: List of half-elf female first names
//*  - HalfElf_Male: List of half-elf male first names
//*  - HalfElf_Surname: List of half-elf surnames
//*  - Halfling_Female: List of halfling female first names
//*  - Halfling_Male: List of halfling male first names
//*  - Halfling_Nickname1: List of halfling nicknames
//*  - Halfling_Nickname2: List of halfling nicknames
//*  - Halfling_Surname: List of halfling surnames
//*  - Human_Female: List of human female first names
//*  - Human_Male: List of human male first names
//*  - Human_Surname: List of human surnames
//*  - Lizard_Female: List of lizardfolk female first names
//*  - Lizard_Male: List of lizardfolk male first names
//*  - Lizard_Surname: List of lizardfolk surnames
//*  - Orc_Surname: List of orc surnames
//*  - OrcNames: List of orc names
//*  - Tiefling_Female: List of tiefling female first names
//*  - Tiefling_Male: List of tiefling male first names
//*  - Tiefling_Nickname: List of tiefling nicknames
//*  - Tiefling_Surname: List of tiefling surnames
//***********************************
const Dragonborn_Female = DBFemale;
const Dragonborn_Male = DBMale;
const Dragonborn_Nickname = DBNickname;
const Dragonborn_Surname = DBSurname;
const Dwarf_Female = DwFemale;
const Dwarf_Male = DwMale;
const Dwarf_Surname = DwSurname;
const Elf_Female = ElfFemale;
const Elf_Male = ElfMale;
const Elf_Surname = ElfSurname;
const Gnome_Female = GnomeFemale;
const Gnome_Male = GnomeMale;
const Gnome_Surname = GnomeSurname;
const GoblinNames = Goblin;
const Goliath_Female = GoliathFemale;
const Goliath_Male = GoliathMale;
const Goliath_Nickname = GoliathNick;
const Goliath_Surname = GoliathSurname;
const HalfElf_Female = HalfelfFemale;
const HalfElf_Male = HalfelfMale;
const HalfElf_Surname = HalfelfSurname;
const Halfling_Female = HalflingFemale;
const Halfling_Male = HalflingMale;
const Halfling_Nickname1 = HalflingNick1;
const Halfling_Nickname2 = HalflingNick2;
const Halfling_Surname = HalflingSurname;
const Human_Female = HumanFemale;
const Human_Male = HumanMale;
const Human_Surname = HumanSurname;
const Lizard_Female = LizardFemale;
const Lizard_Male = LizardMale;
const Lizard_Surname = LizardSurname;
const Orc_Surname = OrcSurname;
const OrcNames = Orc;
const Tiefling_Female = TiefFemale;
const Tiefling_Male = TiefMale;
const Tiefling_Nickname = TiefNickname;
const Tiefling_Surname = TiefSurname;

//***********************************
//*  CHARACTERISTICS LISTS          *
//*  - activities: List of activity words
//*  - build: List of build words
//*  - complexion: List of words that describe a character's complexion
//*  - demeanor: List of demeanor words
//*  - descriptors1: List of descriptor words
//*  - descriptors2: List of descriptor words
//*  - descriptors3: List of descriptor words
//*  - dragonborn: List of dragonborn characteristics
//*  - eyeColor: List of eye color words
//*  - eyeColor2: List of eye color words
//*  - eyeColor3: List of eye color words
//*  - eyeShape: List of eye shape words
//*  - facialHair: List of facial hair words
//*  - hairColor: List of hair color words
//*  - hairStyle: List of hair style words
//*  - height: List of height words
//*  - lizard: List of lizardfolk characteristics
//*  - orcGob: List of orc and goblin characteristics
//*  - skinTone: List of skin tones
//*  - tiefling: List of tiefling characteristics
//***********************************

const activities = Activities;
const build = Build;
const complexion = Complexion;
const demeanor = Demeanor;
const descriptors1 = Descriptors1;
const descriptors2 = Descriptors2;
const descriptors3 = Descriptors3;
const dragonborn = Dragonborn;
const eyeColor = EyeColor;
const eyeColor2 = EyeColor2;
const eyeColor3 = EyeColor3;
const eyeShape = EyeShape;
const facialHair = FacialHair;
const hairColor = HairColor;
const hairStyle = HairStyle;
const height = Height;
const lizard = Lizard;
const orcGob = OrcGob;
const skinTone = SkinTone;
const tiefling = Tiefling;

//***********************************
//*  PROFESSIONS LISTS              *
//*  - professions: List of profession words
//*  - professionDescriptions: List of profession descriptions
//*  - govProfessions: List of government professions
//***********************************
const professions = Professions;
const professionDescriptions = ProfessionDescriptions;
const govProfessions = GovProfessions;

/**
 * Generates a random floating point number between y (inclusive) and x (exclusive).
 * @param {number} x - Upper bound (exclusive)
 * @param {number} y - Lower bound (inclusive)
 * @returns {number} A random floating point number in the range [y, x)
 */
const randFl = (x, y) => {
  return Math.floor(Math.random() * x) + y;
};

/**
 * Gets the description for a given profession.
 * @param {string} profession - The profession to get the description for.
 * @returns {string} The description of the profession.
 */
const getProfessionDescription = (profession) => {
  return professionDescriptions[profession];
};

/**
 * Generates a character based on the given character details and profession.
 *
 * @param {object} characterDetails - details of the character including first name, last name, race, gender, and other attributes
 *    @param {string}  - First name array
 *    @param {string} LName - Last name array
 *    @param {string} race - Race of the character
 *    @param {string} gender - Gender of the character
 *    @param {string} NNType - Nickname type
 *    @param {string} NName - Nickname array
 *    @param {string} NName2 - Second nickname array
 *
 * @param {string} Profession - the profession of the character
 * @return {object} the generated NPC (Non-Player Character) with various attributes such as name, race, gender, profession, and physical characteristics
 */
async function rollCharacter(characterDetails, Profession) {
  const { FName, LName, race, gender, NNType, NName, NName2 } = characterDetails;
  let randEye = Math.floor(Math.random() * 100) + 1;
  let randDesc = Math.floor(Math.random() * 100) + 1;
  let randHeight = Math.floor(Math.random() * 100) + 1;
  let txtFirstName = FName[randFl(FName.length, 0)];
  let txtLastName = LName[randFl(LName.length, 0)];
  let txtNick1 = '';
  let txtNick2 = '';
  let txtNickname = '';
  let txtClan = '';
  let txtBuild = build[randFl(build.length, 0)];
  let txtTone = skinTone[randFl(skinTone.length, 0)];
  let txtComp = complexion[randFl(complexion.length, 0)];
  let txtHairStyle = hairStyle[randFl(hairStyle.length, 0)];
  let txtHairColor = hairColor[randFl(hairColor.length, 0)];
  let txtEyeShape = eyeShape[randFl(eyeShape.length, 0)];
  let txtDemeanor = demeanor[randFl(demeanor.length, 0)];
  let txtProfession = '';
  let txtProfDesc = '';
  let txtActivities = activities[randFl(activities.length, 0)];
  let txtDescriptors = '';
  let txtHeight = '';
  let txtFacialHair = '';
  let txtEyeColor = '';

  // Generate Name based off Race

  //Height
  if (randHeight.total < 20 || randHeight.total > 80) {
    txtHeight = height[randFl(height.length, 0)];
  } else {
    txtHeight = 'Average Height';
  }

  //Descriptors Rarity
  if (randDesc.total >= 90) {
    txtDescriptors = descriptors3[randFl(descriptors3.length, 0)];
  } else if (randDesc <= 65) {
    txtDescriptors = descriptors1[randFl(descriptors1.length, 0)];
  } else {
    txtDescriptors = descriptors2[randFl(descriptors2.length, 0)];
  }

  //Facial Hair Handling
  if (gender == 'Female' && race == 'Dwarf') {
    txtFacialHair = facialHair[randFl(facialHair.length, 0)];
  } else if (gender == 'Male') {
    txtFacialHair = facialHair[randFl(facialHair.length, 0)];
  } else {
    txtFacialHair = 'None';
  }

  if (race == 'Dragonborn' || race == 'Goblin' || race == 'Lizardfolk' || race == 'Elf')
    (txtFacialHair = 'None'),
      txtDescriptors
        .replace('Very hairy', 'Exceptionally average')
        .replace('One hell of a mustache', 'Exceptionally average');
  if (race == 'Dwarf') txtFacialHair = txtFacialHair.replace('Clean-Shaven', 'Long, Braided Beard');

  //Eye Color Rarity
  if (randEye.total >= 90) {
    txtEyeColor = eyeColor3[randFl(eyeColor3.length, 0)];
  } else if (randEye.total <= 65) {
    txtEyeColor = eyeColor[randFl(eyeColor.length, 0)];
  } else {
    txtEyeColor = eyeColor2[randFl(eyeColor2.length, 0)];
  }

  //Tone
  if (race == 'Goblin' || race == 'Half-Orc') {
    txtTone = orcGob[randFl(orcGob.length, 0)];
  } else if (race == 'Dragonborn') {
    txtTone = dragonborn[randFl(dragonborn.length, 0)];
    txtComp = 'Scaled';
  } else if (race == 'Lizardfolk') {
    txtTone = lizard[randFl(lizard.length, 0)];
    txtComp = 'Scaled';
  } else if (race == 'Tiefling') {
    const randTief = Math.floor(Math.random() * 6) + 1;
    if (randTief.total > 4) {
      txtTone = tiefling[randFl(tiefling.length, 0)];
    } else {
      txtTone = skinTone[randFl(skinTone.length, 0)];
    }
  }

  //Nickname Handling
  if (race == 'Halfling') {
    txtNick1 = NName[randFl(NName.length, 0)];
    txtNick2 = NName2[randFl(NName2.length, 0)];
    txtNickname = NNType + txtNick1 + txtNick2;
  } else if (race == 'Dragonborn') {
    txtNick1 = NName[randFl(NName.length, 0)];
    txtNickname = NNType + txtNick1;
    txtClan =
      '*Dragonborn display their clan name first. The "Child Name" is a nickname earned as a child.';
  } else if (race == 'Tiefling') {
    txtNick1 = NName[randFl(NName.length, 0)];
    txtNickname = NNType + txtNick1;
  } else if (race == 'Goliath') {
    txtNick1 = NName[randFl(NName.length, 0)];
    txtNickname = NNType + txtNick1;
    txtClan = '*Goliath display their Clan name last.';
  } else {
    // txtNickname = "";
    // txtClan = "";
  }

  //If Bald/Shaved we want to add "eyebrow" before the hair color
  if (txtHairStyle == 'Bald' || txtHairStyle == 'Shaved') {
    if (gender == 'Female') {
      txtHairStyle = 'Shoulder-Length';
      txtFacialHair = 'None';
    } else {
      txtHairColor += ' Eyebrow ';
    }
  }

  //Hair Handling
  if (race == 'Dragonborn' || race == 'Lizardfolk') {
    txtHairStyle = 'None';
    txtHairColor = 'None';
  }

  //Profession Handling
  let prof2 = professions[randFl(professions.length, 0)];
  switch (Profession) {
    case 'Apprentice':
      txtProfession = prof2 + ' (Apprentice)';
      txtProfDesc = getProfessionDescription(Profession) + ' ' + getProfessionDescription(prof2);
      break;
    case 'Journeyman':
      txtProfession = prof2 + ' (Journeyman)';
      txtProfDesc = getProfessionDescription(Profession) + ' ' + getProfessionDescription(prof2);
      break;
    default:
      txtProfession = professions[randFl(professions.length, 0)];
      txtProfDesc = getProfessionDescription(txtProfession);
  }

  let npc = {
    fullName: txtFirstName + ' ' + txtLastName,
    nickName: txtNickname,
    race: race,
    gender: gender,
    profession: {
      title: txtProfession,
      description: txtProfDesc,
    },
    build: txtHeight + ' and ' + txtBuild,
    skin: {
      tone: txtTone,
      comp: txtComp,
    },
    eye: {
      shape: txtEyeShape,
      color: txtEyeColor,
    },
    hair: {
      style: txtHairStyle,
      color: txtHairColor,
      facial: txtFacialHair,
    },
    descriiptors: txtDescriptors,
    demeanor: txtDemeanor,
    activities: txtActivities,
    clan: txtClan,
  };

  console.log('Generated NPC:', npc);
  return npc;
}

/**
 * Rolls a human NPC with a given gender and profession.
 *
 * If `gender` is 'Male' or 'Female', the NPC will be rolled with the
 * appropriate first name, last name, race, and gender. If `gender` is not
 * 'Male' or 'Female', the function will randomly choose to roll a male or
 * female NPC.
 *
 * If `profession` is an empty string, a random profession will be chosen.
 *
 * @param {string} gender - Gender of the NPC to roll. One of 'Male', 'Female', or any other string to randomly choose a gender.
 * @param {string} profession - Profession of the NPC to roll. If empty, a random profession will be chosen.
 * @returns {object} An object containing the rolled NPC's information.
 */
export const rollHuman = (gender, profession) => {
  if (profession === '') profession = professions[randFl(professions.length, 0)];
  switch (gender) {
    case 'Male':
      return rollCharacter(
        {
          FName: Human_Male,
          LName: Human_Surname,
          race: 'Human',
          gender: 'Male',
          NNType: '',
          NName: '',
          NName2: '',
        },
        profession,
      );
    case 'Female':
      return rollCharacter(
        {
          FName: Human_Female,
          LName: Human_Surname,
          race: 'Human',
          gender: 'Female',
          NNType: '',
          NName: '',
          NName2: '',
        },
        profession,
      );
    default:
      Math.floor(Math.random() * 2) === 0
        ? rollHuman('Male', profession)
        : rollHuman('Female', profession);
  }
};

/**
 * Rolls a Dragonborn NPC with a given gender and profession.
 *
 * If `gender` is 'Male' or 'Female', the NPC will be rolled with the
 * appropriate first name, last name, race, and gender. If `gender` is not
 * 'Male' or 'Female', the function will randomly choose to roll a male or
 * female NPC.
 *
 * If `profession` is an empty string, a random profession will be chosen.
 *
 * @param {string} gender - Gender of the NPC to roll. One of 'Male', 'Female', or any other string to randomly choose a gender.
 * @param {string} profession - Profession of the NPC to roll. If empty, a random profession will be chosen.
 * @returns {object} An object containing the rolled NPC's information.
 */
export const rollDragonborn = (gender, profession) => {
  if (profession === '') profession = professions[randFl(professions.length, 0)];

  switch (gender) {
    case 'Male':
      return rollCharacter(
        {
          FName: Dragonborn_Surname,
          LName: Dragonborn_Male,
          race: 'Dragonborn',
          gender: 'Male',
          NNType: 'Child Name: ',
          NName: Dragonborn_Nickname,
          NName2: '',
        },
        profession,
      );
    case 'Female':
      return rollCharacter(
        {
          FName: Dragonborn_Surname,
          LName: Dragonborn_Female,
          race: 'Dragonborn',
          gender: 'Female',
          NNType: 'Child Name: ',
          NName: Dragonborn_Nickname,
          NName2: '',
        },
        profession,
      );
    default:
      Math.floor(Math.random() * 2) === 0
        ? rollDragonborn('Male', profession)
        : rollDragonborn('Female', profession);
  }
};

/**
 * Rolls a Dwarf NPC with a given gender and profession.
 *
 * If `gender` is 'Male' or 'Female', the NPC will be rolled with the
 * appropriate first name, last name, race, and gender. If `gender` is not
 * 'Male' or 'Female', the function will randomly choose to roll a male or
 * female NPC.
 *
 * If `profession` is an empty string, a random profession will be chosen.
 *
 * @param {string} gender - Gender of the NPC to roll. One of 'Male', 'Female', or any other string to randomly choose a gender.
 * @param {string} profession - Profession of the NPC to roll. If empty, a random profession will be chosen.
 * @returns {object} An object containing the rolled NPC's information.
 */
export const rollDwarf = (gender, profession) => {
  if (profession === '') profession = professions[randFl(professions.length, 0)];

  switch (gender) {
    case 'Male':
      return rollCharacter(
        {
          FName: Dwarf_Male,
          LName: Dwarf_Surname,
          race: 'Dwarf',
          gender: 'Male',
          NNType: '',
          NName: '',
          NName2: '',
        },
        profession,
      );
    case 'Female':
      return rollCharacter(
        {
          FName: Dwarf_Female,
          LName: Dwarf_Surname,
          race: 'Dwarf',
          gender: 'Female',
          NNType: '',
          NName: '',
          NName2: '',
        },
        profession,
      );
    default:
      Math.floor(Math.random() * 2) === 0
        ? rollDwarf('Male', profession)
        : rollDwarf('Female', profession);
  }
};

/**
 * Rolls an Elf NPC with a given gender and profession.
 *
 * If `gender` is 'Male' or 'Female', the NPC will be rolled with the
 * appropriate first name, last name, race, and gender. If `gender` is not
 * 'Male' or 'Female', the function will randomly choose to roll a male or
 * female NPC.
 *
 * If `profession` is an empty string, a random profession will be chosen.
 *
 * @param {string} gender - Gender of the NPC to roll. One of 'Male', 'Female', or any other string to randomly choose a gender.
 * @param {string} profession - Profession of the NPC to roll. If empty, a random profession will be chosen.
 * @returns {object} An object containing the rolled NPC's information.
 */
export const rollElf = (gender, profession) => {
  if (profession === '') profession = professions[randFl(professions.length, 0)];

  switch (gender) {
    case 'Male':
      return rollCharacter(
        {
          FName: Elf_Male,
          LName: Elf_Surname,
          race: 'Elf',
          gender: 'Male',
          NNType: '',
          NName: '',
          NName2: '',
        },
        profession,
      );
    case 'Female':
      return rollCharacter(
        {
          FName: Elf_Female,
          LName: Elf_Surname,
          race: 'Elf',
          gender: 'Female',
          NNType: '',
          NName: '',
          NName2: '',
        },
        profession,
      );
    default:
      Math.floor(Math.random() * 2) === 0
        ? rollElf('Male', profession)
        : rollElf('Female', profession);
  }
};

/**
 * Rolls a gnome NPC with a given gender and profession.
 *
 * If `gender` is 'Male' or 'Female', the NPC will be rolled with the
 * appropriate first name, last name, race, and gender. If `gender` is not
 * 'Male' or 'Female', the function will randomly choose to roll a male or
 * female NPC.
 *
 * If `profession` is an empty string, a random profession will be chosen.
 *
 * @param {string} gender - Gender of the NPC to roll. One of 'Male', 'Female', or any other string to randomly choose a gender.
 * @param {string} profession - Profession of the NPC to roll. If empty, a random profession will be chosen.
 * @returns {object} An object containing the rolled NPC's information.
 */
export const rollGnome = (gender, profession) => {
  if (profession === '') profession = professions[randFl(professions.length, 0)];

  switch (gender) {
    case 'Male':
      return rollCharacter(
        {
          FName: Gnome_Male,
          LName: Gnome_Surname,
          race: 'Gnome',
          gender: 'Male',
          NNType: '',
          NName: '',
          NName2: '',
        },
        profession,
      );
    case 'Female':
      return rollCharacter(
        {
          FName: Gnome_Female,
          LName: Gnome_Surname,
          race: 'Gnome',
          gender: 'Female',
          NNType: '',
          NName: '',
          NName2: '',
        },
        profession,
      );
    default:
      Math.floor(Math.random() * 2) === 0
        ? rollGnome('Male', profession)
        : rollGnome('Female', profession);
  }
};

/**
 * Rolls a Goblin NPC with a given gender and profession.
 *
 * If `gender` is 'Male' or 'Female', the NPC will be rolled with the
 * appropriate first name, last name, race, and gender. If `gender` is not
 * 'Male' or 'Female', the function will randomly choose to roll a male or
 * female NPC.
 *
 * If `profession` is an empty string, a random profession will be chosen.
 *
 * @param {string} gender - Gender of the NPC to roll. One of 'Male', 'Female', or any other string to randomly choose a gender.
 * @param {string} profession - Profession of the NPC to roll. If empty, a random profession will be chosen.
 * @returns {object} An object containing the rolled NPC's information.
 */
export const rollGoblin = (gender, profession) => {
  if (profession === '') profession = professions[randFl(professions.length, 0)];

  switch (gender) {
    case 'Male':
      return rollCharacter(
        {
          FName: GoblinNames,
          LName: GoblinNames,
          race: 'Goblin',
          gender: 'Male',
          NNType: '',
          NName: '',
          NName2: '',
        },
        profession,
      );
    case 'Female':
      return rollCharacter(
        {
          FName: GoblinNames,
          LName: GoblinNames,
          race: 'Goblin',
          gender: 'Female',
          NNType: '',
          NName: '',
          NName2: '',
        },
        profession,
      );
    default:
      Math.floor(Math.random() * 2) === 0
        ? rollGoblin('Male', profession)
        : rollGoblin('Female', profession);
  }
};

/**
 * Rolls a Goliath NPC with a given gender and profession.
 *
 * If `gender` is 'Male' or 'Female', the NPC will be rolled with the
 * appropriate first name, last name, race, and gender. If `gender` is not
 * 'Male' or 'Female', the function will randomly choose to roll a male or
 * female NPC.
 *
 * If `profession` is an empty string, a random profession will be chosen.
 *
 * @param {string} gender - Gender of the NPC to roll. One of 'Male', 'Female', or any other string to randomly choose a gender.
 * @param {string} profession - Profession of the NPC to roll. If empty, a random profession will be chosen.
 * @returns {object} An object containing the rolled NPC's information.
 */
export const rollGoliath = (gender, profession) => {
  if (profession === '') profession = professions[randFl(professions.length, 0)];

  switch (gender) {
    case 'Male':
      return rollCharacter(
        {
          FName: Goliath_Male,
          LName: Goliath_Surname,
          race: 'Goliath',
          gender: 'Male',
          NNType: 'Nickname: ',
          NName: Goliath_Nickname,
          NName2: '',
        },
        profession,
      );
    case 'Female':
      return rollCharacter(
        {
          FName: Goliath_Female,
          LName: Goliath_Surname,
          race: 'Goliath',
          gender: 'Female',
          NNType: 'Nickname: ',
          NName: Goliath_Nickname,
          NName2: '',
        },
        profession,
      );
    default:
      Math.floor(Math.random() * 2) === 0
        ? rollGoliath('Male', profession)
        : rollGoliath('Female', profession);
  }
};

/**
 * Rolls a Halfling NPC with a given gender and profession.
 *
 * If `gender` is 'Male' or 'Female', the NPC will be rolled with the
 * appropriate first name, last name, race, and gender. If `gender` is not
 * 'Male' or 'Female', the function will randomly choose to roll a male or
 * female NPC.
 *
 * If `profession` is an empty string, a random profession will be chosen.
 *
 * @param {string} gender - Gender of the NPC to roll. One of 'Male', 'Female', or any other string to randomly choose a gender.
 * @param {string} profession - Profession of the NPC to roll. If empty, a random profession will be chosen.
 * @returns {object} An object containing the rolled NPC's information.
 */
export const rollHalfling = (gender, profession) => {
  if (profession === '') profession = professions[randFl(professions.length, 0)];

  switch (gender) {
    case 'Male':
      return rollCharacter(
        {
          FName: Halfling_Male,
          LName: Halfling_Surname,
          race: 'Halfling',
          gender: 'Male',
          NNType: 'Nickname: ',
          NName: Halfling_Nickname1,
          NName2: Halfling_Nickname2,
        },
        profession,
      );
    case 'Female':
      return rollCharacter(
        {
          FName: Halfling_Female,
          LName: Halfling_Surname,
          race: 'Halfling',
          gender: 'Female',
          NNType: 'Nickname: ',
          NName: Halfling_Nickname1,
          NName2: Halfling_Nickname2,
        },
        profession,
      );
    default:
      Math.floor(Math.random() * 2) === 0
        ? rollHalfling('Male', profession)
        : rollHalfling('Female', profession);
  }
};

/**
 * Rolls a Half Elf NPC with a given gender and profession.
 *
 * If `gender` is 'Male' or 'Female', the NPC will be rolled with the
 * appropriate first name, last name, race, and gender. If `gender` is not
 * 'Male' or 'Female', the function will randomly choose to roll a male or
 * female NPC.
 *
 * If `profession` is an empty string, a random profession will be chosen.
 *
 * @param {string} gender - Gender of the NPC to roll. One of 'Male', 'Female', or any other string to randomly choose a gender.
 * @param {string} profession - Profession of the NPC to roll. If empty, a random profession will be chosen.
 * @returns {object} An object containing the rolled NPC's information.
 */
export const rollHalfElf = (gender, profession) => {
  if (profession === '') profession = professions[randFl(professions.length, 0)];

  switch (gender) {
    case 'Male':
      return rollCharacter(
        {
          FName: HalfElf_Male,
          LName: HalfElf_Surname,
          race: 'Half Elf',
          gender: 'Male',
          NNType: '',
          NName: '',
          NName2: '',
        },
        profession,
      );
    case 'Female':
      return rollCharacter(
        {
          FName: HalfElf_Female,
          LName: HalfElf_Surname,
          race: 'Half Elf',
          gender: 'Female',
          NNType: '',
          NName: '',
          NName2: '',
        },
        profession,
      );
    default:
      Math.floor(Math.random() * 2) === 0
        ? rollHalfElf('Male', profession)
        : rollHalfElf('Female', profession);
  }
};

//Lizardfolk uncommon
/**
 * Rolls a Lizardfolk NPC with a given gender and profession.
 *
 * If `gender` is 'Male' or 'Female', the NPC will be rolled with the
 * appropriate first name, last name, race, and gender. If `gender` is not
 * 'Male' or 'Female', the function will randomly choose to roll a male or
 * female NPC.
 *
 * If `profession` is an empty string, a random profession will be chosen.
 *
 * @param {string} gender - Gender of the NPC to roll. One of 'Male', 'Female', or any other string to randomly choose a gender.
 * @param {string} profession - Profession of the NPC to roll. If empty, a random profession will be chosen.
 * @returns {object} An object containing the rolled NPC's information.
 */
export const rollLizard = (gender, profession) => {
  if (profession === '') profession = professions[randFl(professions.length, 0)];

  switch (gender) {
    case 'Male':
      return rollCharacter(
        {
          FName: Lizard_Male,
          LName: Lizard_Surname,
          race: 'Lizardfolk',
          gender: 'Male',
          NNType: '',
          NName: '',
          NName2: '',
        },
        profession,
      );
    case 'Female':
      return rollCharacter(
        {
          FName: Lizard_Female,
          LName: Lizard_Surname,
          race: 'Lizardfolk',
          gender: 'Female',
          NNType: '',
          NName: '',
          NName2: '',
        },
        profession,
      );
    default:
      Math.floor(Math.random() * 2) === 0
        ? rollLizard('Male', profession)
        : rollLizard('Female', profession);
  }
};

//Orc uncommon
/**
 * Rolls a half-orc NPC with a given gender and profession.
 *
 * If `gender` is 'Male' or 'Female', the NPC will be rolled with the
 * appropriate first name, last name, race, and gender. If `gender` is not
 * 'Male' or 'Female', the function will randomly choose to roll a male or
 * female NPC.
 *
 * If `profession` is an empty string, a random profession will be chosen.
 *
 * @param {string} gender - Gender of the NPC to roll. One of 'Male', 'Female', or any other string to randomly choose a gender.
 * @param {string} profession - Profession of the NPC to roll. If empty, a random profession will be chosen.
 * @returns {object} An object containing the rolled NPC's information.
 */
export const d = (gender, profession) => {
  if (profession === '') profession = professions[randFl(professions.length, 0)];

  switch (gender) {
    case 'Male':
      return rollCharacter(
        {
          FName: OrcNames,
          LName: Orc_Surname,
          race: 'Half-Orc',
          gender: 'Male',
          NNType: '',
          NName: '',
          NName2: '',
        },
        profession,
      );
    case 'Female':
      return rollCharacter(
        {
          FName: OrcNames,
          LName: Orc_Surname,
          race: 'Half-Orc',
          gender: 'Female',
          NNType: '',
          NName: '',
          NName2: '',
        },
        profession,
      );
    default:
      Math.floor(Math.random() * 2) === 0
        ? rollOrc('Male', profession)
        : rollOrc('Female', profession);
  }
};

//Tiefling uncommon
/**
 * Rolls a Tiefling NPC with a given gender and profession.
 *
 * If `gender` is 'Male' or 'Female', the NPC will be rolled with the
 * appropriate first name, last name, race, and gender. If `gender` is not
 * 'Male' or 'Female', the function will randomly choose to roll a male or
 * female NPC.
 *
 * If `profession` is an empty string, a random profession will be chosen.
 *
 * @param {string} gender - Gender of the NPC to roll. One of 'Male', 'Female', or any other string to randomly choose a gender.
 * @param {string} profession - Profession of the NPC to roll. If empty, a random profession will be chosen.
 * @returns {object} An object containing the rolled NPC's information.
 */
export const rollTiefling = (gender, profession) => {
  if (profession === '') profession = professions[randFl(professions.length, 0)];

  switch (gender) {
    case 'Male':
      return rollCharacter(
        {
          FName: Tiefling_Male,
          LName: Tiefling_Surname,
          race: 'Tiefling',
          gender: 'Male',
          NNType: 'Virtue Name: ',
          NName: Tiefling_Nickname,
          NName2: '',
        },
        profession,
      );
    case 'Female':
      return rollCharacter(
        {
          FName: Tiefling_Female,
          LName: Tiefling_Surname,
          race: 'Tiefling',
          gender: 'Female',
          NNType: 'Virtue Name: ',
          NName: Tiefling_Nickname,
          NName2: '',
        },
        profession,
      );
    default:
      Math.floor(Math.random() * 2) === 0
        ? rollTiefling('Male', profession)
        : rollTiefling('Female', profession);
  }
};

/**
 * Rolls a random NPC with a given profession.
 *
 * If `profession` is an empty string, a random profession will be chosen.
 *
 * @param {string} profession - Profession of the NPC to roll. If empty, a random profession will be chosen.
 * @returns {object} An object containing the rolled NPC's information.
 */
export const rollRandomNPC = (profession) => {
  const rollOpts = [
    {
      FName: Human_Male,
      LName: Human_Surname,
      race: 'Human',
      gender: 'Male',
      NNType: '',
      NName: '',
      NName2: '',
    },
    {
      FName: Human_Female,
      LName: Human_Surname,
      race: 'Human',
      gender: 'Female',
      NNType: '',
      NName: '',
      NName2: '',
    },
    {
      FName: Dragonborn_Surname,
      LName: Dragonborn_Male,
      race: 'Dragonborn',
      gender: 'Male',
      NNType: 'Child Name: ',
      NName: Dragonborn_Nickname,
      NName2: '',
    },
    {
      FName: Dragonborn_Surname,
      LName: Dragonborn_Female,
      race: 'Dragonborn',
      gender: 'Female',
      NNType: 'Child Name: ',
      NName: Dragonborn_Nickname,
      NName2: '',
    },
    {
      FName: Dwarf_Male,
      LName: Dwarf_Surname,
      race: 'Dwarf',
      gender: 'Male',
      NNType: '',
      NName: '',
      NName2: '',
    },
    {
      FName: Dwarf_Female,
      LName: Dwarf_Surname,
      race: 'Dwarf',
      gender: 'Female',
      NNType: '',
      NName: '',
      NName2: '',
    },
    {
      FName: Elf_Male,
      LName: Elf_Surname,
      race: 'Elf',
      gender: 'Male',
      NNType: '',
      NName: '',
      NName2: '',
    },
    {
      FName: Elf_Female,
      LName: Elf_Surname,
      race: 'Elf',
      gender: 'Female',
      NNType: '',
      NName: '',
      NName2: '',
    },
    {
      FName: Gnome_Male,
      LName: Gnome_Surname,
      race: 'Gnome',
      gender: 'Male',
      NNType: '',
      NName: '',
      NName2: '',
    },
    {
      FName: Gnome_Female,
      LName: Gnome_Surname,
      race: 'Gnome',
      gender: 'Female',
      NNType: '',
      NName: '',
      NName2: '',
    },
    {
      FName: GoblinNames,
      LName: GoblinNames,
      race: 'Goblin',
      gender: 'Male',
      NNType: '',
      NName: '',
      NName2: '',
    },
    {
      FName: GoblinNames,
      LName: GoblinNames,
      race: 'Goblin',
      gender: 'Female',
      NNType: '',
      NName: '',
      NName2: '',
    },
    {
      FName: Goliath_Male,
      LName: Goliath_Surname,
      race: 'Goliath',
      gender: 'Male',
      NNType: 'Nickname: ',
      NName: Goliath_Nickname,
      NName2: '',
    },
    {
      FName: Goliath_Female,
      LName: Goliath_Surname,
      race: 'Goliath',
      gender: 'Female',
      NNType: 'Nickname: ',
      NName: Goliath_Nickname,
      NName2: '',
    },
    {
      FName: Halfling_Male,
      LName: Halfling_Surname,
      race: 'Halfling',
      gender: 'Male',
      NNType: 'Nickname: ',
      NName: Halfling_Nickname1,
      NName2: Halfling_Nickname2,
    },
    {
      FName: Halfling_Female,
      LName: Halfling_Surname,
      race: 'Halfling',
      gender: 'Female',
      NNType: 'Nickname: ',
      NName: Halfling_Nickname1,
      NName2: Halfling_Nickname2,
    },
    {
      FName: HalfElf_Male,
      LName: HalfElf_Surname,
      race: 'Half Elf',
      gender: 'Male',
      NNType: '',
      NName: '',
      NName2: '',
    },
    {
      FName: HalfElf_Female,
      LName: HalfElf_Surname,
      race: 'Half Elf',
      gender: 'Female',
      NNType: '',
      NName: '',
      NName2: '',
    },
    {
      FName: Lizard_Male,
      LName: Lizard_Surname,
      race: 'Lizardfolk',
      gender: 'Male',
      NNType: '',
      NName: '',
      NName2: '',
    },
    {
      FName: Lizard_Female,
      LName: Lizard_Surname,
      race: 'Lizardfolk',
      gender: 'Female',
      NNType: '',
      NName: '',
      NName2: '',
    },
    {
      FName: OrcNames,
      LName: Orc_Surname,
      race: 'Half-Orc',
      gender: 'Male',
      NNType: '',
      NName: '',
      NName2: '',
    },
    {
      FName: OrcNames,
      LName: Orc_Surname,
      race: 'Half-Orc',
      gender: 'Female',
      NNType: '',
      NName: '',
      NName2: '',
    },
    {
      FName: Tiefling_Male,
      LName: Tiefling_Surname,
      race: 'Tiefling',
      gender: 'Male',
      NNType: 'Virtue Name: ',
      NName: Tiefling_Nickname,
      NName2: '',
    },
    {
      FName: Tiefling_Female,
      LName: Tiefling_Surname,
      race: 'Tiefling',
      gender: 'Female',
      NNType: 'Virtue Name: ',
      NName: Tiefling_Nickname,
      NName2: '',
    },
  ];

  let rNPC = Math.floor(Math.random() * rollOpts.length);
  if (profession === '') {
    console.log(JSON.stringify(professions));
    profession = professions[randFl(professions.length, 0)];
  }
  return rollCharacter(rollOpts[rNPC], profession);
};
