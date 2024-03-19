let pack = []; // need to refigure this out to properly associate any and all state forms.

// return random value from weighted array {"key1":weight1, "key2":weight2}
function rw(object) {
    const array = [];
    for (const key in object) {
        for (let i = 0; i < object[key]; i++) {
            array.push(key);
        }
    }
    return array[Math.floor(Math.random() * array.length)];
}

// probability shorthand
function P(probability) {
    if (probability >= 1) return true;
    if (probability <= 0) return false;
    return Math.random() < probability;
}

function last(array) {
    return array[array.length - 1];
}

// chars that serve as vowels
const VOWELS = `aeiouyɑ'əøɛœæɶɒɨɪɔɐʊɤɯаоиеёэыуюяàèìòùỳẁȁȅȉȍȕáéíóúýẃőűâêîôûŷŵäëïöüÿẅãẽĩõũỹąęįǫųāēīōūȳăĕĭŏŭǎěǐǒǔȧėȯẏẇạẹịọụỵẉḛḭṵṳ`;
function vowel(c) {
    return VOWELS.includes(c);
}

function trimVowels(string, minLength = 3) {
    while (string.length > minLength && vowel(last(string))) {
        string = string.slice(0, -1);
    }
    return string;
}

const adjectivizationRules = [
    { name: "guo", probability: 1, condition: new RegExp(" Guo$"), action: noun => noun.slice(0, -4) },
    {
        name: "orszag",
        probability: 1,
        condition: new RegExp("orszag$"),
        action: noun => (noun.length < 9 ? noun + "ian" : noun.slice(0, -6))
    },
    {
        name: "stan",
        probability: 1,
        condition: new RegExp("stan$"),
        action: noun => (noun.length < 9 ? noun + "i" : trimVowels(noun.slice(0, -4)))
    },
    {
        name: "land",
        probability: 1,
        condition: new RegExp("land$"),
        action: noun => {
            if (noun.length > 9) return noun.slice(0, -4);
            const root = trimVowels(noun.slice(0, -4), 0);
            if (root.length < 3) return noun + "ic";
            if (root.length < 4) return root + "lish";
            return root + "ish";
        }
    },
    {
        name: "que",
        probability: 1,
        condition: new RegExp("que$"),
        action: noun => noun.replace(/que$/, "can")
    },
    {
        name: "a",
        probability: 1,
        condition: new RegExp("a$"),
        action: noun => noun + "n"
    },
    {
        name: "o",
        probability: 1,
        condition: new RegExp("o$"),
        action: noun => noun.replace(/o$/, "an")
    },
    {
        name: "u",
        probability: 1,
        condition: new RegExp("u$"),
        action: noun => noun + "an"
    },
    {
        name: "i",
        probability: 1,
        condition: new RegExp("i$"),
        action: noun => noun + "an"
    },
    {
        name: "e",
        probability: 1,
        condition: new RegExp("e$"),
        action: noun => noun + "an"
    },
    {
        name: "ay",
        probability: 1,
        condition: new RegExp("ay$"),
        action: noun => noun + "an"
    },
    {
        name: "os",
        probability: 1,
        condition: new RegExp("os$"),
        action: noun => {
            const root = trimVowels(noun.slice(0, -2), 0);
            if (root.length < 4) return noun.slice(0, -1);
            return root + "ian";
        }
    },
    {
        name: "es",
        probability: 1,
        condition: new RegExp("es$"),
        action: noun => {
            const root = trimVowels(noun.slice(0, -2), 0);
            if (root.length > 7) return noun.slice(0, -1);
            return root + "ian";
        }
    },
    {
        name: "l",
        probability: 0.8,
        condition: new RegExp("l$"),
        action: noun => noun + "ese"
    },
    {
        name: "n",
        probability: 0.8,
        condition: new RegExp("n$"),
        action: noun => noun + "ese"
    },
    {
        name: "ad",
        probability: 0.8,
        condition: new RegExp("ad$"),
        action: noun => noun + "ian"
    },
    {
        name: "an",
        probability: 0.8,
        condition: new RegExp("an$"),
        action: noun => noun + "ian"
    },
    {
        name: "ish",
        probability: 0.25,
        condition: new RegExp("^[a-zA-Z]{6}$"),
        action: noun => trimVowels(noun.slice(0, -1)) + "ish"
    },
    {
        name: "an",
        probability: 0.5,
        condition: new RegExp("^[a-zA-Z]{0-7}$"),
        action: noun => trimVowels(noun) + "an"
    }
];

// get adjective form from noun
function getAdjective(noun) {
    for (const rule of adjectivizationRules) {
        if (P(rule.probability) && rule.condition.test(noun)) {
            return rule.action(noun);
        }
    }
    return noun; // no rule applied, return noun as is
}

const getFullName = function (s) {
    if (!s.formName) return s.name;
    if (!s.name && s.formName) return "The " + s.formName;
    const adjName = adjForms.includes(s.formName) && !/-| /.test(s.name);
    return adjName ? `${getAdjective(s.name)} ${s.formName}` : `${s.formName} of ${s.name}`;
};

