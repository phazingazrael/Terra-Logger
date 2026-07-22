//  **********************************************
//  *    A systems agnostic RPG NPC Generator.   *
//  *           Created by Shuggaloaf            *
//  *  Reddit: u/shuggaloaf; Discord: Earl#7716  *
//  **********************************************
//  *    This has been modified to work with     *
//  *    the Terra-Logger project.               *
//  **********************************************

import type { GeneratedNPC } from "./types";

//  ***********************************
//  *           NAMES LISTS           *
//  *  EXTRACTED TO INDIVIDUAL FILES  *
//  ***********************************

import DKFemale from "./names/dragonkin.f.json";
import DKSurname from "./names/dragonkin.last.json";
import DKMale from "./names/dragonkin.m.json";
import DKNickname from "./names/dragonkin.nick.json";
import DwFemale from "./names/dwarf.f.json";
import DwSurname from "./names/dwarf.last.json";
import DwMale from "./names/dwarf.m.json";
import ElfFemale from "./names/elf.f.json";
import ElfSurname from "./names/elf.last.json";
import ElfMale from "./names/elf.m.json";
import GnomeFemale from "./names/gnome.f.json";
import GnomeSurname from "./names/gnome.last.json";
import GnomeMale from "./names/gnome.m.json";
import Goblin from "./names/goblin.json";
import GiantFemale from "./names/giant.f.json";
import GiantSurname from "./names/giant.last.json";
import GiantMale from "./names/giant.m.json";
import GiantNick from "./names/giant.nick.json";
import HalfelfFemale from "./names/halfelf.f.json";
import HalfelfSurname from "./names/halfelf.last.json";
import HalfelfMale from "./names/halfelf.m.json";
import HalflingNick1 from "./names/halfling.1.json";
import HalflingNick2 from "./names/halfling.2.json";
import HalflingFemale from "./names/halfling.f.json";
import HalflingSurname from "./names/halfling.last.json";
import HalflingMale from "./names/halfling.m.json";
import HumanFemale from "./names/human.f.json";
import HumanSurname from "./names/human.last.json";
import HumanMale from "./names/human.m.json";
import Lizardfolk_Male from "./names/lizard.m.json";
import Lizardfolk_Female from "./names/lizard.f.json";
import Lizardfolk_Surname from "./names/lizard.last.json";
import Orc from "./names/orc.json";
import OrcSurname from "./names/orc.last.json";
import TiefFemale from "./names/tief.f.json";
import TiefSurname from "./names/tief.last.json";
import TiefMale from "./names/tief.m.json";
import TiefNickname from "./names/tief.nick.json";

//***********************************
//*      CHARACTERISTICS LISTS      *
//*  EXTRACTED TO INDIVIDUAL FILES  *
//***********************************
import Activities from "./details/activities.json";
import Build from "./details/build.json";
import Complexion from "./details/complexion.json";
import Demeanor from "./details/demeanor.json";
import Descriptors1 from "./details/descriptor.1.json";
import Descriptors2 from "./details/descriptor.2.json";
import Descriptors3 from "./details/descriptor.3.json";
import Dragonkin from "./details/dragonkin.json";
import EyeColor from "./details/eye.color.1.json";
import EyeColor2 from "./details/eye.color.2.json";
import EyeColor3 from "./details/eye.color.3.json";
import EyeShape from "./details/eye.shape.json";
import HairColor from "./details/hair.color.json";
import FacialHair from "./details/hair.face.json";
import HairStyle from "./details/hair.style.json";
import Height from "./details/height.json";
import Lizard from "./details/lizard.json";
import OrcGob from "./details/orcgob.json";
import SkinTone from "./details/skin.json";
import Demonkin from "./details/demonkin.json";

//***********************************
//*       PROFFESSIONS LISTS        *
//*  EXTRACTED TO INDIVIDUAL FILES  *
//***********************************\
// import GovProfessions from "./professions/government.json";
import ProfessionDescriptions from "./professions/profession.desc.json";
import Professions from "./professions/profession.json";

//***********************************
//*      NAMES LISTS                  *
//***********************************
const Dragonkin_Female = DKFemale as string[];
const Dragonkin_Male = DKMale as string[];
const Dragonkin_Nickname = DKNickname as string[];
const Dragonkin_Surname = DKSurname as string[];
const Dwarf_Female = DwFemale as string[];
const Dwarf_Male = DwMale as string[];
const Dwarf_Surname = DwSurname as string[];
const Elf_Female = ElfFemale as string[];
const Elf_Male = ElfMale as string[];
const Elf_Surname = ElfSurname as string[];
const Gnome_Female = GnomeFemale as string[];
const Gnome_Male = GnomeMale as string[];
const Gnome_Surname = GnomeSurname as string[];
const GoblinNames = Goblin as string[];
const Giant_Female = GiantFemale as string[];
const Giant_Male = GiantMale as string[];
const Giant_Nickname = GiantNick as string[];
const Giant_Surname = GiantSurname as string[];
const HalfElf_Female = HalfelfFemale as string[];
const HalfElf_Male = HalfelfMale as string[];
const HalfElf_Surname = HalfelfSurname as string[];
const Halfling_Female = HalflingFemale as string[];
const Halfling_Male = HalflingMale as string[];
const Halfling_Nickname1 = HalflingNick1 as string[];
const Halfling_Nickname2 = HalflingNick2 as string[];
const Halfling_Surname = HalflingSurname as string[];
const Human_Female = HumanFemale as string[];
const Human_Male = HumanMale as string[];
const Human_Surname = HumanSurname as string[];
const Lizard_Female = Lizardfolk_Female as string[];
const Lizard_Male = Lizardfolk_Male as string[];
const Lizard_Surname = Lizardfolk_Surname as string[];
const Orc_Surname = OrcSurname as string[];
const OrcNames = Orc as string[];
const Demonkin_Female = TiefFemale as string[];
const Demonkin_Male = TiefMale as string[];
const Demonkin_Nickname = TiefNickname as string[];
const Demonkin_Surname = TiefSurname as string[];

//***********************************
//*  CHARACTERISTICS LISTS          *
//***********************************

const activities = Activities;
const build = Build;
const complexion = Complexion;
const demeanor = Demeanor;
const descriptors1 = Descriptors1;
const descriptors2 = Descriptors2;
const descriptors3 = Descriptors3;
const dragonkin = Dragonkin;
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
const demonkin = Demonkin;

//***********************************
//*  PROFESSIONS LISTS              *
//***********************************
const professions = Professions;
const professionDescriptions = ProfessionDescriptions;
// const govProfessions = GovProfessions;
// needs to have profession descriptions matched to 'rulers'

type NPC = {
    FName: string[];
    LName: string[];
    race: string;
    gender: string;
    NNType: string;
    NName: string;
    NName2: string
}

type NPCRarity = "common" | "uncommon";

type RandomNPCOption = NPC & {
    rarity: NPCRarity;
};

const rarityWeights: Record<NPCRarity, number> = {
    common: 4,
    uncommon: 1,
};

const randFloor = (x: number, y: number) => {
    return Math.floor(Math.random() * x) + y;
};


const getProfessionDescription = (profession: string) => {
    return professionDescriptions[profession as keyof typeof professionDescriptions];
}

const getWeightedRandomOption = (
    options: readonly RandomNPCOption[],
): RandomNPCOption => {
    if (options.length === 0) {
        throw new Error("Cannot select an NPC from an empty options array.");
    }

    const totalWeight = options.reduce(
        (total, option) => total + rarityWeights[option.rarity],
        0,
    );

    let roll = Math.random() * totalWeight;

    for (const option of options) {
        roll -= rarityWeights[option.rarity];

        if (roll < 0) {
            return option;
        }
    }

    // Floating-point safety fallback
    return options[options.length - 1];
};