export const defineStateForms = function (list) {
    const states = pack.states.filter(s => s.i && !s.removed && !s.lock);
    if (states.length < 1) return;

    const generic = { Monarchy: 25, Republic: 2, Union: 1 };
    const naval = { Monarchy: 25, Republic: 8, Union: 3 };

    const median = d3.median(pack.states.map(s => s.area));
    const empireMin = states.map(s => s.area).sort((a, b) => b - a)[Math.max(Math.ceil(states.length ** 0.4) - 2, 0)];
    const expTiers = pack.states.map(s => {
        let tier = Math.min(Math.floor((s.area / median) * 2.6), 4);
        if (tier === 4 && s.area < empireMin) tier = 3;
        return tier;
    });

    const monarchy = ["Duchy", "Grand Duchy", "Principality", "Kingdom", "Empire"]; // per expansionism tier
    const republic = { Republic: 75, Federation: 4, "Trade Company": 4, "Most Serene Republic": 2, Oligarchy: 2, Tetrarchy: 1, Triumvirate: 1, Diarchy: 1, Junta: 1 }; // weighted random
    const union = { Union: 3, League: 4, Confederation: 1, "United Kingdom": 1, "United Republic": 1, "United Provinces": 2, Commonwealth: 1, Heptarchy: 1 }; // weighted random
    const theocracy = { Theocracy: 20, Brotherhood: 1, Thearchy: 2, See: 1, "Holy State": 1 };
    const anarchy = { "Free Territory": 2, Council: 3, Commune: 1, Community: 1 };

    for (const s of states) {
        if (list && !list.includes(s.i)) continue;
        const tier = expTiers[s.i];

        const religion = pack.cells.religion[s.center];
        const isTheocracy =
            (religion && pack.religions[religion].expansion === "state") ||
            (P(0.1) && ["Organized", "Cult"].includes(pack.religions[religion].type));
        const isAnarchy = P(0.01 - tier / 500);

        if (isTheocracy) s.form = "Theocracy";
        else if (isAnarchy) s.form = "Anarchy";
        else s.form = s.type === "Naval" ? rw(naval) : rw(generic);
        s.formName = selectForm(s, tier);
        s.fullName = getFullName(s);
    }

    const rand = () => 0.5 + Math.random() * 0.5;

    function selectForm(s, tier) {
        const base = pack.cultures[s.culture].base;

        if (s.form === "Monarchy") {
            const form = monarchy[tier];
            // Default name depends on exponent tier, some culture bases have special names for tiers
            if (s.diplomacy) {
                if (
                    form === "Duchy" &&
                    s.neighbors.length > 1 &&
                    rand(6) < s.neighbors.length &&
                    s.diplomacy.includes("Vassal")
                )
                    return "Marches"; // some vassal duchies on borderland
                if (base === 1 && P(0.3) && s.diplomacy.includes("Vassal")) return "Dominion"; // English vassals
                if (P(0.3) && s.diplomacy.includes("Vassal")) return "Protectorate"; // some vassals
            }

            if (base === 16 && (form === "Empire" || form === "Kingdom")) return "Khaganate"; // Turkic
            if (base === 5 && (form === "Empire" || form === "Kingdom")) return "Tsardom"; // Ruthenian
            if ([16, 31].includes(base) && (form === "Empire" || form === "Kingdom")) return "Khaganate"; // Turkic, Mongolian
            if (base === 12 && (form === "Kingdom" || form === "Grand Duchy")) return "Shogunate"; // Japanese
            if ([18, 17].includes(base) && form === "Empire") return "Caliphate"; // Arabic, Berber
            if (base === 18 && (form === "Grand Duchy" || form === "Duchy")) return "Emirate"; // Arabic
            if (base === 7 && (form === "Grand Duchy" || form === "Duchy")) return "Despotate"; // Greek
            if (base === 31 && (form === "Grand Duchy" || form === "Duchy")) return "Ulus"; // Mongolian
            if (base === 16 && (form === "Grand Duchy" || form === "Duchy")) return "Horde"; // Turkic
            if (base === 24 && (form === "Grand Duchy" || form === "Duchy")) return "Satrapy"; // Iranian
            return form;
        }

        if (s.form === "Republic") {
            // Default name is from weighted array, special case for small states with only 1 burg
            if (tier < 2 && s.burgs === 1) {
                if (trimVowels(s.name) === trimVowels(pack.burgs[s.capital].name)) {
                    s.name = pack.burgs[s.capital].name;
                    return "Free City";
                }
                if (P(0.3)) return "City-state";
            }
            return rw(republic);
        }

        if (s.form === "Union") return rw(union);
        if (s.form === "Anarchy") return rw(anarchy);

        if (s.form === "Theocracy") {
            // European
            if ([0, 1, 2, 3, 4, 6, 8, 9, 13, 15, 20].includes(base)) {
                if (P(0.1)) return "Divine " + monarchy[tier];
                if (tier < 2 && P(0.5)) return "Diocese";
                if (tier < 2 && P(0.5)) return "Bishopric";
            }
            if (P(0.9) && [7, 5].includes(base)) {
                // Greek, Ruthenian
                if (tier < 2) return "Eparchy";
                if (tier === 2) return "Exarchate";
                if (tier > 2) return "Patriarchate";
            }
            if (P(0.9) && [21, 16].includes(base)) return "Imamah"; // Nigerian, Turkish
            if (tier > 2 && P(0.8) && [18, 17, 28].includes(base)) return "Caliphate"; // Arabic, Berber, Swahili
            return rw(theocracy);
        }
    }
};

// state forms requiring Adjective + Name, all other forms use scheme Form + Of + Name
const adjForms = ["Empire", "Sultanate", "Khaganate", "Shogunate", "Caliphate", "Despotate", "Theocracy", "Oligarchy", "Union", "Confederation", "Trade Company", "League", "Tetrarchy", "Triumvirate", "Diarchy", "Horde", "Marches"];