async function generateNPC(
    characterDetails: NPC,
    Profession: string,
): Promise<GeneratedNPC> {
    const {
        FName,
        LName,
        race,
        gender,
        NNType,
        NName,
        NName2
    } = characterDetails;

    const npcOpts = {
        randEye: randFloor(100, 1),
        randDescription: randFloor(100, 1),
        randHeight: randFloor(100, 1),
        txtFirstName: FName[randFloor(FName.length, 0)],
        txtLastName: LName[randFloor(LName.length, 0)],
        txtNick1: "",
        txtNick2: "",
        txtNickname: "",
        txtClan: "",
        txtBuild: build[randFloor(build.length, 0)],
        txtTone: skinTone[randFloor(skinTone.length, 0)],
        txtComp: complexion[randFloor(complexion.length, 0)],
        txtHairStyle: hairStyle[randFloor(hairStyle.length, 0)],
        txtHairColor: hairColor[randFloor(hairColor.length, 0)],
        txtEyeShape: eyeShape[randFloor(eyeShape.length, 0)],
        txtDemeanor: demeanor[randFloor(demeanor.length, 0)],
        txtProfession: "",
        txtProfDesc: "",
        txtActivities: activities[randFloor(activities.length, 0)],
        txtDescriptors: "",
        txtHeight: height[randFloor(height.length, 0)],
        txtFacialHair: "",
        txtEyeColor: eyeColor[randFloor(eyeColor.length, 0)],
    }

    // Generate Names based off race?

    // Height
    if (npcOpts.randHeight < 20 || npcOpts.randHeight > 80) {
        npcOpts.txtHeight = height[randFloor(height.length, 0)];
    } else {
        npcOpts.txtHeight = "Average Height";
    }

    // Descriptors Rarity
    if (npcOpts.randDescription >= 90) {
        npcOpts.txtDescriptors = descriptors3[randFloor(descriptors3.length, 0)];
    } else if (npcOpts.randDescription >= 65) {
        npcOpts.txtDescriptors = descriptors2[randFloor(descriptors1.length, 0)];
    } else {
        npcOpts.txtDescriptors = descriptors1[randFloor(descriptors2.length, 0)];
    }

    // Facial Hair
    if (gender === "Female" && race === "Dwarf") {
        npcOpts.txtFacialHair = facialHair[randFloor(facialHair.length, 0)];
    } else if (gender === "Male") {
        npcOpts.txtFacialHair = facialHair[randFloor(facialHair.length, 0)];
    } else {
        npcOpts.txtFacialHair = "None";
    }

    if (race === "Dragonkin" || race === "Goblin" || race === "Lizardfolk" || race === "Elf") {
        npcOpts.txtFacialHair = "None";
        npcOpts.txtDescriptors
            .replace("Very hairy", "Exceptionally Average")
            .replace("One hell of a mustache", "Exceptionally Average");

    }
    if (race === "Dwarf") npcOpts.txtFacialHair = npcOpts.txtFacialHair.replace("Clean-Shaven", "Long, Braided Beard")

    // Eye Color Rarity
    if (npcOpts.randEye >= 90) {
        npcOpts.txtEyeColor = eyeColor3[randFloor(eyeColor3.length, 0)];
    } else if (npcOpts.randEye <= 65) {
        npcOpts.txtEyeColor = eyeColor[randFloor(eyeColor.length, 0)];
    } else {
        npcOpts.txtEyeColor = eyeColor2[randFloor(eyeColor2.length, 0)];
    }

    // Tone
    if (race === "Goblin" || race === "Half-Orc" || race === "Orc") {
        npcOpts.txtTone = orcGob[randFloor(orcGob.length, 0)];
    } else if (race === "Dragonkin") {
        npcOpts.txtTone = dragonkin[randFloor(dragonkin.length, 0)];
        npcOpts.txtComp = "Scaled";
    } else if (race === "Lizardfolk") {
        npcOpts.txtTone = lizard[randFloor(lizard.length, 0)];
        npcOpts.txtComp = "Scaled";
    } else if (race === "Demonkin") {
        const randTief = randFloor(demonkin.length, 0);
        if (randTief > 4) {
            npcOpts.txtTone = demonkin[randFloor(demonkin.length, 0)];
        } else {
            npcOpts.txtTone = skinTone[randFloor(skinTone.length, 0)];
        }
    }

    // Nickname
    if (race === "Halfling") {
        npcOpts.txtNick1 = NName[randFloor(NName.length, 0)];
        npcOpts.txtNick2 = NName2[randFloor(NName2.length, 0)];
        npcOpts.txtNickname = `${NNType} ${npcOpts.txtNick1} ${npcOpts.txtNick2}`;
    } else if (race === "Dragonkin") {
        npcOpts.txtNick1 = NName[randFloor(NName.length, 0)];
        npcOpts.txtNickname = `${NNType} ${npcOpts.txtNick1}`;
        npcOpts.txtClan = "*Dragonkin display their clan name first. The 'Child Name' is a nickname earned as a child.";
    } else if (race === "Giant") {
        npcOpts.txtNick1 = NName[randFloor(NName.length, 0)];
        npcOpts.txtNickname = `${NNType} ${npcOpts.txtNick1}`;
        npcOpts.txtClan = "*Giant display their Clan name last.";
    }

    // If Bald/Shaved we want to add "eyebrow" before the hair color
    if (npcOpts.txtHairStyle === "Bald" || npcOpts.txtHairStyle === "Shaved") {
        npcOpts.txtHairColor = `Eyebrow ${npcOpts.txtHairColor}`;
    }

    // Hair Handling
    if (race === "Dragonkin" || race === "Lizardfolk") {
        npcOpts.txtHairStyle = "None";
        npcOpts.txtHairColor = "None";

    }

    // Profession Handling
    if (Profession === "Apprentice<br>(Roll again for profession)" || Profession === "Journeyman<br>(Roll again for profession)") {

        if (Profession === "Apprentice<br>(Roll again for profession)") {
            Profession = "Apprentice";
        } else if (Profession === "Journeyman<br>(Roll again for profession)") {
            Profession = "Journeyman";
        }

        const baseProfession =
            professions[randFloor(professions.length, 0)];

        npcOpts.txtProfession =
            `${baseProfession} (${Profession})`;

        npcOpts.txtProfDesc =
            `${getProfessionDescription(Profession)} ` +
            `${getProfessionDescription(baseProfession)}`;
    } else if (Profession) {
        npcOpts.txtProfession = Profession;
        npcOpts.txtProfDesc =
            getProfessionDescription(Profession) ?? "";
    } else {
        npcOpts.txtProfession =
            professions[randFloor(professions.length, 0)];

        npcOpts.txtProfDesc =
            getProfessionDescription(npcOpts.txtProfession) ?? "";
    }

    const npc = {
        fullName: `${npcOpts.txtFirstName} ${npcOpts.txtLastName}`,
        nickName: npcOpts.txtNickname,
        race: race,
        gender: gender,
        profession: {
            title: npcOpts.txtProfession,
            description: npcOpts.txtProfDesc,
        },
        build: `${npcOpts.txtHeight} and ${npcOpts.txtBuild}`,
        skin: {
            tone: npcOpts.txtTone,
            comp: npcOpts.txtComp,
        },
        eye: {
            shape: npcOpts.txtEyeShape,
            color: npcOpts.txtEyeColor,
        },
        hair: {
            style: npcOpts.txtHairStyle,
            color: npcOpts.txtHairColor,
            facial: npcOpts.txtFacialHair,
        },
        descriptors: npcOpts.txtDescriptors,
        demeanor: npcOpts.txtDemeanor,
        activities: npcOpts.txtActivities,
        clan: npcOpts.txtClan,
    };

    console.log("Generated NPC:", npc);
    return npc;
}

// Human: Common
export const generateHuman = (gender: string, profession: string) => {
    if (profession === "") profession = professions[randFloor(professions.length, 0)];
    switch (gender) {
        case 'Male':
            return generateNPC(
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
            return generateNPC(
                {
                    FName: Human_Female,
                    LName: Human_Surname,
                    race: 'Human',
                    gender: 'Male',
                    NNType: '',
                    NName: '',
                    NName2: '',
                },
                profession,
            );
        default:
            Math.floor(Math.random() * 2) === 0 ?
                generateNPC(
                    {
                        FName: Human_Male,
                        LName: Human_Surname,
                        race: 'Human',
                        gender: "Male",
                        NNType: '',
                        NName: '',
                        NName2: '',
                    },
                    profession,
                ) : generateNPC(
                    {
                        FName: Human_Female,
                        LName: Human_Surname,
                        race: 'Human',
                        gender: "Female",
                        NNType: '',
                        NName: '',
                        NName2: '',
                    },
                    profession,
                );
    }
}

// Dragonkin: Uncommon
export const generateDragonkin = (gender: string, profession: string) => {
    if (profession === "") profession = professions[randFloor(professions.length, 0)];
    switch (gender) {
        case 'Male':
            return generateNPC(
                {
                    FName: Dragonkin_Surname,
                    LName: Dragonkin_Male,
                    race: 'Dragonkin',
                    gender: 'Male',
                    NNType: 'Child Name: ',
                    NName: Dragonkin_Nickname[randFloor(Dragonkin_Nickname.length, 0)],
                    NName2: '',
                },
                profession,
            );
        case 'Female':
            return generateNPC(
                {
                    FName: Dragonkin_Surname,
                    LName: Dragonkin_Female,
                    race: 'Dragonkin',
                    gender: 'Female',
                    NNType: 'Child Name: ',
                    NName: Dragonkin_Nickname[randFloor(Dragonkin_Nickname.length, 0)],
                    NName2: '',
                },
                profession,
            );
        default:
            Math.floor(Math.random() * 2) === 0 ?
                generateNPC(
                    {
                        FName: Dragonkin_Male,
                        LName: Dragonkin_Surname,
                        race: 'Dragonkin',
                        gender: "Male",
                        NNType: '',
                        NName: '',
                        NName2: '',
                    },
                    profession,
                ) : generateNPC(
                    {
                        FName: Dragonkin_Female,
                        LName: Dragonkin_Surname,
                        race: 'Dragonkin',
                        gender: "Female",
                        NNType: '',
                        NName: '',
                        NName2: '',
                    },
                    profession,
                );
    }
}

// Dwarf: Common
export const generateDwarf = (gender: string, profession: string) => {
    if (profession === "") profession = professions[randFloor(professions.length, 0)];
    switch (gender) {
        case 'Male':
            return generateNPC(
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
            return generateNPC(
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
            Math.floor(Math.random() * 2) === 0 ?
                generateNPC(
                    {
                        FName: Dwarf_Male,
                        LName: Dwarf_Surname,
                        race: 'Dwarf',
                        gender: "Male",
                        NNType: '',
                        NName: '',
                        NName2: '',
                    },
                    profession,
                ) : generateNPC(
                    {
                        FName: Dwarf_Female,
                        LName: Dwarf_Surname,
                        race: 'Dwarf',
                        gender: "Female",
                        NNType: '',
                        NName: '',
                        NName2: '',
                    },
                    profession,
                );
    }
}

// Elf: Common
export const generateElf = (gender: string, profession: string) => {
    if (profession === "") profession = professions[randFloor(professions.length, 0)];
    switch (gender) {
        case 'Male':
            return generateNPC(
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
            return generateNPC(
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
            Math.floor(Math.random() * 2) === 0 ?
                generateNPC(
                    {
                        FName: Elf_Male,
                        LName: Elf_Surname,
                        race: 'Elf',
                        gender: "Male",
                        NNType: '',
                        NName: '',
                        NName2: '',
                    },
                    profession,
                ) : generateNPC(
                    {
                        FName: Elf_Female,
                        LName: Elf_Surname,
                        race: 'Elf',
                        gender: "Female",
                        NNType: '',
                        NName: '',
                        NName2: '',
                    },
                    profession,
                );
    }
}

// Gnome: Common
export const generateGnome = (gender: string, profession: string) => {
    if (profession === "") profession = professions[randFloor(professions.length, 0)];
    switch (gender) {
        case 'Male':
            return generateNPC(
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
            return generateNPC(
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
            Math.floor(Math.random() * 2) === 0 ?
                generateNPC(
                    {
                        FName: Gnome_Male,
                        LName: Gnome_Surname,
                        race: 'Gnome',
                        gender: "Male",
                        NNType: '',
                        NName: '',
                        NName2: '',
                    },
                    profession,
                ) : generateNPC(
                    {
                        FName: Gnome_Female,
                        LName: Gnome_Surname,
                        race: 'Gnome',
                        gender: "Female",
                        NNType: '',
                        NName: '',
                        NName2: '',
                    },
                    profession,
                );
    }
}

// Goblin: Uncommon
export const generateGoblin = (gender: string, profession: string) => {
    if (profession === "") profession = professions[randFloor(professions.length, 0)];
    switch (gender) {
        case 'Male':
            return generateNPC(
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
            return generateNPC(
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
            Math.floor(Math.random() * 2) === 0 ?
                generateNPC(
                    {
                        FName: GoblinNames,
                        LName: GoblinNames,
                        race: 'Goblin',
                        gender: "Male",
                        NNType: '',
                        NName: '',
                        NName2: '',
                    },
                    profession,
                ) : generateNPC(
                    {
                        FName: GoblinNames,
                        LName: GoblinNames,
                        race: 'Goblin',
                        gender: "Female",
                        NNType: '',
                        NName: '',
                        NName2: '',
                    },
                    profession,
                );
    }
}

// Giant: Uncommon
export const generateGiant = (gender: string, profession: string) => {
    if (profession === "") profession = professions[randFloor(professions.length, 0)];
    switch (gender) {
        case 'Male':
            return generateNPC(
                {
                    FName: Giant_Male,
                    LName: Giant_Surname,
                    race: 'Giant',
                    gender: 'Male',
                    NNType: '',
                    NName: '',
                    NName2: '',
                },
                profession,
            );
        case 'Female':
            return generateNPC(
                {
                    FName: Giant_Female,
                    LName: Giant_Surname,
                    race: 'Giant',
                    gender: 'Female',
                    NNType: '',
                    NName: '',
                    NName2: '',
                },
                profession,
            );
        default:
            Math.floor(Math.random() * 2) === 0 ?
                generateNPC(
                    {
                        FName: Giant_Male,
                        LName: Giant_Surname,
                        race: 'Giant',
                        gender: "Male",
                        NNType: '',
                        NName: '',
                        NName2: '',
                    },
                    profession,
                ) : generateNPC(
                    {
                        FName: Giant_Female,
                        LName: Giant_Surname,
                        race: 'Giant',
                        gender: "Female",
                        NNType: '',
                        NName: '',
                        NName2: '',
                    },
                    profession,
                );
    }
}

// Halfling: Common
export const generateHalfling = (gender: string, profession: string) => {
    if (profession === "") profession = professions[randFloor(professions.length, 0)];
    switch (gender) {
        case 'Male':
            return generateNPC(
                {
                    FName: Halfling_Male,
                    LName: Halfling_Surname,
                    race: 'Halfling',
                    gender: 'Male',
                    NNType: '',
                    NName: '',
                    NName2: '',
                },
                profession,
            );
        case 'Female':
            return generateNPC(
                {
                    FName: Halfling_Female,
                    LName: Halfling_Surname,
                    race: 'Halfling',
                    gender: 'Female',
                    NNType: '',
                    NName: '',
                    NName2: '',
                },
                profession,
            );
        default:
            Math.floor(Math.random() * 2) === 0 ?
                generateNPC(
                    {
                        FName: Halfling_Male,
                        LName: Halfling_Surname,
                        race: 'Halfling',
                        gender: "Male",
                        NNType: '',
                        NName: '',
                        NName2: '',
                    },
                    profession,
                ) : generateNPC(
                    {
                        FName: Halfling_Female,
                        LName: Halfling_Surname,
                        race: 'Halfling',
                        gender: "Female",
                        NNType: '',
                        NName: '',
                        NName2: '',
                    },
                    profession,
                );
    }
}

// HalfElf: Common
export const generateHalfElf = (gender: string, profession: string) => {
    if (profession === "") profession = professions[randFloor(professions.length, 0)];
    switch (gender) {
        case 'Male':
            return generateNPC(
                {
                    FName: HalfElf_Male,
                    LName: HalfElf_Surname,
                    race: 'HalfElf',
                    gender: 'Male',
                    NNType: '',
                    NName: '',
                    NName2: '',
                },
                profession,
            );
        case 'Female':
            return generateNPC(
                {
                    FName: HalfElf_Female,
                    LName: HalfElf_Surname,
                    race: 'HalfElf',
                    gender: 'Female',
                    NNType: '',
                    NName: '',
                    NName2: '',
                },
                profession,
            );
        default:
            Math.floor(Math.random() * 2) === 0 ?
                generateNPC(
                    {
                        FName: HalfElf_Male,
                        LName: HalfElf_Surname,
                        race: 'HalfElf',
                        gender: "Male",
                        NNType: '',
                        NName: '',
                        NName2: '',
                    },
                    profession,
                ) : generateNPC(
                    {
                        FName: HalfElf_Female,
                        LName: HalfElf_Surname,
                        race: 'HalfElf',
                        gender: "Female",
                        NNType: '',
                        NName: '',
                        NName2: '',
                    },
                    profession,
                );
    }
}

// Lizardfolk: Uncommon
export const generateLizardFolk = (gender: string, profession: string) => {
    if (profession === "") profession = professions[randFloor(professions.length, 0)];
    switch (gender) {
        case 'Male':
            return generateNPC(
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
            return generateNPC(
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
            Math.floor(Math.random() * 2) === 0 ?
                generateNPC(
                    {
                        FName: Lizard_Male,
                        LName: Lizard_Surname,
                        race: 'Lizardfolk',
                        gender: "Male",
                        NNType: '',
                        NName: '',
                        NName2: '',
                    },
                    profession,
                ) : generateNPC(
                    {
                        FName: Lizard_Female,
                        LName: Lizard_Surname,
                        race: 'Lizardfolk',
                        gender: "Female",
                        NNType: '',
                        NName: '',
                        NName2: '',
                    },
                    profession,
                );
    }
}

// Orc: Uncommon
export const generateOrc = (gender: string, profession: string) => {
    if (profession === "") profession = professions[randFloor(professions.length, 0)];
    switch (gender) {
        case 'Male':
            return generateNPC(
                {
                    FName: OrcNames,
                    LName: Orc_Surname,
                    race: 'Orc',
                    gender: 'Male',
                    NNType: '',
                    NName: '',
                    NName2: '',
                },
                profession,
            );
        case 'Female':
            return generateNPC(
                {
                    FName: OrcNames,
                    LName: Orc_Surname,
                    race: 'Orc',
                    gender: 'Female',
                    NNType: '',
                    NName: '',
                    NName2: '',
                },
                profession,
            );
        default:
            Math.floor(Math.random() * 2) === 0 ?
                generateNPC(
                    {
                        FName: OrcNames,
                        LName: Orc_Surname,
                        race: 'Orc',
                        gender: "Male",
                        NNType: '',
                        NName: '',
                        NName2: '',
                    },
                    profession,
                ) : generateNPC(
                    {
                        FName: OrcNames,
                        LName: Orc_Surname,
                        race: 'Orc',
                        gender: "Female",
                        NNType: '',
                        NName: '',
                        NName2: '',
                    },
                    profession,
                );
    }
}

// Half-Orc: Uncommon
export const generateHalfOrc = (gender: string, profession: string) => {
    if (profession === "") profession = professions[randFloor(professions.length, 0)];
    switch (gender) {
        case 'Male':
            return generateNPC(
                {
                    FName: OrcNames,
                    LName: Orc_Surname,
                    race: 'HalfOrc',
                    gender: 'Male',
                    NNType: '',
                    NName: '',
                    NName2: '',
                },
                profession,
            );
        case 'Female':
            return generateNPC(
                {
                    FName: OrcNames,
                    LName: Orc_Surname,
                    race: 'HalfOrc',
                    gender: 'Female',
                    NNType: '',
                    NName: '',
                    NName2: '',
                },
                profession,
            );
        default:
            Math.floor(Math.random() * 2) === 0 ?
                generateNPC(
                    {
                        FName: OrcNames,
                        LName: Orc_Surname,
                        race: 'HalfOrc',
                        gender: "Male",
                        NNType: '',
                        NName: '',
                        NName2: '',
                    },
                    profession,
                ) : generateNPC(
                    {
                        FName: OrcNames,
                        LName: Orc_Surname,
                        race: 'HalfOrc',
                        gender: "Female",
                        NNType: '',
                        NName: '',
                        NName2: '',
                    },
                    profession,
                );
    }
}

// Demonkin: Uncommon
export const generateDemonkin = (gender: string, profession: string) => {
    if (profession === "") profession = professions[randFloor(professions.length, 0)];
    switch (gender) {
        case 'Male':
            return generateNPC(
                {
                    FName: Demonkin_Male,
                    LName: Demonkin_Surname,
                    race: 'Demonkin',
                    gender: 'Male',
                    NNType: '',
                    NName: '',
                    NName2: '',
                },
                profession,
            );
        case 'Female':
            return generateNPC(
                {
                    FName: Demonkin_Female,
                    LName: Demonkin_Surname,
                    race: 'Demonkin',
                    gender: 'Female',
                    NNType: '',
                    NName: '',
                    NName2: '',
                },
                profession,
            );
        default:
            Math.floor(Math.random() * 2) === 0 ?
                generateNPC(
                    {
                        FName: Demonkin_Male,
                        LName: Demonkin_Surname,
                        race: 'Demonkin',
                        gender: "Male",
                        NNType: '',
                        NName: '',
                        NName2: '',
                    },
                    profession,
                ) : generateNPC(
                    {
                        FName: Demonkin_Female,
                        LName: Demonkin_Surname,
                        race: 'Demonkin',
                        gender: "Female",
                        NNType: '',
                        NName: '',
                        NName2: '',
                    },
                    profession,
                );
    }
}

export const generateRandomNPC = (profession: string) => {
    const rollOpts: RandomNPCOption[] = [
        {
            FName: Human_Male,
            LName: Human_Surname,
            race: 'Human',
            gender: 'Male',
            NNType: '',
            NName: '',
            NName2: '',
            rarity: 'common',
        },
        {
            FName: Human_Female,
            LName: Human_Surname,
            race: 'Human',
            gender: 'Female',
            NNType: '',
            NName: '',
            NName2: '',
            rarity: 'common',
        },
        {
            FName: Dragonkin_Surname,
            LName: Dragonkin_Male,
            race: 'Dragonkin',
            gender: 'Male',
            NNType: 'Child Name: ',
            NName: Dragonkin_Nickname[randFloor(Dragonkin_Nickname.length, 0)],
            NName2: '',
            rarity: 'uncommon',
        },
        {
            FName: Dragonkin_Surname,
            LName: Dragonkin_Female,
            race: 'Dragonkin',
            gender: 'Female',
            NNType: 'Child Name: ',
            NName: Dragonkin_Nickname[randFloor(Dragonkin_Nickname.length, 0)],
            NName2: '',
            rarity: 'uncommon',
        },
        {
            FName: Dwarf_Male,
            LName: Dwarf_Surname,
            race: 'Dwarf',
            gender: 'Male',
            NNType: '',
            NName: '',
            NName2: '',
            rarity: 'common',
        },
        {
            FName: Dwarf_Female,
            LName: Dwarf_Surname,
            race: 'Dwarf',
            gender: 'Female',
            NNType: '',
            NName: '',
            NName2: '',
            rarity: 'common',
        },
        {
            FName: Elf_Male,
            LName: Elf_Surname,
            race: 'Elf',
            gender: 'Male',
            NNType: '',
            NName: '',
            NName2: '',
            rarity: 'common',
        },
        {
            FName: Elf_Female,
            LName: Elf_Surname,
            race: 'Elf',
            gender: 'Female',
            NNType: '',
            NName: '',
            NName2: '',
            rarity: 'common',
        },
        {
            FName: Gnome_Male,
            LName: Gnome_Surname,
            race: 'Gnome',
            gender: 'Male',
            NNType: '',
            NName: '',
            NName2: '',
            rarity: 'common',
        },
        {
            FName: Gnome_Female,
            LName: Gnome_Surname,
            race: 'Gnome',
            gender: 'Female',
            NNType: '',
            NName: '',
            NName2: '',
            rarity: 'common',
        },
        {
            FName: GoblinNames,
            LName: GoblinNames,
            race: 'Goblin',
            gender: 'Male',
            NNType: '',
            NName: '',
            NName2: '',
            rarity: 'uncommon',
        },
        {
            FName: GoblinNames,
            LName: GoblinNames,
            race: 'Goblin',
            gender: 'Female',
            NNType: '',
            NName: '',
            NName2: '',
            rarity: 'uncommon',
        },
        {
            FName: Giant_Male,
            LName: Giant_Surname,
            race: 'Giant',
            gender: 'Male',
            NNType: 'Nickname: ',
            NName: Giant_Nickname[randFloor(Giant_Nickname.length, 0)],
            NName2: '',
            rarity: 'uncommon',
        },
        {
            FName: Giant_Female,
            LName: Giant_Surname,
            race: 'Giant',
            gender: 'Female',
            NNType: 'Nickname: ',
            NName: Giant_Nickname[randFloor(Giant_Nickname.length, 0)],
            NName2: '',
            rarity: 'uncommon',
        },
        {
            FName: Halfling_Male,
            LName: Halfling_Surname,
            race: 'Halfling',
            gender: 'Male',
            NNType: 'Nickname: ',
            NName: Halfling_Nickname1[randFloor(Halfling_Nickname1.length, 0)],
            NName2: Halfling_Nickname2[randFloor(Halfling_Nickname2.length, 0)],
            rarity: 'common',
        },
        {
            FName: Halfling_Female,
            LName: Halfling_Surname,
            race: 'Halfling',
            gender: 'Female',
            NNType: 'Nickname: ',
            NName: Halfling_Nickname1[randFloor(Halfling_Nickname1.length, 0)],
            NName2: Halfling_Nickname2[randFloor(Halfling_Nickname2.length, 0)],
            rarity: 'common',
        },
        {
            FName: HalfElf_Male,
            LName: HalfElf_Surname,
            race: 'Half Elf',
            gender: 'Male',
            NNType: '',
            NName: '',
            NName2: '',
            rarity: 'common',
        },
        {
            FName: HalfElf_Female,
            LName: HalfElf_Surname,
            race: 'Half Elf',
            gender: 'Female',
            NNType: '',
            NName: '',
            NName2: '',
            rarity: 'common',
        },
        {
            FName: Lizard_Male,
            LName: Lizard_Surname,
            race: 'Lizardfolk',
            gender: 'Male',
            NNType: '',
            NName: '',
            NName2: '',
            rarity: 'uncommon',
        },
        {
            FName: Lizard_Female,
            LName: Lizard_Surname,
            race: 'Lizardfolk',
            gender: 'Female',
            NNType: '',
            NName: '',
            NName2: '',
            rarity: 'uncommon',
        },
        {
            FName: OrcNames,
            LName: Orc_Surname,
            race: 'Half-Orc',
            gender: 'Male',
            NNType: '',
            NName: '',
            NName2: '',
            rarity: 'uncommon',
        },
        {
            FName: OrcNames,
            LName: Orc_Surname,
            race: 'Half-Orc',
            gender: 'Female',
            NNType: '',
            NName: '',
            NName2: '',
            rarity: 'uncommon',
        },
        {
            FName: Demonkin_Male,
            LName: Demonkin_Surname,
            race: 'Demonkin',
            gender: 'Male',
            NNType: 'Virtue Name: ',
            NName: Demonkin_Nickname[randFloor(Demonkin_Nickname.length, 0)],
            NName2: '',
            rarity: 'uncommon',
        },
        {
            FName: Demonkin_Female,
            LName: Demonkin_Surname,
            race: 'Demonkin',
            gender: 'Female',
            NNType: 'Virtue Name: ',
            NName: Demonkin_Nickname[randFloor(Demonkin_Nickname.length, 0)],
            NName2: '',
            rarity: 'uncommon',
        },
    ]


    if (profession === "") {
        console.log(JSON.stringify(professions));
        profession = professions[randFloor(professions.length, 0)];
    }
    const rolledOption = getWeightedRandomOption(rollOpts);
    return generateNPC(rolledOption, profession);
}
