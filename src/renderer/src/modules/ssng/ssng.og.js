/*********************************************
*    A systems agnostic RPG NPC Generator.   *
*           Created by Shuggaloaf            *
*  Reddit: u/shuggaloaf; Discord: Earl#7716  *
**********************************************
*    If you make use of any of this code,    * 
*    please attribute with the info above    * 
*                                            *
*    If you only want to add items to one    *
*    or more categories, do not add and      *
*    share the code, instead open a          *
*    Suggestion/Issue on this module's       *
*    Github project page:                    *
*    https://github.com/Shuggaloaf/Simple_NPC_Generator/issues
*                                            *
*            THANK YOU & ENJOY!!             * 
**********************************************


*********************************************
   ╔═══╗╔═══╗╔════╗╔══╗╔═══╗╔═╗ ╔╗╔═══╗
   ║╔═╗║║╔═╗║║╔╗╔╗║╚╣╠╝║╔═╗║║║╚╗║║║╔═╗║
   ║║ ║║║╚═╝║╚╝║║╚╝ ║║ ║║ ║║║╔╗╚╝║║╚══╗
   ║║ ║║║╔══╝  ║║   ║║ ║║ ║║║║╚╗║║╚══╗║
   ║╚═╝║║║    ╔╝╚╗ ╔╣╠╗║╚═╝║║║ ║║║║╚═╝║
   ╚═══╝╚╝    ╚══╝ ╚══╝╚═══╝╚╝ ╚═╝╚═══╝
*********************************************/



/********************************************
*       ADD NPCs TO A JOURNAL ENTRY               
*********************************************
1 = Add every generated NPC to journal 
0 = Chat only, do not save to journal      */
let saveToJournal = 1; /*

 Change Journal Name here if desired        */
let txtJournalName = "Generated NPCs";
/********************************************/


/********************************************
*     COMMON & UNCOMMON / COMMON ONLY               
*********************************************
1 = Common races only 
2 = Common & Uncommon races                */
let commonOnly = 2
/********************************************/



/********************************************/
/*************** END OPTIONS ****************/
/********************************************/



/*************** BEGIN CODE *****************
Do Not Edit Anything Below This Line!
********************************************/



let randFl = (x, y) => {
    return Math.floor(Math.random() * x) + y;
}



async function rollCharacter(FName, LName, race, gender, NNType, NName) {
    let randEye = Math.floor(Math.random() * 100) + 1;
    let randDesc = Math.floor(Math.random() * 100) + 1;
    let randHeight = Math.floor(Math.random() * 100) + 1;
    let txtFirstName = FName[randFl(FName.length, 0)];
    let txtLastName = LName[randFl(LName.length, 0)];
    let txtNick1 = "";
    let txtNick2 = "";
    let txtNickname = "";
    let txtClan = "";
    let txtBuild = build[randFl(build.length, 0)];
    let txtTone = skinTone[randFl(skinTone.length, 0)];
    let txtComp = skinComp[randFl(skinComp.length, 0)];
    let txtHairStyle = hairStyle[randFl(hairStyle.length, 0)];
    let txtHairColor = hairColor[randFl(hairColor.length, 0)];
    let txtEyeShape = eyeShape[randFl(eyeShape.length, 0)];
    let txtDemeanor = demeanor[randFl(demeanor.length, 0)];
    let txtProfession = profession[randFl(profession.length, 0)];
    let txtActivities = activities[randFl(activities.length, 0)];
    let txtHair = ""
    let txtDescriptors = ""
    let txtHeight = "";
    let txtFacialHair = "";
    let txtEyeColor = "";


    //Height
    if (randHeight.total < 20 || randHeight.total > 80) {
        txtHeight = height[randFl(height.length, 0)];
    } else {
        txtHeight = 'Average Height'
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
    if (gender == "Female" && race == "Dwarf") {
        txtFacialHair = facialHair[randFl(facialHair.length, 0)];
    } else if (gender == "Male") {
        txtFacialHair = facialHair[randFl(facialHair.length, 0)];
    } else {
        txtFacialHair = "None"
    }

    if (race == "Dragonborn" || race == "Goblin" || race == "Lizardfolk" || race == "Elf") txtFacialHair = "None", txtDescriptors.replace("Very hairy", "Exceptionally average").replace("One hell of a mustache", "Exceptionally average");
    if (race == "Dwarf") txtFacialHair = txtFacialHair.replace("Clean-Shaven", "Long, Braided Beard");

    //Eye Color Rarity   
    if (randEye.total >= 90) {
        txtEyeColor = eyeColor3[randFl(eyeColor3.length, 0)];
    } else if (randEye.total <= 65) {
        txtEyeColor = eyeColor[randFl(eyeColor.length, 0)];
    } else {
        txtEyeColor = eyeColor2[randFl(eyeColor2.length, 0)];
    }

    //Tone
    if (race == "Goblin" || race == "Half-Orc") {
        txtTone = orcGobTone[randFl(orcGobTone.length, 0)];
    } else if (race == "Dragonborn") {
        txtTone = dragonbornTone[randFl(dragonbornTone.length, 0)];
        txtComp = "Scaled"
    } else if (race == "Lizardfolk") {
        txtTone = lizardTone[randFl(lizardTone.length, 0)];
        txtComp = "Scaled"
    } else if (race == "Tiefling") {
        let randTief = Math.floor(Math.random() * 6) + 1;
        if (randTief.total > 4) {
            txtTone = tieflingTone[randFl(tieflingTone.length, 0)];
        } else {
            let txtTone = skinTone[randFl(skinTone.length, 0)];
        }
    }

    //Nickname Handling    
    if (race == "Halfling") {
        /*
        //>>>>REMOVING UNTIL I GET BETTER NICKNAMES 
        txtNick1 = NName[randFl(NName.length,0)];
        txtNick2 = NName2[randFl(NName2.length,0)];
        txtNickname = NNType+txtNick1+txtNick2;
        
        txtNickname = "";
    }else if(race == "Dragonborn"){
        txtNick1 = NName[randFl(NName.length,0)];
        txtNick2 = NName2;
        txtNickname = NNType+txtNick1
        txtClan = '<p style = "font-size:12px;font-weight: normal;">*Dragonborn display their clan name first.<br>The "Child Name" is a nickname earned as a child.';
        */
    } else if (race == "Tiefling") {
        txtNick1 = NName[randFl(NName.length, 0)];
        txtNickname = NNType + txtNick1;
    } else if (race == "Goliath") {
        txtNick1 = NName[randFl(NName.length, 0)];
        //txtNick2 = NName2;
        txtNickname = NNType + txtNick1;
        txtClan = '<p style = "font-size:12px;font-weight: normal;">*Goliath display their Clan name last.</p>';
    } else {
        // txtNickname = "";
        // txtClan = "";
    }

    //If Bald/Shaved we want to add "eyebrow" before the hair color
    if (txtHairStyle == "Bald" || txtHairStyle == "Shaved") {
        if (gender == "Female") {
            txtHairStyle = "Shoulder-Length"
            txtFacialHair = "None"
        } else {
            txtHairColor += " Eyebrow "
        }
    }

    //Hair Handling
    if (race == "Dragonborn" || race == "Lizardfolk") {
        txtHair = "None"
    } else {
        txtHair = txtHairStyle + `, ` + txtHairColor
    }


    //Place the NPC name and description into variables so we can use them for both the Journal and chat.
    let txtFullName = txtFirstName + ` ` + txtLastName;
    let txtNameContent = `<p style = "` + styleHeader + `"><strong>` + txtFullName + `</strong><br><em style = "font-size:13px; font-weight: normal;">` + txtNickname + `</em></p>`

    let txtContent = `<main style = "` + styleContent + `">
        <table style="border: 0px solid transparent; padding: 0px; margin: 0px; font-weight:normal; background:rgba(255, 255, 255, .0);">   
          <tr style = "font-size:100%; color:white; ` + hOutline + `">
            <td><strong>${race}, ${gender}</strong></td>
            <td style = "text-align:right; padding:2px;"><strong>` + txtProfession + `</strong></td>
          </tr>            
        </table>        
        <table style="border: 0px solid transparent; margin-top: 10px; font-weight:normal; background:rgba(255, 255, 255, .0);">
          <tr style = "font-size:100%; color:`+ foreColor + `;` + txtOutline + `">
            <td>
            <strong>Build: &nbsp;</strong>`+ txtHeight + ` and ` + txtBuild + `
            <br><strong>Skin Tone: &nbsp;</strong>`+ txtTone + `
            <br><strong>Complexion: &nbsp;</strong>`+ txtComp + `
            <br><strong>Eyes: &nbsp;</strong>`+ txtEyeColor + "," + txtEyeShape + `
            <br><strong>Hair: &nbsp;</strong>`+ txtHair + `
            <br><strong>Facial Hair: &nbsp;</strong>`+ txtFacialHair + `
            <br><strong>Uniquity: &nbsp;</strong>`+ txtDescriptors + `
            <br><strong>Demeanor: &nbsp;</strong>`+ txtDemeanor + `<br>
\t    <hr>
    \t    <span style="font-size:86%;"><strong>Optional Activity: </strong>`+ txtActivities + `</span>
    \t    </td>
    \t  </tr>
    \t</table>` + txtClan + `</main>`;


    //Journal Creation/Adding NPCs
    // Check if user wants to save to journal
    if (saveToJournal == 1) {
        //Remove message formatting for Journal 
        let txtJournal = ""
        txtJournal = txtContent.replace(styleContent, "").replace("color:#FFFFFF; text-shadow: 1px 1px 2px black;", "").replace("color:white;", "").replace(hOutline, "");
        //Check to see if there is already an NPC journal. If not, create one.
        let journalObj = game.journal.find(jnl => jnl.name == txtJournalName);
        if (!journalObj) {
            ui.notifications.info("NPC Journal not found. Creating...");
            journalObj = await JournalEntry.create({ name: txtJournalName });
        }
        journalObj.createEmbeddedDocuments("JournalEntryPage", [{
            name: txtFullName,
            type: "text",
            text: {
                content: txtJournal,
                format: CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML
            }
        }]);
        ChatMessage.create({
            content: txtNameContent + txtContent,
            whisper: ChatMessage.getWhisperRecipients("GM")
        });
    } else {
        ChatMessage.create({
            content: txtNameContent + txtContent,
            whisper: ChatMessage.getWhisperRecipients("GM")
        });
    };

}



//***********************************
//*  COMMON NPC                     *
//***********************************

function commonNPC() {

    let cd = new Dialog({
        content: dialogContent, title: `NPC GENERATOR - COMMON RACES`,
        buttons: {
            one: {
                label: `<b style = "font-size:20px">Human</b><br>` +
                    `<b style="border-style:solid;border-color:#0000BB;background-color:lightblue;color:black">&nbsp;&nbsp;Male&nbsp;&nbsp;</b>`,
                callback: async () => {
                    stayOpen = true; //add this for async Callbacks
                    rollCharacter(fNameHumanMale, lNameHuman, "Human", "Male", "", "", "");
                },
            },
            two: {
                label: `<b style = "font-size:20px">Dwarf</b><br>` +
                    `<b style="border-style:solid;border-color:#0000BB;background-color:lightblue;color:black">&nbsp;&nbsp;Male&nbsp;&nbsp;</b>`,
                callback: async () => {
                    stayOpen = true;
                    rollCharacter(fNameDwarfMale, lNameDwarf, "Dwarf", "Male", "", "", "");
                },
            },
            three: {
                label: `<b style = "font-size:20px">Elf</b><br>` +
                    `<b style="border-style:solid;border-color:#0000BB;background-color:lightblue;color:black">&nbsp;&nbsp;Male&nbsp;&nbsp;</b>`,
                callback: async () => {
                    stayOpen = true;
                    rollCharacter(fNameElfMale, lNameElf, "Elf", "Male", "", "", "");
                },
            },
            four: {
                label: `<b style = "font-size:20px">Halfling</b><br>` +
                    `<b style="border-style:solid;border-color:#0000BB;background-color:lightblue;color:black">&nbsp;&nbsp;Male&nbsp;&nbsp;</b>`,
                callback: async () => {
                    stayOpen = true;
                    rollCharacter(fNameHalflingMale, lNameHalfling, "Halfling", "Male", "Nickname: ", nickname1Halfling, nickname2Halfling);
                },
            },
            five: {
                label: `<b style = "font-size:20px">Half&nbsp;Elf</b><br>` +
                    `<b style="border-style:solid;border-color:#0000BB;background-color:lightblue;color:black">&nbsp;&nbsp;Male&nbsp;&nbsp;</b>`,
                callback: async () => {
                    stayOpen = true;
                    rollCharacter(fNameHalfElfMale, lNameHalfElf, "Half Elf", "Male", "", "", "");
                },
            },
            six: {
                label: `<b style = "font-size:20px">Gnome</b><br>` +
                    `<b style="border-style:solid;border-color:#0000BB;background-color:lightblue;color:black">&nbsp;&nbsp;Male&nbsp;&nbsp;</b>`,
                callback: async () => {
                    stayOpen = true;
                    rollCharacter(fNameGnomeMale, lNameGnome, "Gnome", "Male", "", "", "");
                },
            },
            seven: {
                label: `<b style = "font-size:20px">Human</b><br>` +
                    `<b style="border-style:solid;border-color:purple;background-color:pink;color:black">Female</b>`,
                callback: async () => {
                    stayOpen = true;
                    rollCharacter(fNameHumanFemale, lNameHuman, "Human", "Female", "", "", "");
                },
            },

            eight: {
                label: `<b style = "font-size:20px">Dwarf</b><br>` +
                    `<b style="border-style:solid;border-color:purple;background-color:pink;color:black">Female</b>`,
                callback: async () => {
                    stayOpen = true;
                    rollCharacter(fNameDwarfFemale, lNameDwarf, "Dwarf", "Female", "", "", "");
                },
            },

            nine: {
                label: `<b style = "font-size:20px">Elf</b><br>` +
                    `<b style="border-style:solid;border-color:purple;background-color:pink;color:black">Female</b>`,
                callback: async () => {
                    stayOpen = true;
                    rollCharacter(fNameElfFemale, lNameElf, "Elf", "Female", "", "", "");
                },
            },

            ten: {
                label: `<b style = "font-size:20px">Halfling</b><br>` +
                    `<b style="border-style:solid;border-color:purple;background-color:pink;color:black">Female</b>`,
                callback: async () => {
                    stayOpen = true;
                    rollCharacter(fNameHalflingFemale, lNameHalfling, "Halfling", "Female", "Nickname: ", nickname1Halfling, nickname2Halfling);
                },
            },

            eleven: {
                label: `<b style = "font-size:20px">Half&nbsp;Elf</b><br>` +
                    `<b style="border-style:solid;border-color:purple;background-color:pink;color:black">Female</b>`,
                callback: async () => {
                    stayOpen = true;
                    rollCharacter(fNameHalfElfFemale, lNameHalfElf, "Half Elf", "Female", "", "", "");
                },
            },

            twelve: {
                label: `<b style = "font-size:20px">Gnome</b><br>` +
                    `<b style="border-style:solid;border-color:purple;background-color:pink;color:black">Female</b>`,
                callback: async () => {
                    stayOpen = true;
                    rollCharacter(fNameGnomeFemale, lNameGnome, "Gnome", "Female", "", "", "");
                },
            },

            thirteen: {
                label: `<b style="color:darkred; font-size:18px">Professions</b>`,
                callback: async () => {
                    stayOpen = true;
                    let Prof0 = await profession[randFl(profession.length, 0)];
                    let Prof1 = await profession[randFl(profession.length, 0)];
                    let Prof2 = await profession[randFl(profession.length, 0)];
                    let Prof3 = await profession[randFl(profession.length, 0)];
                    let Prof4 = await profession[randFl(profession.length, 0)];
                    ChatMessage.create({
                        content: `<p style = "` + styleHeader + `"><b>Professions</b></p>
                      <Main style = "` + styleContent + `">
                        <table style="border: 0px solid transparent; padding: 0px; margin: 0px; background:rgba(255, 255, 255, .0);"> 
                         <tr><td><strong>`
                            + Prof0 + `<br>`
                            + Prof1 + `<br>`
                            + Prof2 + `<br>`
                            + Prof3 + `<br>`
                            + Prof4 + `<br>
                         </strong></td></tr></Main>`,
                        whisper: ChatMessage.getWhisperRecipients("GM")
                    });
                },
            },

            /*    fourteen : {
                  label : `<b style="color:darkred; font-size:18px">Uniquities</b>`,
                  callback : async() => {
                    stayOpen = true;          
                    let Quirk1 = await descriptors1[randFl(descriptors1.length,0)];
                    let Quirk2 = await descriptors1[randFl(descriptors1.length,0)];
                    let Quirk3 = await descriptors1[randFl(descriptors1.length,0)];
                    let Quirk4 = await descriptors2[randFl(descriptors2.length,0)];
                    let Quirk5 = await descriptors3[randFl(descriptors3.length,0)];
                        ChatMessage.create({
                        content: `<p style="background:#ffffff; color:#550000; font-size:22px;"><b>Uniquities</b></p>
                                 <ul>
                                     <li>`+ Quirk1 +`</li>
                                     <li>`+ Quirk2 + `</li>
                                     <li>`+ Quirk3 + `</li>
                                     <li>`+ Quirk4 + ` (rare)</li>
                                     <li>`+ Quirk5 + ` (very rare)</li>
                                 </ul>`,
                        whisper: ChatMessage.getWhisperRecipients("GM") 
                    });
                  },
                },*/
        },

        close: () => {
            if (stayOpen) {
                stayOpen = false;
                cd.render(true);
            }
        }
    }, { width: 520, left: screenWidth * 0.1, top: screenHeight * 0.80 }).render(true);

}



//***********************************
//*  UNCOMMON NPC                   *
//***********************************


function uncommonNPC() {

    let ud = new Dialog({
        content: dialogContent, title: `NPC GENERATOR - UNCOMMON RACES`,
        buttons: {
            one: {
                label: `<b style = "font-size:20px">Dragonborn</b><br>` +
                    `<b style="border-style:solid;border-color:#0000BB;background-color:lightblue;color:black">&nbsp;&nbsp;Male&nbsp;&nbsp;</b>`,
                callback: async () => {
                    stayOpen = true;
                    rollCharacter(lNameDragonborn, fNameDragonbornMale, "Dragonborn", "Male", "Child Name: ", nicknameDragonborn);
                },
            },
            three: {
                label: `<b style = "font-size:20px">Tiefling</b><br>` +
                    `<b style="border-style:solid;border-color:#0000BB;background-color:lightblue;color:black">&nbsp;&nbsp;Male&nbsp;&nbsp;</b>`,
                callback: async () => {
                    stayOpen = true;
                    rollCharacter(fNameTieflingMale, lNameTiefling, "Tiefling", "Male", "Virtue Name: ", nicknameTiefling, "");
                },
            },
            five: {
                label: `<b style = "font-size:20px">Goliath</b><br>` +
                    `<b style="border-style:solid;border-color:#0000BB;background-color:lightblue;color:black">&nbsp;&nbsp;Male&nbsp;&nbsp;</b>`,
                callback: async () => {
                    stayOpen = true;
                    rollCharacter(fNameGoliathMale, lNameGoliath, "Goliath", "Male", "Nickname: ", nicknameGolaith);
                },
            },
            seven: {
                label: `<b style = "font-size:20px">Half&nbsp;Orc</b><br>` +
                    `<b style="border-style:solid;border-color:#0000BB;background-color:lightblue;color:black">&nbsp;&nbsp;Male&nbsp;&nbsp;</b>`,
                callback: async () => {
                    stayOpen = true;
                    rollCharacter(fNameOrc, lNameOrc, "Half-Orc", "Male", "", "", "");
                },
            },
            nine: {
                label: `<b style = "font-size:20px">Goblin</b><br>` +
                    `<b style="border-style:solid;border-color:#0000BB;background-color:lightblue;color:black">&nbsp;&nbsp;Male&nbsp;&nbsp;</b>`,
                callback: async () => {
                    stayOpen = true;
                    rollCharacter(nameGoblin, nameGoblin, "Goblin", "Male", "", "", "");
                },
            },
            fourteen: {
                label: `<b style = "font-size:20px">Lizard&nbsp;Folk</b><br>` +
                    `<b style="border-style:solid;border-color:#0000BB;background-color:lightblue;color:black">&nbsp;&nbsp;Male&nbsp;&nbsp;</b>`,
                callback: async () => {
                    stayOpen = true;
                    rollCharacter(fNameLizardMale, lNameLizard, "Lizardfolk", "Male", "", "", "");
                },
            },
            two: {
                label: `<b style = "font-size:20px">Dragonborn</b><br>` +
                    `<b style="border-style:solid;border-color:purple;background-color:pink;color:black">Female</b>`,
                callback: async () => {
                    stayOpen = true;
                    rollCharacter(lNameDragonborn, fNameDragonbornFemale, "Dragonborn", "Female", "Child Name: ", nicknameDragonborn);
                },
            },

            four: {
                label: `<b style = "font-size:20px">Tiefling</b><br>` +
                    `<b style="border-style:solid;border-color:purple;background-color:pink;color:black">Female</b>`,
                callback: async () => {
                    stayOpen = true;
                    rollCharacter(fNameTieflingFemale, lNameTiefling, "Tiefling", "Female", "Virtue Name: ", nicknameTiefling, "");
                },
            },

            six: {
                label: `<b style = "font-size:20px">Goliath</b><br>` +
                    `<b style="border-style:solid;border-color:purple;background-color:pink;color:black">Female</b>`,
                callback: async () => {
                    stayOpen = true;
                    rollCharacter(fNameGoliathFemale, lNameGoliath, "Goliath", "Female", "Nickname: ", nicknameGolaith);
                },
            },

            eight: {
                label: `<b style = "font-size:20px">Half&nbsp;Orc</b><br>` +
                    `<b style="border-style:solid;border-color:purple;background-color:pink;color:black">Female</b>`,
                callback: async () => {
                    stayOpen = true;
                    rollCharacter(fNameOrc, lNameOrc, "Half-Orc", "Female", "", "", "");
                },
            },

            ten: {
                label: `<b style = "font-size:20px">Goblin</b><br>` +
                    `<b style="border-style:solid;border-color:purple;background-color:pink;color:black">Female</b>`,
                callback: async () => {
                    stayOpen = true;
                    rollCharacter(nameGoblin, nameGoblin, "Goblin", "Female", "", "", "");
                },
            },

            fifteen: {
                label: `<b style = "font-size:20px">Lizard&nbsp;Folk</b><br>` +
                    `<b style="border-style:solid;border-color:purple;background-color:pink;color:black">Female</b>`,
                callback: async () => {
                    stayOpen = true;
                    rollCharacter(fNameLizardMale, lNameLizard, "Lizardfolk", "Female", "", "", "");
                },
            },

            thirteen: {
                label: `<b style="color:darkred; font-size:18px">Professions</b>`,
                callback: async () => {
                    stayOpen = true;
                    let Prof0 = await profession[randFl(profession.length, 0)];
                    let Prof1 = await profession[randFl(profession.length, 0)];
                    let Prof2 = await profession[randFl(profession.length, 0)];
                    let Prof3 = await profession[randFl(profession.length, 0)];
                    let Prof4 = await profession[randFl(profession.length, 0)];
                    ChatMessage.create({
                        content: `<p style = "` + styleHeader + `"><b>Professions</b></p>
                      <Main style = "` + styleContent + `">
                        <table style="border: 0px solid transparent; padding: 0px; margin: 0px; background:rgba(255, 255, 255, .0);"> 
                         <tr><td><strong>`
                            + Prof0 + `<br>`
                            + Prof1 + `<br>`
                            + Prof2 + `<br>`
                            + Prof3 + `<br>`
                            + Prof4 + `<br>
                         </strong></td></tr></Main>`,
                        whisper: ChatMessage.getWhisperRecipients("GM")
                    });
                },
            },

            /* twelve : {
                 label : `<b style="color:darkred; font-size:18px">Uniquities</b>`,
                 callback : async() => {
                   stayOpen = true;          
                   let Quirk1 = await descriptors1[randFl(descriptors1.length,0)];
                   let Quirk2 = await descriptors1[randFl(descriptors1.length,0)];
                   let Quirk3 = await descriptors1[randFl(descriptors1.length,0)];
                   let Quirk4 = await descriptors2[randFl(descriptors2.length,0)];
                   let Quirk5 = await descriptors3[randFl(descriptors3.length,0)];
                       ChatMessage.create({
                       content: `<p style="background:#ffffff; color:#550000; font-size:22px;"><b>Uniquities</b></p>
                                <ul>
                                    <li>`+ Quirk1 +`</li>
                                    <li>`+ Quirk2 + `</li>
                                    <li>`+ Quirk3 + `</li>
                                    <li>`+ Quirk4 + ` (rare)</li>
                                    <li>`+ Quirk5 + ` (very rare)</li>
                                </ul>`,
                       whisper: ChatMessage.getWhisperRecipients("GM") 
                   });
                 },
               }, */
        },

        close: () => {
            if (stayOpen) {
                stayOpen = false;
                ud.render(true);
            }
        }
    }, { width: 620, left: screenWidth * 0.1, top: screenHeight * 0.8 }).render(true);

}



//***********************************
//*  NAMES LISTS                    *
//***********************************                  

let fNameHumanFemale = ["Abia", "Abigail", "Abigala", "Abigayl", "Abjiga", "Abressa", "Abria", "Abrjia", "Abryia", "Abyiga", "Adressa", "Adria", "Adrjia", "Adryia", "Aebria", "Aedria", "Aelina", "Aelinea", "Aelisabeth", "Aeliya", "Aella", "Aelyssa", "Aemily", "Aemilya", "Aemma", "Aemy", "Aendrea", "Aeobreia", "Aeria", "Aeva", "Aevelyn", "Alaexa", "Aleksa", "Alessa", "Alessana", "Alexa", "Alia", "Alija", "Alina", "Alinea", "Alinia", "Alisann", "Alisea", "Alisia", "Alisja", "Aliss", "Alissa", "Alisya", "Alivia", "Alivya", "Aliya", "Allisann", "Allison", "Allysann", "Allyson", "Alova", "Alya", "Alyce", "Alyna", "Alys", "Alysann", "Alysea", "Alyss", "Alyssia", "Alyxa", "Amee", "Amelia", "Amelya", "Ami", "Amia", "Amilia", "Amilja", "Amja", "Amy", "Amya", "Andrea", "Andreja", "Andreya", "Anika", "Aodreia", "Aria", "Ariana", "Arianna", "Ariel", "Ariella", "Arielle", "Arja", "Arjana", "Arjel", "Arya", "Aryana", "Aryanna", "Aryel", "Aryell", "Aryella", "Ashlena", "Ashlene", "Ashlyne", "Aslena", "Asljena", "Aslyena", "Aubree", "Aubria", "Audree", "Audria", "Aurora", "Ava", "Avaery", "Avelia", "Avelina", "Averee", "Averra", "Avery", "Avia", "Avyrie", "Azalea", "Azelia", "Azlena", "Baella", "Bela", "Bella", "Belle", "Bera", "Betta", "Bree", "Breia", "Brianna", "Brinn", "Brinna", "Brjia", "Brocalina", "Brokalina", "Brooka", "Brooke", "Brooklinea", "Brooklyn", "Bruka", "Bryanna", "Bryia", "Brynn", "Brynna", "Caemila", "Caerlotta", "Calia", "Caliana", "Calla", "Camila", "Camilia", "Carlotta", "Catherina", "Cathryn", "Catrina", "Celine", "Celyne", "Chloe", "Chloeia", "Claira", "Claire", "Clara", "Clayra", "Clayre", "Cloe", "Cloey", "Cloia", "Dalia", "Dalilja", "Dalilya", "Dalyla", "Delia", "Delila", "Delyla", "Dree", "Dreia", "Drjia", "Dryia", "Elia", "Eliana", "Elisabet", "Elisybeth", "Eljana", "Ella", "Elli", "Ellia", "Ellie", "Ellja", "Ellya", "Elva", "Elyana", "Elyna", "Elyssa", "Ema", "Emili", "Emilia", "Emma", "Estelia", "Estella", "Eva", "Evylann", "Evylen", "Faline", "Falinia", "Falyne", "Fanna", "Fantina", "Feria", "Ferjia", "Ferra", "Feryia", "Genaesis", "Genaesys", "Genesia", "Genesys", "Gianesia", "Gianna", "Gina", "Ginna", "Grace", "Graece", "Graja", "Grassa", "Grassia", "Graya", "Grayce", "Grazia", "Haenna", "Halia", "Halie", "Halja", "Halya", "Hanna", "Hannah", "Harper", "Harperia", "Hazel", "Hazelia", "Hazyl", "Iasmina", "Illa", "Imaena", "Imina", "Isabel", "Isabella", "Iveljin", "Janna", "Jasmine", "Jasmyne", "Jazmina", "Jella", "Jemina", "Jenesa", "Jenessa", "Jianna", "Jocelina", "Joceline", "Jocelyn", "Jocelyne", "Joyce", "Kaeli", "Kaelia", "Kaelya", "Kaila", "Kalja", "Kalya", "Kamilia", "Kamilja", "Karlata", "Kathrine", "Kathrinn", "Kathryn", "Kathryne", "Katja", "Katrina", "Katya", "Kayla", "Kima", "Kimbera", "Klara", "Kloja", "Kloya", "Kym", "Kyma", "Kymber", "Laila", "Lailana", "Lana", "Lanja", "Lanna", "Lanya", "Layla", "Laylanna", "Lea", "Leah", "Leena", "Leia", "Leja", "Leya", "Liana", "Lilia", "Lilja", "Lily", "Lilya", "Lina", "Lippi", "Lisabeta", "Lisbeth", "Lona", "Loona", "Luna", "Lyana", "Lylia", "Lyly", "Lyna", "Lysbeth", "Lyssa", "Lyssie", "Madisinia", "Madisyn", "Madizinia", "Madjisa", "Madyisa", "Maedisa", "Maelania", "Maelya", "Maia", "Maja", "Maya", "Mea", "Melania", "Melanja", "Melany", "Melanya", "Mena", "Mia", "Mija", "Mila", "Milae", "Milannia", "Milia", "Milja", "Milly", "Milya", "Mina", "Miya", "Mjila", "Mya", "Myla", "Naome", "Naomi", "Natalia", "Nataliae", "Natalja", "Nataly", "Natalya", "Nathylie", "Natja", "Natta", "Natty", "Natya", "Natylie", "Nicola", "Nicolle", "Nikola", "Nomi", "Nomia", "Nycola", "Nycole", "Oiara", "Ojara", "Olifja", "Olifya", "Olivia", "Olivya", "Olyva", "Ondrea", "Oyara", "Paenelope", "Penelope", "Penny", "Pera", "Peria", "Perja", "Perya", "Pia", "Pinelopi", "Pinna", "Pippi", "Pynelope", "Riana", "Rianna", "Rilia", "Rilie", "Rjanna", "Rjila", "Rubi", "Rubia", "Ruby", "Ryanna", "Ryila", "Ryla", "Rylie", "Samaentha", "Samena", "Samentha", "Samitha", "Samitia", "Samitja", "Samitya", "Samytha", "Sara", "Sarah", "Sarra", "Savanna", "Savannia", "Scarlet", "Scarletta", "Scarlotta", "Selina", "Seline", "Selyne", "Sharla", "Sharlotta", "Sharlotte", "Skarlja", "Skarlya", "Sofi", "Sofia", "Soja", "Sophia", "Sophya", "Sosja", "Sosya", "Soya", "Stella", "Stelly", "Stylla", "Talea", "Talia", "Talya", "Tella", "Thalia", "Tylla", "Uzoia", "Vala", "Valea", "Valentina", "Valentyna", "Valeria", "Valerie", "Valerja", "Valerya", "Valia", "Valja", "Valya", "Vanna", "Victora", "Victoria", "Victorya", "Viktorja", "Viktorya", "Vila", "Vilettia", "Viola", "Violet", "Violetta", "Vittora", "Vittoria", "Vyla", "Ximena", "Yanna", "Yasmine", "Yella", "Yemina", "Yenesa", "Ysabel", "Yvelyn", "Zoe", "Zoea", "Zoeia", "Zoesia", "Zoey", "Zofia", "Zoia", "Zosia", "Zosy", "Zusia"]
let fNameHumanMale = ["Aaryn", "Aaro", "Aarus", "Abramus", "Abrahm", "Abyl", "Abelus", "Adannius", "Adanno", "Aedam", "Adym", "Adamus", "Aedrian", "Aedrio", "Aedyn", "Aidyn", "Aelijah", "Elyjah", "Aendro", "Androe", "Aenry", "Hynroe", "Hynrus", "Aethan", "Aethyn", "Aevan", "Evyn", "Evanus", "Alecks", "Alyx", "Alexandyr", "Xandyr", "Alyn", "Alaen", "Andrus", "Aendrus", "Anglo", "Aenglo", "Anglus", "Antony", "Antonyr", "Astyn", "Astinus", "Axelus", "Axyl", "Benjamyn", "Benjamyr", "Braidyn", "Brydus", "Braddeus", "Brandyn", "Braendyn", "Bryus", "Bryne", "Bryn", "Branus", "Caeleb", "Caelyb", "Caerlos", "Carlus", "Cameryn", "Camerus", "Cartus", "Caertero", "Charlus", "Chaerles", "Chyrles", "Christophyr", "Christo", "Chrystian", "Chrystan", "Connorus", "Connyr", "Daemian", "Damyan", "Daenyel", "Danyel", "Davyd", "Daevo", "Dominac", "Dylaen", "Dylus", "Elius", "Aeli", "Elyas", "Helius", "Helian", "Emilyan", "Emilanus", "Emmanus", "Emynwell", "Ericus", "Eryc", "Eryck", "Ezekius", "Zeckus", "Ezekio", "Ezrus", "Yzra", "Gabrael", "Gaebriel", "Gael", "Gayl", "Gayel", "Gaeus", "Gavyn", "Gaevyn", "Goshwa", "Joshoe", "Graysus", "Graysen", "Gwann", "Ewan", "Gwyllam", "Gwyllem", "Haddeus", "Hudsyn", "Haesoe", "Haesys", "Haesus", "Handus", "Handyr", "Hantus", "Hercules", "Huntyr", "Haroldus", "Haryld", "Horgus", "Horus", "Horys", "Horyce", "Hosea", "Hosius", "Iaen", "Yan", "Ianus", "Ivaen", "Yvan", "Jaecoby", "Jaecob", "Jaeden", "Jaedyn", "Jaeremiah", "Jeremus", "Jasyn", "Jaesen", "Jaxon", "Jaxyn", "Jaxus", "Johnus", "Jonus", "Jonaeth", "Jonathyn", "Jordus", "Jordyn", "Josaeth", "Josephus", "Josaeus", "Josayah", "Jovanus", "Giovan", "Julyan", "Julyo", "Jyck", "Jaeck", "Jacus", "Kaevin", "Kevyn", "Vinkus", "Laevi", "Levy", "Levius", "Landyn", "Laendus", "Leo", "Leonus", "Leonaerdo", "Leonyrdo", "Lynardus", "Lincon", "Lyncon", "Linconus", "Logaen", "Logus", "Louis", "Lucius", "Lucae", "Lucaen", "Lucaes", "Lucoe", "Lucus", "Lyam", "Maeson", "Masyn", "Maetho", "Mathoe", "Matteus", "Matto", "Maxus", "Maximus", "Maximo", "Maxymer", "Mychael", "Mygwell", "Miglus", "Mythro", "Mithrus", "Naemo", "Naethyn", "Nathanus", "Naethynel", "Nicholaes", "Nycholas", "Nicholys", "Nicolus", "Nolyn", "Nolanus", "Olivyr", "Alivyr", "Olivus", "Oscarus", "Oscoe", "Raen", "Ryn", "Robertus", "Robett", "Bertus", "Romyn", "Romanus", "Ryderus", "Ridyr", "Samwell", "Saemuel", "Santegus", "Santaegus", "Sybasten", "Bastyen", "Tago", "Aemo", "Tagus", "Theodorus", "Theodus", "Thaeodore", "Thomys", "Thomas", "Tommus", "Tylus", "Tilyr", "Uwyn", "Oewyn", "Victor", "Victyr", "Victorus", "Vincynt", "Vyncent", "Vincentus", "Wyttus", "Wyaett", "Xavius", "Havius", "Xavyer", "Yago", "Tyago", "Tyego", "Ysaac", "Aisaac", "Ysaiah", "Aisiah", "Siahus", "Zacharus", "Zachar", "Zachaery", "Aaron", "Aaryn", "Abram", "Bram", "Abyl", "Abel", "Adam", "Aedam", "Adrian", "Hadrian", "Aiden", "Aidyn", "Alyx", "Alix", "Andres", "Andrew", "Andre", "Angel", "Anthony", "Astin", "Axel", "Axyl", "Benjamyn", "Benjamin", "Braddeus", "Bradyn", "Brynden", "Brandyn", "Bryne", "Bryan", "Bran", "Calyb", "Caleb", "Camryn", "Cam", "Carliss", "Cartyr", "Cartus", "Chirles", "Charly", "Conner", "Cristian", "Crystan", "Damien", "Damyn", "Daniel", "Dannel", "Dann", "Danny", "David", "Davyd", "Diegon", "Tiagon", "Domnac", "Dylan", "Eli", "Ely", "Elias", "Elyas", "Elijah", "Elijan", "Emilian", "Emynwell", "Emmyn", "Emmon", "Eric", "Eryc", "Ethan", "Athyn", "Evan", "Evyn", "Ezran", "Ezrus", "Gabreil", "Gabreal", "Gael", "Gayl", "Gavyn", "Gavin", "Gray", "Grasyn", "Haddeus", "Hudsen", "Handyr", "Hander", "Harold", "Haryld", "Horus", "Horace", "Horyce", "Hoseas", "Huntyr", "Han", "Hynry", "Henro", "Iaen", "Ian", "Isaac", "Isiah", "Isaias", "Ivaen", "Ivan", "Jacoby", "Jacob", "Jaeden", "Jayden", "Jak", "Jyck", "Jasyn", "Jason", "Jax", "Jaxon", "Jaymes", "Iamus", "Jestin", "Yestin", "John", "Jonn", "Jonath", "Joathyn", "Jorden", "Jordyn", "Joseth", "Joeseph", "Joshen", "Goshen", "Josyah", "Josius", "Jovan", "Julian", "Julyan", "Kevin", "Kevan", "Lan", "Alyn", "Landon", "Landyn", "Lenus", "Linus", "Leon", "Leo", "Lynard", "Levi", "Levy", "Liam", "Logan", "Lucan", "Luc", "Lucas", "Lucyus", "Louis", "Lyncon", "Lincus", "Mason", "Masyn", "Mathew", "Mattius", "Matt", "Maximer", "Maximus", "Michael", "Migwell", "Mither", "Nathyn", "Nathan", "Nathynel", "Nathanyel", "Nicholus", "Nik", "Noam", "Nolyn", "Nolan", "Olver", "Olliver", "Osco", "Oscus", "Oscar", "Owyn", "Owen", "Remus", "Jaeremy", "Rian", "Ryan", "Robett", "Robb", "Roman", "Romyn", "Ryder", "Samwell", "Samuel", "Sebasten", "Bastien", "Taegus", "Santus", "Theodor", "Theodus", "Thedoras", "Thomys", "Tommas", "Tomm", "Thom", "Tophyr", "Cristor", "Tylor", "Ty", "Tylus", "Victor", "Vyctor", "Vincent", "Vyncent", "Vynce", "Wann", "Wanny", "Willam", "Willem", "Wytt", "Xander", "Alexander", "Xavyer", "Xavy", "Havy", "Zachaery", "Zeke", "Zeek", "Ezekyel", "Aaro", "Aaryn", "Abel", "Adryan", "Adrjan", "Adym", "Adam", "Aksel", "Aleks", "Aleksander", "Alver", "Andrey", "Andrej", "Andrus", "Anton", "Anyel", "Anjel", "Astyn", "Asten", "Aydyn", "Ayden", "Benyen", "Benjen", "Brahm", "Brahn", "Brandyn", "Brandjen", "Branus", "Bronn", "Dain", "Davek", "Dale", "Damyin", "Damjin", "Dan", "Danyel", "Danjel", "Domnik", "Efan", "Efjan", "Efyan", "Elijan", "Eliyan", "Elje", "Elye", "Emanus", "Emilyan", "Emiljan", "Eryk", "Erik", "Esran", "Ethyn", "Gabrjel", "Gabryel", "Gafyn", "Gafjen", "Gayl", "Gail", "Graysen", "Graisen", "Hadsen", "Hudsen", "Hafyus", "Hafjus", "Han", "Handus", "Harold", "Helyan", "Heljan", "Henrik", "Horgus", "Hossen", "Ifjan", "Yfan", "Jak", "Yak", "Jakob", "Yakob", "Jamye", "Jamje", "Jan", "Yak", "Jasyn", "Jasjen", "Johan", "Yohan", "Joren", "Yoren", "Josef", "Yosef", "Julyan", "Juljan", "Yulian", "Kaliv", "Kamrus", "Kanus", "Karl", "Yarl", "Jarl", "Karlus", "Kartus", "Kefyan", "Kefjan", "Kristofer", "Tofer", "Kristyan", "Kristjan", "Lan", "Landen", "Lefi", "Lokan", "Lucyus", "Lucjius", "Lukas", "Lyam", "Ljam", "Lyenard", "Ljenard", "Lynkus", "Linkus", "Lyonus", "Ljonus", "Lyuk", "Ljuk", "Maks", "Masyn", "Matye", "Matje", "Matyus", "Matjus", "Miglus", "Mitye", "Mitje", "Mykael", "Natyan", "Natjan", "Natyanus", "Natjanus", "Nikolas", "Nolen", "Nom", "Oskar", "Owyn", "Ojin", "Remus", "Robyet", "Robjet", "Romyn", "Romen", "Ryderus", "Riderus", "Ryn", "Rjan", "Sammen", "Santyeg", "Santjeg", "Sebastyan", "Sebastjan", "Sekyus", "Sekjus", "Skarye", "Skarje", "Teodus", "Teddus", "Tomus", "Tylus", "Tilus", "Viktor", "Viktus", "Vintus", "Vyntus", "Wilhelm", "Wyat", "Wjat", "Yaden", "Jaden", "Yaks", "Jaks", "Yaksen", "Jaksen", "Yesten", "Jesten", "Ygan", "Egan", "Yofan", "Jofan", "Yonaf", "Jonaf", "Yoshen", "Joshen", "Yosyen", "Josjen", "Ysak", "Isak", "Isaak", "Ysiah", "Isjah", "Isajas", "Abelan", "Abbos", "Abramo", "Brammos", "Adamo", "Adamos", "Adrio", "Adrios", "Adros", "Aido", "Aidos", "Aleno", "Alennos", "Alessandro", "Alesso", "Alonso", "Alonnos", "Alvero", "Alvan", "Andoran", "Handros", "Andrean", "Andrenas", "Andro", "Andros", "Angelo", "Anglos", "Antonio", "Antono", "Aro", "Aros", "Astono", "Stonnos", "Benemo", "Benemos", "Brado", "Bridos", "Brando", "Brannos", "Bruno", "Bronnos", "Caliban", "Callos", "Camero", "Kamros", "Carlos", "Karlos", "Carolan", "Karolos", "Cartero", "Karros", "Cavo", "Cavos", "Conoro", "Konoros", "Cristeno", "Cristenos", "Cristofo", "Cristos", "Dalio", "Dalian", "Damino", "Dammos", "Danello", "Danellos", "Dano", "Dannos", "Davo", "Davios", "Domino", "Domnos", "Elian", "Helian", "Eligio", "Elihios", "Elio", "Ellios", "Emanolo", "Emannos", "Enrico", "Enrikos", "Esekio", "Esekios", "Esro", "Ezro", "Ezros", "Etan", "Evanio", "Ephanos", "Gabrilo", "Gabrios", "Galan", "Gallos", "Gavano", "Gavannos", "Giaco", "Jakos", "Giacomo", "Jacomo", "Jakomos", "Giadeo", "Hadeos", "Giasson", "Giassonos", "Gionato", "Gionatos", "Giorran", "Jorros", "Gioseno", "Giosenos", "Gioseppi", "Gioseppos", "Giosso", "Hossos", "Giovan", "Jovos", "Giulio", "Hulios", "Grassio", "Grassos", "Guan", "Jannos", "Guliemo", "Guliemos", "Haddeo", "Haddeos", "Hano", "Hanos", "Hanro", "Hanros", "Hanto", "Hantos", "Hasselo", "Axlos", "Havio", "Xavios", "Horacio", "Horace", "Hosso", "Hossos", "Iacono", "Jakonos", "Iago", "Tiago", "Iamos", "Ianio", "Jannos", "Iasono", "Jasonos", "Iesso", "Hessos", "Iono", "Yonnos", "Isamo", "Isamos", "Isimo", "Isimos", "Ivano", "Ibannos", "Jeraldo", "Graddos", "Lando", "Landos", "Leo", "Leon", "Leon", "Leonnos", "Levio", "Lebbios", "Liamo", "Liamos", "Lincono", "Linconos", "Lucios", "Lukios", "Luco", "Lucos", "Lugo", "Lucan", "Luho", "Luhos", "Masono", "Masnos", "Massimo", "Maksimos", "Mateo", "Mateos", "Matos", "Matto", "Mattos", "Miglan", "Miglos", "Miguel", "Miguelos", "Milio", "Miliano", "Milyannos", "Mitro", "Mitros", "Natan", "Natannos", "Nateo", "Natos", "Nicolo", "Nicos", "Nolano", "Nolannos", "Oscaro", "Oskos", "Otio", "Ottios", "Remo", "Remmos", "Riano", "Rianos", "Ridero", "Riddros", "Robero", "Robbos", "Roman", "Romannos", "Saccoro", "Saccaros", "Samual", "Samos", "Santo", "Santos", "Sebastio", "Sebastos", "Bastio", "Teodoro", "Theodorus", "Tiago", "Iago", "Iagos", "Tagos", "Tilo", "Tiloros", "Tomo", "Tommos", "Uenio", "Unnos", "Victoran", "Tornos", "Vincenso", "Vincenzo", "Vinnos"]

let lNameHuman = ["Abell", "Alban", "Alfray", "Allen", "Amberden", "Amondsham", "Annesley", "Archer", "Ardern", "Arnold", "Asger", "Ashcombe", "Ashton", "Astley", "Atkinson", "Attilburgh", "Audeley", "Ayde", "Aylmer", "Babington", "Bailey", "Balam", "Ballard", "Bammard", "Bardolf", "Barnes", "Barrentine", "Bartelot", "Basset", "Battersby", "Baynton", "Beaumont", "Beckingham", "Bedgberry", "Beer", "Bell", "Bennet", "Berdwell", "Beresford", "Bernard", "Berry", "Bettsthorne", "Bewley", "Bigley", "Billingford", "Bishop", "Bishoptree", "Blackwell", "Blakeley", "Blexham", "Blount", "Boddenham", "Boote", "Borrell", "Bosby", "Bostock", "Bothy", "Boulder", "Bowcer", "Bownell", "Bradbridge", "Bradstone", "Brampton", "Brassie", "Brecknock", "Brewiss", "Bridgeman", "Brinkhurst", "Brocksby", "Brodnax", "Brome", "Brougham", "Browett", "Brownflet", "Brudenell", "Buckingham", "Bulstrode", "Burgh", "Burgoyne", "Burlton", "Burney", "Bushbury", "Butler", "Caley", "Campden", "Cantilupe", "Cardiff", "Carlyle", "Cassy", "Castletown", "Cavell", "Cely", "Champneys", "Chandler", "Charles", "Chatwyn", "Cheddar", "Chernock", "Chetwood", "Cheyne", "Child", "Chowne", "Church", "Clark", "Claybrook", "Clerk", "Clifton", "Clopton", "Cobham", "Cockayne", "Coddington", "Colby", "Colkins", "Colmer", "Colthurst", "Compton", "Cooke", "Coppinger", "Corby", "Cosworth", "Courtenay", "Cowill", "Crane", "Crawley", "Crickett", "Crisp", "Crocker", "Cuddon", "Cunningham", "Curzon", "Dale", "Damsell", "Danvers", "Darley", "Daunce", "Daundelyon", "Dawne", "Deacons", "Deering", "Delamere", "Dencourt", "Denton", "Derington", "Digby", "Dinley", "Doddle", "Donnett", "Dormer", "Dow", "Draper", "Drayton", "Dryland", "Duncombe", "Duredent", "Dye", "Edgar", "Edgerton", "Eggerley", "Elliot", "Elmebrigge", "Engham", "Englisch", "Erewaker", "Ertham", "Estbury", "Etchingham", "Everard", "Evingar", "Eyston", "Faldo", "Farindon", "Felbrigg", "Fenton", "Feversham", "Finch", "Fineux", "Fitton", "Fitzherbert", "Fitzralph", "Fitzwilliam", "Fleetwood", "Flexney", "Fodd", "Foliot", "Follon", "Folsham", "Ford", "Fortescue", "Fowler", "Francey", "Fraunces", "Freer", "Frewell", "Frilleck", "Froggenhall", "Froste", "Frye", "Fulmer", "Gage", "Galey", "Gare", "Garrard", "Gascoigne", "Gavell", "Geoffrey", "Gerard", "Geste", "Gifford", "Gill", "Gisborne", "Glennon", "Gobberd", "Godfrey", "Goldwell", "Gomfrey", "Goodenouth", "Goodluck", "Goodrick", "Goodwin", "Gorney", "Gosebourne", "Gray", "Greenway", "Greville", "Grimbald", "Grofhurst", "Grove", "Hackman", "Haddon", "Hakebourne", "Hall", "Hambard", "Hammond", "Hancock", "Hansart", "Harbottle", "Hardy", "Hargreve", "Harleston", "Harpeden", "Harris", "Harwood", "Hatch", "Hautreeve", "Hawksworth", "Haye", "Hayton", "Henshawe", "Heron", "Hervey", "Heywood", "Higden", "Hilderley", "Hinson", "Hoare", "Hodgson", "Holcott", "Holsey", "Holton", "Horman", "Hornley", "Horthall", "Hosteler", "Howard", "Hugeford", "Hungate", "Hussey", "Hyde", "Isley", "Jackson", "Janner", "Jay", "Jenney", "Jordan", "Joulon", "Keckilpenny", "Kelly", "Kent", "Kesteven", "Kidwelly", "Killingworth", "Kirkeby", "Knighton", "Knody", "Knyvett", "la Barre", "la Penne", "Lambert", "Langston", "Latham", "Launceleyn", "Lawnder", "Leech", "Lehenard", "Leighlin", "Lenton", "Letterford", "Leverer", "Lewis", "Leynthall", "Lind", "Lisle", "Litcott", "Litton", "Livesey", "Lockton", "Lond", "Longton", "Loveney", "Lucy", "Luke", "Lupton", "Makepiece", "Malins", "Maltoun", "Manston", "Marcheford", "Marris", "Marten", "Massingberd", "Mauntell", "Maydestone", "Maynwaring", "Medeley", "Mereworth", "Merton", "Michelgrove", "Mill", "Millis", "Milsent", "Molins", "Monde", "Montagu", "More", "Morley", "Mortimer", "Motesfont", "Mugg", "Muston", "Nash", "Nevinson", "Noke", "Norris", "Northwood", "Norwood", "Nysell", "Oke", "Olingworth", "Osborne", "Osteler", "Oxenbrigg", "Pagg", "Panshawe", "Parker", "Parsons", "Payne", "Pelletoot", "Pemberton", "Pennebrygg", "Perris", "Perryvall", "Petley", "Pettwood", "Philips", "Pinnock", "Playters", "Plimmswood", "Pole", "Polton", "Portington", "Powlett", "Pratt", "Prelate", "Prowd", "Pursglove", "Radley", "Ramsey", "Raudell", "Rawson", "Redman", "Reeve", "Richeman", "Rickworth", "Rippringham", "Robbins", "Robertson", "Rochester", "Roland", "Rondel", "Roper", "Rowdon", "Rowlett", "Rudhall", "Ruggenall", "Rusch", "Ryall", "Sackville", "Saintaubin", "Salford", "Salter", "Sampson", "Sanburne", "Saunders", "Savill", "Saynsberry", "Scobahull", "Scott", "Scrope", "Selwyn", "Sever", "Seys", "Shawe", "Sheraton", "Sherman", "Shevington", "Shingleton", "Shorditch", "Sibbell", "Simmons", "Skipwith", "Slyfield", "Snayth", "Snelling", "Sparrow", "Speir", "Spencer", "Spicer", "Sprunt", "Standon", "Stanwix", "Staunton", "Stepney", "Steward", "Stockton", "Stoke", "Stokes", "Stone", "Stoughton", "Strader", "Street", "Stubb", "Sulyard", "Swan", "Swetenham", "Tabard", "Taylor", "Thomas", "Thorne", "Thorpe", "Thursby", "Tilghman", "Tiploft", "Torrington", "Town", "Trenowyth", "Tubney", "Twarby", "Tyrell", "Underhill", "Upton", "Vaughan", "Veldon", "Vernon", "Wade", "Wake", "Waldeley", "Walford", "Wallace", "Walsch", "Walton", "Warbulton", "Wardyworth", "Warren", "Webb", "Welbeck", "Wellins", "Wensley", "Westbrook", "Weston", "Wexcombe", "Whitewood", "Whowood", "Widdowson", "Wilkins", "Willcotts", "Willis", "Wilmot", "Windham", "Winston", "Winter", "Withinghall", "Wolton", "Woodbrygg", "Worsley", "Wreke", "Wright", "Wyatt", "Wylde", "Yate", "Yelverton"]

let fNameDwarfMale = ["Aazimar", "Adils", "Adolar", "Aegir", "Agne", "Alfr", "Alpjofr", "Alrik", "Alsvid", "Alvis", "Anarr", "Anathur", "Andhrímnir", "Andlang", "Andvari", "Angrboda", "Armandin", "Arvak", "Asgard", "Aslaug", "Atheki", "Audumbla", "Aurvangr", "Austri", "Badmer", "Bafurr", "Baldr", "Banaf", "Barri", "Baugi", "Belg", "Beli", "Beno", "Bergelmir", "Berling", "Bestla", "Bifrost", "Bífurr", "Bíldr", "Billing", "Bilskirnir", "Binfurr", "Bjarki", "Bjorn", "Blodughofi", "Blot", "Bobbin", "Bodvar", "Bolthorn", "Bombur", "Borr", "Bragi", "Bredi", "Breidablik", "Brokk", "Bruni", "Bumle", "Buri", "Busey", "Byleist", "Byzar", "Canloe", "Cardaff", "Clendin", "Coldain", "Crytil", "Dag", "Dain", "Dalammer", "Dalthur", "Darthur", "Datur", "Delin", "Delling", "Didek", "Diggins", "Dinamin", "Dindaek", "Dinler", "Dolgprasir", "Domalde", "Donnel", "Doradek", "Dori", "Draugr", "Draupnir", "Dufr", "Dunil", "Dunn", "Durin", "Durkis", "Dvalin", "Dyggve", "Egil", "Eikinskjaldi", "Eikpyrnir", "Einherjar", "Eitri", "Eldhrímnir", "Eliudnir", "Elivagar", "Elli", "Embla", "Erik", "Fafnir", "Farbauti", "Felen", "Fenja", "Fenrisulfr", "Fensalir", "Fettar", "Fili", "Finn", "Fjalar", "Fjolnir", "Folkvangr", "Fornjot", "Forseti", "Founy", "Fraegr", "Frar", "Freki", "Freyja", "Freyr", "Frodi", "Frosti", "Fugan", "Fundin", "Furtog", "Gabbles", "Gabel", "Galar", "Gamin", "Gand", "Gand", "Gandalf", "Gann", "Garanel", "Garen", "Garm", "Garon", "Geirrod", "Gerd", "Geri", "Gilling", "Gimle", "Ginnarr", "Ginnungagap", "Gjallar", "Gjallarhorn", "Gjalp", "Gjoll", "Gladsheim", "Glam", "Glasir", "Gleipnir", "Glindain", "Glitnir", "Gloin", "Glynn", "Gnipahellir", "Gonin", "Grae", "Gram", "Grani", "Greip", "Grid", "Grotte", "Gullinbursti", "Gullinkambi", "Gulltopp", "Gullveig", "Gundl", "Gungnir", "Gunlok", "Gunnlod", "Gylfi", "Gymir", "Haddingjar", "Haendar", "Hagbard", "Haki", "Haldin", "Haldorak", "Halfdan", "Hanamaf", "Hanarr", "Handaaf", "Hanek", "Happ", "Har", "Harald", "Hartt", "Hati", "Haugspori", "Hedin", "Heidrun", "Heimdall", "Hel", "Helgi", "Helgrindr", "Helskor", "Helveg", "Hepti", "Hermodr", "Hildisvini", "Himinbjorg", "Hindaek", "Hindarfjall", "Hinolmer", "Hjalmar", "Hjuki", "Hlevangr", "Hlidskjalf", "Hodr", "Hoenir", "Hofvarpnir", "Hogunk", "Holdsman", "Horgr", "Hornbori", "Hraesvelgr", "Hreidmar", "Hrimfaxi", "Hrimnir", "Hringhorni", "Hrod", "Hrolf", "Hrungnir", "Hrym", "Hugin", "Hugleik", "Humkor", "Humphet", "Hvergelmir", "Hvitserk", "Hymir", "Hyndla", "Hyrrokkin", "Idavoll", "Iglan", "Ingeborg", "Ingjald", "Inudul", "Ironwood", "Izbal", "Jari", "Jarnsaxa", "Jeet", "Jormungandr", "Jorund", "Joruvollr", "Jotun", "Kadek", "Kaladim", "Kalamin", "Kaldolar", "Kanuf", "Kari", "Karl", "Kathur", "Kazon", "Keldyn", "Kilam", "Kili", "Kindor", "Kizzburr", "Koranin", "Kormt", "Kraka", "Kraki", "Krako", "Kugz", "Kvasir", "Kyte", "Lann", "Laufey", "Lif", "Lifthrasir", "Lindli", "Lindorm", "Litr", "Lodurr", "Lofarr", "Loki", "Loni", "Magni", "Managarm", "Mandin", "Mani", "Marmennill", "Mater", "Megingjord", "Menja", "Midgard", "Mimir", "Mirkwood", "Mistilteinn", "Mjolnir", "Mjoovitnir", "Modgunn", "Modi", "Mokkurkalfi", "Mundilfari", "Munin", "Murlond", "Muspel", "Myre", "Naglfar", "Nain", "Nali", "Nar", "Narfi", "Nastrond", "Nerthus", "Nidhogg", "Nidi", "Niflheim", "Ninadek", "Ninaf", "Nioi", "Nípingr", "Njord", "Noatun", "Nor", "Nordri", "Nori", "Norin", "Norn", "Norori", "Nyi", "Nyraor", "Nyzil", "Odin", "Odr", "Odrerir", "Olvaldi", "Ori", "Ormt", "Otr", "Ottar", "Ottergild", "Parn", "Peg Leg", "Pekkr", "Phell", "Pjalfi", "Pjazi", "Porinn", "Poriss", "Prainn", "Prívaldi", "Pror", "Prudgelmir", "Prudvangr", "Prymheimr", "Prymr", "Ragnhild", "Ragunk", "Ran", "Raosvior", "Ratatosk", "Raum", "Regin", "Reginnaglar", "Rerir", "Resron", "Ríg", "Rind", "Roskva", "Rundl", "Rundul", "Rylin", "Saehrímnir", "Seid", "Sessrumnir", "Sigar", "Siggeir", "Sigi", "Sigmund", "Signy", "Sigurd", "Sindri", "Sinfjotli", "Singasteinn", "Skadi", "Skafior", "Skagul", "Skídbladnir", "Skinfaxi", "Skirnir", "Skirvir", "Skoll", "Sleipnir", "Slidr", "Snaer", "Sokkvabekkr", "Sornn", "Srinn", "Storn", "Stump", "Sudri", "Sumbel", "Suori", "Surtr", "Suttung", "Svadilfari", "Svanhild", "Sveigder", "Svíorr", "Svipdag", "Tagnis", "Tanngnjostr", "Tanngrisnir", "Tantan", "Thar", "Thokk", "Thor", "Thurgadin", "Tortuk", "Trantor", "Tumpy", "Tyr", "Tyrfing", "Ullr", "Uppsala", "Urazun", "Urd", "Utgard", "Utgardaloki", "Vacto", "Vafprudnir", "Valhalla", "Vali", "Vanaheim", "Vanir", "Vanlade", "Varulf", "Vedrfolnir", "Veigr", "Verdandi", "Vestri", "Vidar", "Vigrid", "Víli", "Vimur", "Vindalfr", "Vingolf", "Virvir", "Vitr", "Völva", "Ydalir", "Yggdrasil", "Ymir", "Yngvi", "Yrsa", "Yule", "Zeffan", "Zyburr"]
let fNameDwarfFemale = ["Aanina", "Aarina", "Alanury", "Alun", "Axa", "Ayen", "Baldoleky", "Barma", "Beyla", "Bil", "Bindolmera", "Bndainy", "Brynhild", "Byggvir", "Deldryn", "Den", "Dooni", "Doramafi", "Dorlita", "Dru", "Dunony", "Duppa", "Dura", "Eir", "Ellona", "Frigg", "Ghalea", "Gibi", "Glorin", "Glynda", "Gna", "Gondul", "Grapla", "Grimhild", "Gudrun", "Gunnr", "Gurtha", "Hildr", "Hladgunnr", "Hlín", "Idunn", "Jord", "Kafia", "Kaila", "Kalameky", "Krimhild", "Lofn", "Magnus", "Margyl", "Nalda", "Nanna", "Nott", "Nultal", "Prudr", "Rota", "Saga", "Serenk", "Sif", "Signus", "Sigrdrífa", "Sigrun", "Sigyn", "Siltria", "Sjofn", "Skogul", "Skuld", "Snotra", "Sol", "Splendyr", "Svava", "Syn", "Tempia", "Tissin", "Var", "Volund", "Vor"]
let lNameDwarf = ["Anvilcrusher", "Axebiter", "Axeheft", "Battlegranite", "Battlehammer", "Battlemore", "Battlestone", "Battlestonehammer", "Bilgum", "Blackaxe", "Blackbeard", "Blackshield", "Bloodforge", "Boran", "Boulderbane", "Brightblaze", "Chestire", "Copperbrace", "Copperforge", "Copperheartstone", "Copperhelm", "Copperstone", "Coppervein", "Crackrock", "Dabldrin", "Darkfoam", "Darklin", "Deepdelver", "Deepstone", "Diamondhelm", "Diamondpick", "Diamondpickaxe", "Dumirgun", "Dunbull", "Dunfire", "Dunhill", "Earthbreaker", "Earthshaker", "Emberforge", "Emberheart", "Emeraldhammer", "Everhot", "Everhott", "Findlefinn", "Firebeard", "Fireforge", "Fireheart", "Flamebeard", "Flameforge", "Flintrock", "Foamymugs", "Frostbeard", "Frostbrow", "Frostforge", "Gemcask", "Gemcutter", "Ginfarr", "Goldbeard", "Goldbraid", "Goldencask", "Goldenshaper", "Goldgrip", "Goldheart", "Granitebeard", "Granitebrow", "Granitehammer", "Granitejaw", "Greybloom", "Grimshield", "Griststone", "Gronback", "Gylwyn", "Hammerforge", "Hammerstone", "Ironbeard", "Ironblend", "Ironbrace", "Ironbrow", "Ironfoot", "Ironhelm", "Ironpick", "Ironstone", "Irontoe", "Jestands", "Jure", "Kelgand", "Lauley", "Malfoot", "Marwind", "Mithrilbeard", "Mithrilhammer", "Mithrilstrike", "Molunel", "Mumfur", "Nehart", "Nightseer", "Norkhitter", "Nusback", "Oakenshield", "Oakenshieldforge", "Oakenshieldstone", "Oakenshoulder", "Ogrebane", "Orcslicer", "Oreheart", "Oresinger", "Pickstone", "Ratsbome", "Ratsbone", "Razbind", "Razdal", "Reminjar", "Rockfinder", "Rockstrider", "Rubygrasp", "Rubyhammer", "Rubyshield", "Rucksack", "Rucksif", "Rundlor", "Shieldbreaker", "Silveraxe", "Silvern", "Silverstrike", "Silvervein", "Silverveinshield", "Smeltpot", "Splitshield", "Steelaxe", "Steelbeard", "Steelcutter", "Steelgrasp", "Steelheart", "Steelshaper", "Steelwield", "Stonebeard", "Stonecrafter", "Stoneforge", "Stoneheart", "Stonesplitter", "Stonevein", "Stonewarden", "Stormbeard", "Stormbreaker", "Stormhammer", "Stormpick", "Stormshield", "Stoutaxe", "Strongpick", "Targnarle", "Thranon", "Thunderbrow", "Thunderclan", "Thunderfist", "Thunderforge", "Thundergrip", "Thunderhelm", "Thundershield", "Thundervein", "Trueblade", "Ventille", "Yaptongue"]

let fNameElfMale = ["Adan", "Adanion", "Aearion", "Aefaradien", "Aeglironion", "Aemornion", "Aerdirnaithon", "Agormenion", "Ainion", "Airadan", "Airion", "Alagos", "Alassien", "Almárean", "Alyameldir", "Alyan", "Amonost", "Andaer", "Anessen", "Antien", "Aphaderuiondur", "Aradan", "Arandorion", "Arandur", "Arandur", "Aranethon", "Aranhil", "Aranion", "Aransadorien", "Arbellason", "Arphenion", "Arphenion", "Arthion", "Arthonnen", "Athradien", "Authion", "Balamaethor", "Balanidhren", "Bandorion", "Baradhamon", "Baramaethor", "Barathion", "Barathon", "Beinion", "Beinion", "Beinion", "Beinion", "Beleg", "Bellasvalainon", "Bellcaunion", "Bellmaethorion", "Bellrauthien", "Bellsulion", "Bellthandien", "Bercalion", "Beriadan", "Beridhren", "Beriogelir", "Beriohtarion", "Beriothien", "Bregolien", "Breithmudason", "Bruicaunion", "Caelamondorion", "Calamaethor", "Calanon", "Calminaion", "Carandol", "Caranion", "Carsuithon", "Castien", "Caunardhon", "Caundaugion", "Caunidhrenon", "Caunion", "Caunion", "Caunwaithon", "Ceberlandon", "Cerederthan", "Cerediron", "Ceredirond", "Cilmion", "Côfniben", "Cugechilon", "Cugedhion", "Cugedhion", "Cundmaethor", "Daermaethor", "Daeron", "Daeron", "Daugion", "Daugobelion", "Daugon", "Dorainen", "Dornornoston", "Dorsidhion", "Dramorion", "Draugminaion", "Draugolë", "Dûrion", "Edenost", "Edenoston", "Eglerion", "Eglerion", "Eglerion", "Ehtyarion", "Eithelonnen", "Elenion", "Eleyond", "Emerion", "Eraisuithon", "Eredhion", "Eruadan", "Eruansathron", "Eruantien", "Eruantien", "Eruantien", "Eruantion", "Eruaphadion", "Eruaran", "Erubadhron", "Erucaron", "Erudagrian", "Eruedraith", "Eruedraithon", "Eruestan", "Eruheran", "Erumaren", "Erumeldir", "Erumollien", "Erunestian", "Erurainion", "Erurainon", "Erutáron", "Erutulcien", "Erynion", "Erynion", "Faelon", "Faeron", "Falasnornion", "Feredir", "Galasrinion", "Glandur", "Glanhelmion", "Gleinadhorion", "Glenndaugion", "Glennodad", "Gondien", "Gonmudasion", "Gwetherindolien", "Habriston", "Haerion", "Haldir", "Handion", "Hebion", "Herenyonnen", "Herion", "Hérion", "Hérion", "Heronion", "Hirgon", "Hirnaeranin", "Horthien", "Hothien", "Hûrtassion", "Iauron", "Idhrenion", "Idhrenion", "Idhrenohtar", "Îdhron or Randir", "Imrathion", "Imrathon", "Indómerun", "Ionwë", "Istmaedhon", "Istuion", "Laermeluion", "Lainadan", "Lainathion", "Laiqualassien", "Lairelandon", "Lairion", "Lairondren", "Lalaithion", "Lancaeron", "Landathradon", "Landion", "Lathron", "Limdur", "Lithaldoren", "Lithônion", "Locien", "Maeglad", "Maererun", "Maeron", "Maethirion", "Maethorion", "Máfortion", "Maidhfinden", "Maidhion", "Maldor", "Manwë", "Manwë", "Marcaunon", "Mardion", "Mátamelcan", "Megildur", "Melcindómien", "Melcinítan", "Meldarion", "Meldariondwë", "Meldiron", "Melimion", "Menathradon", "Merilairon", "Miluion", "Minaithelan", "Minastion", "Minyadan", "Mithrennon", "Miuverthon", "Morcion", "Mordemirdanian", "Morfindien", "Mornefindon", "Mornenion", "Morohtar", "Naracion", "Nechaenion", "Nedhudir", "Nendir", "Nessimon", "Nestarion", "Nestaron", "Nethaefarason", "Nethraunien", "Neurion", "Nibencarden", "Nibenon", "Nibensirien", "Nimtolien", "Nithron", "Nostalion", "Nostarion", "Nosteruion", "Onónion", "Ortherion", "Orthorien", "Ovorion", "Parthannûn", "Polengoldur", "Racerediron", "Raegbund", "Rainantien", "Rainion", "Raunien", "Revion", "Rhassbaradhon", "Rhassdorthion", "Rhovanion", "Rilien", "Rimedur", "Rincavornon", "Rinion", "Rissien", "Rochendil", "Roherdiron", "Rûdhon", "Ruscion", "Sadron", "Sadron", "Saeldur", "Sellion", "Sidhenidon", "Sidhion", "Sidhion", "Sidhpantion", "Sidhpantion", "Suiadan", "Suiadan", "Suiadan", "Suiadanion", "Suiauthon", "Suiauthon", "Suiauthon", "Talathârdon", "Talathion", "Tâldaugion", "Talfagoron", "Tangadion", "Taurhassdorien", "Taurion", "Taurvantian", "Tawarthion", "Tegalad", "Thalion", "Thandion", "Thandraug", "Tharsirion", "Thorontur", "Tidurian", "Tirithon", "Tithaefarason", "Tithdaeron", "Tristimdorion", "Tuilalcaron", "Turin", "Tûrin", "Tûrsidhion", "Turwaithion", "Úpadion", "Urúvion", "Útíradien", "Valanyonnen", "Valdaglerion", "Valpamiucon", "Valpanbarion", "Vanafindon", "Vanafindon", "Vanimon", "Veassen", "Vehiron", "Veryamaethon", "Veryamorcon", "Veryan", "Veryangóle", "Voronwë", "Yattien"]
let fNameElfFemale = ["Adanessa", "Adlanna", "Adlanniel", "Adonnenniel", "Aeariel", "Aegliriell", "Aemorniel", "Aercalima", "Aerlinniel", "Aeroniel", "Aeronniell", "Aesuithiel", "Aglariel", "Ainathiel", "Aineldiel", "Aintithenniel", "Airedhiel", "Airemana", "Aistacariel", "Aistaraina", "Alassë", "Alassëa", "Alassiel", "Alastegiel", "Almárëa", "Alya", "Amaniel", "Amariel", "Amoniel", "Amonniel", "Anameleth", "Anariel", "Andaeriel", "Andranniel", "Anessathiel", "Anira", "Antiel", "Apsenniel", "Aragarthiel", "Aranduriel", "Aranel", "Aranhilwen", "Arasinya", "Arawen", "Ardhoniel", "Arquenniel", "Arwen", "Authiel", "Bainwen", "Barathiel", "Barvarnilairiel", "Baudhiel", "Beinedhiel", "Bellasiel", "Bellcauniel", "Belleruraina", "Bellethiel", "Belltassiel", "Berethiel", "Beriadanwen", "Beriadhwen", "Beriaearwen", "Berialagoswen", "Beriana", "Berthadhiell", "Bronwethiel", "Bruinedhiel", "Buieruwen", "Caladhiel", "Caladwen", "Calairiel", "Calathiel", "Calenmiriel", "Calminaiel", "Caramiriel", "Carnadhiel", "Castiel", "Caunanechiel", "Caunedhiel", "Caunwen", "Celunibeniel", "Cirelondiel", "Círtolthiel", "Crabanniel", "Crabatithenniel", "Cugedhiel", "Cuiledhwen", "Cuilpantiel", "Cuilwen", "Daeralda", "Daerwen", "Daugleriadhwen", "Daugobelwen", "Dessuithiel", "Dolithiel", "Dolledhiel", "Doredhelwen", "Doredhiel", "Dorlainedainwen", "Draugathiel", "Dúventoliel", "Earenniel", "Earmaiviel", "Eärwen", "Eccaia", "Edhelwen", "Edlothialaswen", "Egleriel", "Elarinya", "Eleniel", "Ellethwen", "Elvellonwen", "Ennostiel", "Eraisuithiel", "Ercassiel", "Erdolliel", "Eriathwen", "Eruainantiel", "Eruaistaniel", "Eruanna", "Eruantiel", "Eruantienell", "Eruaphadriel", "Erubadhriel", "Erudessa", "Eruherdiriel", "Erulaeriel", "Erulassë", "Erulastiel", "Erulissë", "Erumara", "Erunanethiel", "Eruraina", "Eruraviel", "Eruthiawen", "Eruva", "Eruwaedhiel", "Estelpantiel", "Estelwen", "Estonniel", "Ethiriel", "Faelostiel", "Faelwen", "Fainauriel", "Falathiel", "Fáreryniel", "Feanathiel", "Filegedhiel", "Filegethiel", "Filidhrentithiel", "Findëmaxa", "Forvenniel", "Galadhwen", "Galasriniel", "Galedlothia", "Geliriel", "Glanlotiel", "Gliriel", "Gondothiel", "Gondtithenniel", "Gothweniel", "Gwaedhiel", "Gwedhiel", "Gwestiel", "Gwetherindoliel", "Gwilwileth", "Gwilwilethel", "Gwirithiel", "Habristiel", "Haeronalda", "Haeronwen", "Haldaraina", "Hannasiel", "Hantadhiel", "Hantaliel", "Helinniel", "Helmaninquiel", "Henaradwen", "Héra", "Herenya", "Honalassiel", "Huoriel", "Hûredhiel", "Hûrtassiel", "Hyarmenothiel", "Idhrenniel", "Iellwen", "Ilbrethladwen", "Indilwen", "Inimeitiel", "Istimaethoriel", "Istimiel", "Ithilethiel", "Ithilwen", "Laerwen", "Laesneniel", "Lainathiel", "Laindessiel", "Laiqualassiel", "Laiquardiel", "Lairelithoniel", "Lairënuriel", "Lairiel", "Laisidhiel", "Lammirima", "Lancaeriel", "Lassiel", "Lathronniel", "Laucamiluiel", "Limbairedhiel", "Limoladiel", "Limpedhiel", "Limwen", "Lindariel", "Lindethiel", "Linnadhiel", "Liruliniel", "Lithôniel", "Lona", "Lónannûniel", "Lostariel", "Lostithenniel", "Lothiriel", "Lothroniel", "Lúthien", "Maersiniathwen", "Maerwen", "Maetharanel", "Maethoriel", "Mainonnenniel", "Malthenniel", "Manathiel", "Mantheniel", "Manwamahtariel", "Manwameldiel", "Manwathiel", "Maranwethiel", "Marcauniel", "Marilla", "Medlinniel", "Medlinya", "Megilwen", "Melardhoniel", "Melcistima", "Melda", "Meldacaniel", "Meldainiel", "Meldamiriel", "Meldiriel", "Melethainiel", "Melethiel", "Melima", "Mellimeldisiel", "Meltithenniel", "Meltôriel", "Menathradiel", "Menelwen", "Mentathiel", "Merilwen", "Methenniel", "Miluiel", "Minaethiel", "Minastauriel", "Minuialwen", "Miriel", "Mirima", "Mithrenniel", "Mordollwen", "Móreadhiel", "Moréfindiel", "Morwen", "Naerdiel", "Naerwen", "Nanethiel", "Náriel", "Narylfiel", "Nathronniel", "Nellethiel", "Nesseldë", "Nessima", "Nestariel", "Nethlhindorniel", "Neuriel", "Nibenwen", "Nieriel", "Nimgarthiel", "Nimthîriel", "Nimwen", "Ninniachel", "Nioniel", "Nithiel", "Nithpantiel", "Nostariel", "Nosteruionwen", "Onnedhiel", "Ostrandiriel", "Palantiriel", "Pandothiel", "Pánedhiel", "Panolviel", "Pantanwariel", "Pathlanniel", "Pedlimwen", "Pendecardiel", "Pilindiel", "Quanteruanna", "Quessangiel", "Raina", "Rainarasinya", "Rainerudhiel", "Rainyaviel", "Randiriel", "Rawodhiel", "Remethiel", "Rhasslairiel", "Rhavaniel", "Riniel", "Rochendilwen", "Rodwen", "Rossarinya", "Sabariel", "Sadronniel", "Saercalwen", "Saeruwaedhiel", "Saerwen", "Sairahiniel", "Santiel", "Sanya", "Sarnedhiel", "Seldirima", "Sérëdhiel", "Serethiel", "Sidhiel", "Sidhlairiel", "Sidhmeldiriel", "Sidhnanledhiel", "Silacaladhiel", "Siladhiel", "Sílapenniel", "Silima", "Silivrenniel", "Silivrentoliel", "Silivrentolwen", "Solorfainiel", "Sydney", "Talanniel", "Talathiel", "Tanlicumiel", "Tanna", "Tardoliel", "Tarellethiel", "Tariel", "Taurauthiel", "Tauredhiel", "Tawariell", "Tegaladwen", "Teithagliriel", "Thalionwen", "Thandiel", "Tharwaithiel", "Thenidiel", "Tirananniel", "Tirithiel", "Tithenmamiwen", "Tobostiel", "Tolandiel", "Torthadiel", "Tuarwen", "Tucagwathiel", "Tuimadhiel", "Tulcadhiel", "Turistima", "Turtegiel", "Turwaithiel", "Tûrwethiel", "Úpadiel", "Uralimpiel", "Úsahtiel", "Útheniniel", "Útíradiel", "Valadhiel", "Valainantiel", "Valainistima", "Valauthiel", "Validhreniel", "Valiedhiel", "Valisilwen", "Valpantiel", "Vanadessë", "Vanafindiel", "Vanamarilla", "Vancarmiel", "Vandathiel", "Vanessë", "Vanglirtána", "Vanimaista", "Vanlanthiriel", "Vanmoriel", "Vanya", "Vanyalanthiriel", "Vardainiel", "Velossfaeniel", "Vendethiel", "Venessiel", "Véredhiel", "Verisiel", "Verya", "Veryamedliel", "Vindyamiriel", "Yára", "Yáviel", "Yerathiel", "Yernadhiel"]
let lNameElf = ["Aelorothi", "Aendryr", "Aerasumé", "Aeravansel", "Agayous", "Agrivar", "Ahmaquissar", "Alaenree", "Alantar", "Alastrarra", "Alavara", "Alenuath", "Alerothi", "Alluth", "Aloevan", "Aluianti", "Aluviirsaan", "Amalith", "Amarallis", "Amaratharr", "Amarthen", "Ammath", "Amrallatha", "Anuaer", "Argentaamn", "Arren", "Ash", "Ashgrove", "Audark", "Auglamyr", "Auglathla", "Aunglor", "Autumnfire", "Bellas", "Berethryl", "Berilan", "Bharaclaiev", "Bhephel", "Blackhelm", "Braegen", "Briarbosk", "Brightcloak", "Brightsong", "Brightwing", "Caersaelk", "Calaudra", "Calauth", "Camusiil", "Cathdeiryn", "Ceretlan", "Chaadren", "Chamaranthe", "Clatharla", "Cormyth", "Coudoarluth", "Craulnober", "Crystalembers", "Dahast", "Dawnhorn", "Dhorinshyl", "Dlardrageth", "Doedance", "Donnathlascen", "Dracoseir", "Dree", "Duirsar", "Durothil", "Duskmere", "Duthjuth", "Ealoeth", "Echorn", "Elaéyadar", "Elassidil", "Elian", "Ellarian", "Elond", "Eluarshee", "Ereuvyn", "Erkowe", "Erladden", "Erlshade", "Eroth", "Estelda", "Evanara", "Eveningfall", "Everlove", "Evioro", "Eyriendor", "Faerondaerl", "Faerondarl", "Falanae", "Felinaun", "Fellmirr", "Fenmarel", "Fflannidan", "Floshin", "Fynnasla", "Gildenguard", "Goadulphyn", "Goldenleaf", "Gourael", "Greencloak", "Gwaelon", "Haell", "Haerlgent", "Haevaul", "Haladar", "Halavanthlarr", "Hawksong", "Hlarr", "Hyshaanth", "Iazymnal", "Ibryiil", "Ilbaereth", "Ilbenalu", "Ildacer", "Ildroun", "Iliathor", "Iliathor", "Iliathorr", "Ilnatar", "Immeril", "Ipyllasc", "Irian", "Irithyl", "Irithyl", "Ithruen", "Iydril", "Jaglene", "Kadelaryn", "Kelerandri", "Keove", "Kevanarial", "Korianthil", "Kraok", "Laelithar", "Laralytha", "Larenthanil", "Larethian", "Laughingwater", "Leafbower", "Leafsigil", "Lharithlyn", "Lhoril", "Lightshiver", "Llundlar", "Loceath", "Mhaaren", "Maendellyn", "Maerdrym", "Meirityn", "Melruth", "Miritar", "Mistrivvin", "Mistwinter", "Mithalvarin", "Moonbow", "Moondown", "Moonflower", "Moonglade", "Moonglamaer", "Moonsnow", "Moonweather", "Morningdove", "Mornmist", "Mrhulaedir", "Nacnar", "Naelgrath", "Narlbeth", "Narlbeth", "Neirdre", "Nelnueve", "Nhachashaal", "Nhaéslal", "Nharimlur", "Nierde", "Nightmeadow", "Nightstar", "Nightwing", "Nihmedu", "Nimesin", "Nlossae", "Nlossae", "Nolbrae", "Nyamtharsar", "Nyntynel", "Oakstaff", "Oakwood", "Olortynnal", "Olyrnn", "Omberdawn", "Ongluth", "Orama", "Orbryn", "Orbryn", "Ortauré", "Oumryn", "Phenthae", "Pholont", "Presrae", "Rachiilstar", "Raedrimn", "Raryndur", "Reithel", "Revven", "Rhaevaern", "Rhothomir", "Rhuidhen", "Rhyllgallohyr", "Rivleam", "Rivvikyn", "Runemaster", "Sarsantyr", "Selakiir", "Selmer", "Selorn", "Shadowmantle", "Shadowwater", "Shaeremae", "Shaethe", "Shalandalan", "Sharrith", "Shaurlanglar", "Shraiee", "Shyr", "Sicafei", "Siltral", "Silverbow", "Silverhand", "Silveroak", "Silverspear", "Sinaran", "Slenderbow", "Soryn", "Spellstalker", "Srinshee", "Starbrow", "Starglance", "Starglow", "Starnar", "Starym", "Stillhawk", "Stilmyst", "Straeth", "Strongbow", "Suldusk", "Sultaasar", "Summerstars", "Sunweaver", "Swordstar", "Symbaern", "Talandren", "Talesspur", "Tamlyranth", "Tanagathor", "Tarnruth", "Tarsap", "Tarsis", "Tassarion", "Taurntyrith", "Tellynnan", "Teshurr", "Thea", "Tlanbourn", "Tohrthaal", "Toralynnsyr", "Tornglara", "Tornglara", "Torthtan", "Toryvhallen", "Trueshot", "Tsornyl", "Tyrneladhelu", "Uirthur", "Ulondarr", "Ulongyr", "Vandiir", "Veverell", "Vispasial", "Vyshaan", "Waelvor", "Whitethistle", "Windstar", "Windwalker", "Xantrani", "Yeschant", "Yhendorn", "Yraueme", "Yridnae", "Yundraer"]

let fNameHalfElfMale = ["Aelorothi", "Alavara", "Amarthen", "Auglathla", "Briarbosk", "Chaadren", "Dlardrageth", "Echorn", "Erlshade", "Falanae", "Gourael", "Hyshaanth", "Ilnatar", "Kelerandri", "Laughingwater", "Maendellyn", "Moonflower", "Narlbeth", "Nightmeadow", "Oakstaff", "Oumryn", "Revven", "Selmer", "Shyr", "Spellstalker", "Strongbow", "Tanagathor", "Tohrthaal", "Ulondarr", "Xantrani", "Aeglironion", "Alyameldir", "Arandur", "Athradien", "Beinion", "Bercalion", "Calamaethor", "Caunion", "Cugedhion", "Dornornoston", "Eglerion", "Eruantien", "Eruedraithon", "Erutulcien", "Gleinadhorion", "Hebion", "Hûrtassion", "Istmaedhon", "Lancaeron", "Maeron", "Mardion", "Merilairon", "Mornefindon", "Nethaefarason", "Nosteruion", "Rainion", "Rissien", "Sidhion", "Suiauthon", "Tegalad", "Tristimdorion", "Valdaglerion", "Veryan", "Abby", "Abram", "Adolf", "Aguinaldo", "Alaa", "Aldis", "Aleksandrs", "Alfonzo", "Allan", "Alphonso", "Ambrosius", "Andonis", "Andrus", "Anselm", "Antonio", "Archon", "Armond", "Arthur", "Ashish", "Augustine", "Avi", "Baily", "Barnabe", "Barret", "Barthel", "Bartolomeo", "Bealle", "Bengt", "Bennie", "Berkie", "Bertrand", "Bjorne", "Bogart", "Bradly", "Brewster", "Broderick", "Bryant", "Burke", "Caesar", "Carey", "Carroll", "Cass", "Chalmers", "Charley", "Chester", "Christian", "Christy", "Clark", "Clayton", "Clifford", "Cobby", "Connolly", "Corby", "Costa", "Cy", "Dalton", "Dannie", "Darius", "Daryle", "Davon", "Demetre", "Derek", "Desmund", "Dieter", "Dionis", "Don", "Douggie", "Dryke", "Durand", "Dylan", "Eddie", "Eduardo", "Elias", "Ellwood", "Elwood", "Emmery", "Englebart", "Erasmus", "Erl", "Esme", "Ev", "Ezra", "Felix", "Filbert", "Flemming", "Fons", "Forster", "Frankie", "Freddy", "Fremont", "Gabriele", "Gardener", "Garrot", "Gary", "Gearard", "Georgia", "Germaine", "Gian", "Giffy", "Giordano", "Glynn", "Gonzales", "Graeme", "Gregory", "Guillermo", "Guthrey", "Hakeem", "Hamel", "Han", "Harcourt", "Harrison", "Harwell", "Haydon", "Heinz", "Herb", "Hermy", "Hervey", "Hilary", "Hiram", "Horacio", "Hugh", "Husain", "Ibrahim", "Igor", "Inigo", "Isadore", "Izak", "Jake", "Jarrett", "Jean-Luc", "Jefferson", "Jerald", "Jermayne", "Jerzy", "Jimbo", "Jodi", "Johnathan", "Jonathan", "Joseph", "Judah", "Julian", "Kalman", "Keefe", "Kelwin", "Kenton", "Kin", "Klaus", "Kristian", "Lance", "Laurens", "Lazare", "Lem", "Leon", "Lesley", "Lex", "Lion", "Lonny", "Lowell", "Luigi", "Mace", "Mahmud", "Marcello", "Mario", "Marlow", "Martin", "Mateo", "Matthieu", "Maurits", "Mayer", "Melvyn", "Merrel", "Mic", "Mick", "Mikhail", "Mitchell", "Monroe", "Morly", "Morty", "Murdoch", "Napoleon", "Neale", "Nels", "Neville", "Nickey", "Nikki", "Noble", "Norris", "Octavius", "Oliver", "Orin", "Osborne", "Otes", "Paco", "Parke", "Pat", "Patrik", "Pembroke", "Percival", "Philbert", "Piet", "Pooh", "Prescott", "Quentin", "Quint", "Rafe", "Ram", "Randie", "Ravil", "Red", "Reggie", "Remington", "Reuben", "Ricard", "Rick", "Ripley", "Robin", "Roderic", "Rodrick", "Rolfe", "Ronald", "Rourke", "Ruddie", "Rufus", "Rutherford", "Salomon", "Samuel", "Sanson", "Saunderson", "Sayers", "Scotty", "Sergeant", "Shanan", "Shea", "Shelton", "Sherman", "Shurlocke", "Sig", "Silvio", "Skell", "Skylar", "Sol", "Spencer", "Stafford", "Stanton", "Stephen", "Stewart", "Sullivan", "Sylvan", "Taddeo", "Tam", "Tarrance", "Tedie", "Teodoro", "Thacher", "Thatch", "Theodore", "Thornie", "Tiebold", "Tito", "Tod", "Tommy", "Torrey", "Tracie", "Trent", "Truman", "Ty", "Udale", "Ulrick", "Uriel", "Van", "Verge", "Vick", "Vinod", "Voltaire", "Wake", "Wallache", "Wang", "Wat", "Web", "Welsh", "Westbrooke", "Whitney", "Wilek", "Willi", "Wilton", "Winslow"]
let fNameHalfElfFemale = ["Abagael", "Adanessa", "Adey", "Adriana", "Aeroniel", "Agnese", "Ailina", "Aistacariel", "Albertina", "Alex", "Alicea", "Alleen", "Allyson", "Alvina", "Amalea", "Amata", "Amoniel", "Anastasie", "Andriette", "Angelica", "Anitra", "Annabella", "Anne-Marie", "Annora", "Anya", "Aranhilwen", "Ardis", "Arlana", "Arlyn", "Astrid", "Audie", "Aurelea", "Aveline", "Bainwen", "Barbie", "Beatriz", "Belicia", "Belvia", "Beriadanwen", "Bernette", "Berti", "Betsey", "Beverie", "Binny", "Blinnie", "Bobette", "Brandie", "Briana", "Brina", "Brittney", "Buffy", "Calathiel", "Camellia", "Candide", "Carey", "Carleen", "Carlye", "Carmita", "Caroline", "Caryn", "Cassy", "Cathie", "Catriona", "Celene", "Celle", "Charita", "Charmian", "Cherianne", "Cheryl", "Christabel", "Christina", "Cindee", "Clarabelle", "Clarisse", "Clementina", "Codi", "Conchita", "Consuelo", "Cordy", "Corinne", "Corrina", "Crissy", "Cugedhiel", "Cynthy", "Daisey", "Danella", "Danita", "Darby", "Darlene", "Daune", "Deanne", "Dedra", "Delcina", "Delphinia", "Denyse", "Devondra", "Dianna", "Dita", "Dolora", "Donnamarie", "Dorelia", "Dorisa", "Dorrie", "Drew", "Dyane", "Easter", "Edi", "Egleriel", "Eleanor", "Elga", "Eliza", "Elly", "Elsi", "Elysha", "Emilee", "Emmeline", "Enrika", "Erika", "Ertha", "Eruraina", "Estel", "Ethelind", "Eunice", "Evelyn", "Faelwen", "Fanny", "Fawn", "Felecia", "Fernanda", "Filide", "Flore", "Florri", "Francesca", "Fred", "Fulvia", "Gae", "Gayla", "Genna", "Georgiamay", "Gerianne", "Gertrude", "Gilli", "Gipsy", "Glenda", "Glynis", "Gracie", "Gretna", "Gunvor", "Gwendolyn", "Gwyn", "Halie", "Hantadhiel", "Harriette", "Hedi", "Helge", "Henriette", "Hetti", "Holley", "Huoriel", "Idalina", "Ilka", "Indira", "Inna", "Isabel", "Istimaethoriel", "Jacintha", "Jacquelynn", "Jamie", "Janelle", "Janine", "Jasmina", "Jeanne", "Jenette", "Jennifer", "Jess", "Jewelle", "Jo", "Joby", "Joelle", "Jolene", "Jordanna", "Josi", "Juanita", "Julianne", "Junina", "Kaitlyn", "Kamila", "Karena", "Karleen", "Karoly", "Kassie", "Kathe", "Kati", "Katya", "Kelci", "Kelsy", "Keslie", "Kiley", "Kippy", "Kit", "Kordula", "Kristal", "Krystle", "Lacy", "Laisidhiel", "Laraine", "Laucamiluiel", "Lauri", "Leah", "Leena", "Lena", "Leonie", "Leticia", "Lib", "Lilias", "Lina", "Linn", "Lise", "Lizabeth", "Lonee", "Loren", "Lorine", "Lotta", "Lucia", "Luelle", "Lyda", "Lynette", "Mabelle", "Madelina", "Maerwen", "Mahalia", "Malina", "Malynda", "Marabel", "Marcy", "Margarita", "Margurite", "Marie-Ann", "Marilin", "Maritsa", "Marleen", "Marrilee", "Martina", "Maryl", "Matti", "Mavra", "Meara", "Mei", "Meldamiriel", "Melisent", "Melodee", "Mercy", "Merline", "Meta", "Micki", "Milli", "Minetta", "Mireielle", "Mitra", "Mona", "Morgen", "Mureil", "Myrtice", "Nana", "Nanni", "Natalia", "Nedi", "Nena", "Nesta", "Nicki", "Niki", "Ninon", "Noella", "Nonnah", "Novelia", "Ofella", "Olwen", "Oprah", "Orly", "Paloma", "Paola", "Paula", "Pearline", "Pepita", "Petronia", "Phillida", "Pietra", "Pru", "Quintilla", "Raina", "Randiriel", "Ray", "Rebekkah", "Remy", "Rey", "Rhona", "Risa", "Robbyn", "Rochella", "Ronda", "Rosabella", "Rosanne", "Rosemonde", "Roxana", "Rozele", "Ruthe", "Sadie", "Samantha", "Sapphire", "Sascha", "Seldirima", "Serena", "Shani", "Sharl", "Shawnee", "Sheila-Kathryn", "Shelly", "Shilpa", "Sianna", "Sidhmeldiriel", "Silva", "Sissie", "Sophi", "Starla", "Stephannie", "Sue", "Susi", "Sybila", "Tabina", "Tamera", "Tanlicumiel", "Tatiana", "Tedra", "Terina", "Tessy", "Theresa-Marie", "Tierney", "Tim", "Tithenmamiwen", "Tommi", "Tova", "Trisha", "Tuesday", "Ulrika", "Útíradiel", "Valentine", "Valpantiel", "Vanmoriel", "Venita", "Verna", "Vikki", "Violet", "Vivian", "Wallis", "Wileen", "Wilmette", "Winonah", "Yáviel", "Yoshi", "Zelma", "Zorina"]
let lNameHalfElf = ["Aelorothi", "Aeravansel", "Ahmaquissar", "Alastrarra", "Alerothi", "Aluianti", "Amarallis", "Ammath", "Argentaamn", "Ashgrove", "Auglathla", "Bellas", "Bharaclaiev", "Braegen", "Brightsong", "Calaudra", "Cathdeiryn", "Chamaranthe", "Coudoarluth", "Dahast", "Dlardrageth", "Dracoseir", "Durothil", "Ealoeth", "Elassidil", "Elond", "Erkowe", "Eroth", "Eveningfall", "Eyriendor", "Falanae", "Fenmarel", "Fynnasla", "Goldenleaf", "Gwaelon", "Haevaul", "Hawksong", "Iazymnal", "Ilbenalu", "Iliathor", "Ilnatar", "Irian", "Ithruen", "Kadelaryn", "Keove", "Kraok", "Larenthanil", "Le’Quella", "Lharithlyn", "Llundlar", "Maendellyn", "Melruth", "Mistwinter", "Moondown", "Moonglamaer", "Morningdove", "Nacnar", "Narlbeth", "Never", "Nharimlur", "Nightmeadow", "Nihmedu", "Nlossae", "Nyntynel", "Olortynnal", "Ongluth", "Orbryn", "Phenthae", "Naepp", "Raedrimn", "Revven", "Rhuidhen", "Rivvikyn", "Selakiir", "Shadowmantle", "Shaethe", "Shaurlanglar", "Sicafei", "Silverhand", "Sinaran", "Spellstalker", "Starglance", "Starym", "Straeth", "Sultaasar", "Swordstar", "Talesspur", "Tarnruth", "Tassarion", "Teshurr", "Tohrthaal", "Tornglara", "Trueshot", "Uirthur", "Vandiir", "Vyshaan", "Windstar", "Yeschant", "Yridnae", "Ackworth", "Alban", "Alicock", "Allington", "Amondsham", "Ansty", "Ardern", "Arthur", "Ashcombe", "Askew", "Atherton", "Attilburgh", "Audlington", "Aylmer", "Babington", "Baker", "Ballard", "Barber", "Barker", "Barrentine", "Bartelot", "Bathurst", "Baynton", "Beaurepaire", "Bedgberry", "Beeton", "Bennet", "Berecraft", "Bernard", "Berwick", "Bewforest", "Bigley", "Bingham", "Bishopson", "Blackwell", "Blennerhayset", "Bloom", "Boddenham", "Boothe", "Bosby", "Boston", "Boulder", "Bowcer", "Bowyar", "Bradstone", "Branch", "Braunstone", "Brecknock", "Brett", "Bridgeman", "Bristow", "Brodnax", "Brook", "Browett", "Browning", "Buckingham", "Burgess", "Burgoyne", "Burnell", "Bushbury", "Byfield", "Campden", "Carbonall", "Carlyle", "Castell", "Cavell", "Chamberlain", "Chandler", "Chase", "Cheddar", "Chester", "Cheyne", "Chilton", "Church", "Clavell", "Clerk", "Clitherow", "Cobham", "Cod", "Coggshall", "Colkins", "Colt", "Compton", "Coorthopp", "Corby", "Cotton", "Cowill", "Cranford", "Crickett", "Cristemas", "Cuddon", "Curtis", "Dale", "Danett", "Darley", "Dauncey", "Dawne", "Dean", "Delamere", "Dennis", "Derington", "Dimmock", "Doddle", "Doreward", "Dow", "Draw", "Dryland", "Dunham", "Dye", "Edgcombe", "Eggerley", "Ellis", "Engham", "Epworth", "Ertham", "Eston", "Everard", "Eyer", "Faldo", "Fayneman", "Fenton", "Fienley", "Fineux", "Fitzgeoffrey", "Fitzralph", "Fleet", "Flexney", "Fogg", "Follon", "Fonteyn", "Fortescue", "Fox", "Fraunces", "Freville", "Frilleck", "Fromond", "Frye", "Furnace", "Galey", "Garnis", "Gascoigne", "Gedding", "Gerard", "Gibbs", "Gill", "Gittens", "Gobberd", "Gold", "Gomershall", "Good", "Goodluck", "Goodrington", "Gorney", "Grafton", "Greenway", "Grey", "Grofhurst", "Guildford", "Haddon", "Hale", "Hambard", "Hampden", "Harbird", "Hardy", "Harlakinden", "Harpeden", "Harte", "Hasard", "Hautreeve", "Hawtrey", "Hayton", "Herleston", "Hervey", "Heyworth", "Hilderley", "Hitchcock", "Hodgson", "Holland", "Holton", "Hornebolt", "Horthall", "Hotham", "Hugeford", "Hurst", "Hyde", "Jackmann", "Janner", "Jendring", "Jordan", "Jowchet", "Kelly", "Keriell", "Kidwelly", "Kinge", "Knighton", "Knoyll", "la Barre", "Lacy", "Langston", "Latton", "Lawnder", "Leeds", "Leighlin", "Lestrange", "Leverer", "Leynham", "Lind", "Litchfield", "Litton", "Lloyd", "Lond", "Longton", "Lowth", "Luke", "Lyfeld", "Malemayns", "Maltoun", "Mapilton", "Marris", "Mason", "Mauntell", "Mayne", "Medeley", "Merstun", "Michelgrove", "Millet", "Milsent", "Molyngton", "Montagu", "Morecott", "Mortimer", "Mowfurth", "Muston", "Neale", "Norden", "Northwood", "Norwood", "Nysell", "Oken", "Osborne", "Outlawe", "Pagg", "Papley", "Parris", "Payne", "Peckham", "Peltie", "Pennebrygg", "Perrot", "Petley", "Peyton", "Pinnock", "Plessey", "Pole", "Porter", "Powlett", "Pray", "Prowd", "Quintin", "Ramsey", "Rawlin", "Redman", "Reynes", "Rickworth", "Risley", "Robertson", "Rochforth", "Rondel", "Rous", "Rowlett", "Rufford", "Rusch", "Sacheverell", "Saintaubin", "Salman", "Sampson", "Sandys", "Savill", "Scarcliff", "Scott", "Sedley", "Sever", "Sharman", "Sheraton", "Shern", "Shingleton", "Shoesmith", "Sibbell", "Simmons", "Skipwith", "Smith", "Snelling", "Spebbington", "Spencer", "Sprottle", "Stanbury", "Stanwix", "Staverton", "Steward", "Stoddeley", "Stokes", "Stoner", "Strader", "Strelley", "Sulyard", "Sweetecok", "Tabard", "Tedcastle", "Thorne", "Throckmorton", "Tilghman", "Topsfield", "Town", "Trevett", "Turner", "Tyrell", "Unton", "Vaughan", "Verney", "Wade", "Waldegrave", "Walford", "Walrond", "Walton", "Warde", "Warren", "Weeks", "Wellins", "West", "Weston", "White", "Whowood", "Wightman", "Willcotts", "Willmer", "Windham", "Winston", "Wiseman", "Wolstonton", "Woodbrygg", "Wotton", "Wright", "Wyghtham", "Wyville", "Yelverton"]

let fNameHalflingMale = ["Adalgrim", "Adelard", "Alaric", "Alder", "Aldric", "Aldwin", "Alton", "Andwise", "Anson", "Balbo", "Bandobras", "Barliman", "Beau", "Bellflower", "Bellis", "Berrybrook", "Bertram", "Bilberry", "Bill", "Bingo", "Bodo", "Boffin", "Bolger", "Bramble", "Bramwell", "Brandybuck", "Brownlock", "Brumblewick", "Bumble", "Bungo", "Bungobaggins", "Cade", "Calkin", "Clover", "Corbin", "Cotman", "Cottar", "Cottonhill", "Cottontail", "Dandelion", "Dewberry", "Diggory", "Dingle", "Dockleaf", "Doderic", "Drogo", "Dudo", "Eldon", "Elmo", "Falco", "Fastolph", "Feldon", "Filibert", "Finchley", "Finnegan", "Finnigan", "Flambard", "Fosco", "Frogleap", "Frotto", "Garret", "Genrill", "Gilly", "Gillywick", "Gorse", "Griffo", "Halfred", "Hildigrim", "Hob", "Hobbard", "Hobert", "Hobson", "Holman", "Huckleberry", "Kepli", "Largo", "Linden", "Longo", "Lotho", "Lyle", "Marlowe", "Milo", "Minto", "Morro", "Mosco", "Mungo", "Myrtle", "Nervin", "Nettle", "Nettlebed", "Noodle", "Nubbins", "Odo", "Odovacar", "Olo", "Orin", "Orville", "Osborn", "Otho", "Otis", "Paladin", "Paldo", "Peregrin", "Periwinkle", "Pervin", "Pervince", "Petalfoot", "Pimpernell", "Pipkin", "Pippard", "Pippin", "Pippington", "Pipwick", "Polo", "Ponto", "Porto", "Posco", "Quince", "Rollo", "Rollover", "Ronald", "Rooster", "Rorimac", "Roscoe", "Rowanburrow", "Rowanleaf", "Rowley", "Rufus", "Sable", "Sam", "Sancho", "Sandyfoot", "Sandyman", "Saradac", "Seredoc", "Sprocket", "Tansy", "Tansybrook", "Tansywort", "Tarragon", "Teasel", "Thaddeus", "Theadric", "Thimble", "Thistle", "Thistleburrow", "Thorton", "Toadstool", "Todric", "Tolman", "Tomlin", "Tomwise", "Trillium", "Trotter", "Tumbleweed", "Waverly", "Wellby", "Wilbert", "Wilcome", "Wilmot", "Wimble", "Wren", "Yarrow"]

let fNameHalflingFemale = ["Belladonna", "Belladora", "Berry", "Bluebell", "Bluebellia", "Blueberry", "Brambleberry", "Bramblefern", "Bristlebush", "Bumblebloom", "Butterburr", "Buttercup", "Butterstream", "Cinnamon", "Cinnamonshine", "Clover", "Cloverdell", "Daffodalia", "Daffodil", "Daisybreeze", "Dandelion", "Dandyrose", "Dottie", "Fancypetal", "Fern", "Fiddlefern", "Gilly", "Gillyfern", "Glimmer", "Glimmerbrook", "Gossamer", "Gossamerleaf", "Hazelnut", "Honeydew", "Honeydove", "Honeymist", "Honeysuckle", "Lavender", "Lavendula", "Lilac", "Lilacspring", "Maribelle", "Marigold", "Marigolden", "Marilla", "Meadowlark", "Meadowswift", "Pansy", "Pansylark", "Peony", "Perigold", "Periwinkle", "Petalmoon", "Petunia", "Pippa", "Pippalina", "Posy", "Posydale", "Primrose", "Primrosemae", "Rosabelle", "Rowan", "Rowancress", "Sableleaf", "Saffron", "Saffronia", "Snowdrop", "Snowdropfield", "Sorrel", "Sorrelsong", "Springwillow", "Starling", "Starlingwillow", "Tanglebush", "Tanglewood", "Tanglewoodrose", "Tansy", "Tansybrook", "Tansyglow", "Tansywhisper", "Thimblewick", "Tilly", "Tindra", "Tulip", "Tulipshade", "Tuppence", "Tuppertop", "Willophine", "Willow", "Wren", "Wrenswell"]

let nickname1Halfling = ["Amber-", "Brown-", "Cold-", "Crazy-", "Curly-", "Earth-", "Far-", "Fast-", "Fat-", "Fire-", "Flow-", "Forest-", "Free-", "Glitter-", "Good-", "Great-", "Green-", "Hairy-", "Healthy-", "Home-", "Honor-", "Hot-", "Laughing-", "Lightning-", "Little-", "Many-", "Moon-", "Nimble-", "Plump-", "Pretty-", "Quick-", "Rain-", "Road-", "Running-", "Scatter-", "Shadow-", "Silver-", "Simple-", "Sky-", "Slow-", "Sly-", "Smooth-", "Spring-", "Sprout-", "Stout-", "Sun-", "Swift-", "Tall-", "Travelling-", "Under-", "Warm-", "Water-", "Wet-", "Wild-"]

let nickname2Halfling = ["Ale", "Brother", "Eye", "Ghost", "Heart", "Maker", "Shadow", "Stoat", "Wanderer", "Arrow", "Burrow", "Fellow", "Goat", "Hearth", "Man", "Shaker", "Swan", "Weed", "Body", "Caller", "Fingers", "Gold", "Hill", "Map", "Sister", "Will", "Bottom", "Digger", "Foot", "Hand", "Leaf", "One", "Sleep", "Taunt", "Wit", "Bones", "Cloak", "Flower", "Grass", "Lady", "Mind", "Skin", "Talker", "Wind", "Bread", "Drum", "Fox", "Head", "Letters", "Pipe", "Stick", "Tender", "Wolf"]

let lNameHalfling = ["Amster", "Applemeadow", "Applestem", "Applewood", "Ashworthy", "Bandawax", "Berrybrook", "Berryhill", "Bluebell", "Bluebellbush", "Boffin", "Bolger", "Bracegirdle", "Bramblebrook", "Brambleburrow", "Bramblecreek", "Bramblesnap", "Bramblesong", "Bramblethatch", "Bramblethorn", "Bramblewhisk", "Bramblewood", "Brownburr", "Brownlock", "Brushgather", "Bullroarer", "Bumblebrook", "Bumbleburrow", "Bunce", "Burrowbrook", "Burrows", "Butterhollow", "Butterleaf", "Chubb", "Ciderbrook", "Cloverfield", "Cloverhill", "Copperbottom", "Coppercreek", "Coppersmith", "Copperspring", "Cotton", "Cottontail", "Cottontop", "Daffodil", "Daffodilmeadow", "Dale", "Dandelion", "Dandelionhill", "Dandyshine", "Dappledell", "Dewdrop", "Dinglethorn", "Dottybranch", "Dudley", "Fancyspring", "Fernhollow", "Fiddlefern", "Gammidge", "Gamwich", "Gardner", "Glimmeringrove", "Glimmertop", "Goldenshadow", "Goodbarrel", "Goodbody", "Gossamer", "Gossamerbranch", "Gossamermeadow", "Greenbottle", "Greenmeadow", "Greenspan", "Grub", "Hamson", "Hazelbrook", "Hazelnook", "Heathertoe", "Highhill", "Hilltopple", "Honeydew", "Honeymeadow", "Honeypatch", "Honeytree", "Honeywell", "Hornblower", "Jallisall", "Kaese", "Kalliwart", "Lavenderleaf", "Leagallow", "Lilybrook", "Lindenbrook", "Marmidas", "Meadowfield", "Meadowglade", "Melilot", "Merrywater", "Millbridge", "Milliciny", "Montajay", "Newtan", "Nutbrown", "Nutleaf", "Nuttington", "Nuttleshire", "Oakenshade", "Oldfur", "Orgulas", "Ostgood", "Overhill", "Posypatch", "Pottershire", "Potterspring", "Quettory", "Rosebush", "Roseglen", "Rosehill", "Rosepetal", "Shortwick", "Sire", "Starlingwood", "Talbot", "Tanglebrook", "Tanglethicket", "Tanglethorn", "Tanglewood", "Tansydale", "Tansyfield", "Tansyglade", "Tansypond", "Tealeaf", "Thistledown", "Thornbush", "Thorngage", "Thumbleaf", "Tighfield", "Tosscobble", "Trill", "Tumblebrook", "Tumblebush", "Tumbleleaf", "Tumbleweed", "Tuppertop", "Tuppertown", "Tuppertree", "Underbough", "Weatherbee", "Willowbriar", "Willowbrook", "Willowdown", "Willowglen", "Willowhollow", "Willowshade", "Willowwhisper"]

let fNameGnomeFemale = ["Cummun", "Thuglo", "Tolvu", "Napnim", "Pabblaveth", "Goblovim", "Himobbliem", "Smuhinglir", "Slahippyss", "Sminsmun", "Slaanbass", "Thidwys", "Gallba", "Smadbam", "Shangnawal", "Feknuso", "Gybyddlam", "Shanarwath", "Amarwem", "Slilbaa", "Manklo", "Madne", "Thikmo", "Smonsmip", "Edbifell", "Shupwimil", "Clenyvem", "Wedegno", "Gailillnir", "Smymmi", "Mankes", "Thelvet", "Huru", "Thenglar", "Thedliwu", "Adlamir", "Flefelval", "Blihiknass", "Caidolbee", "Slimdoom", "Phobblaas", "Taansmall", "Shilvass", "Theppon", "Mipwoveth", "Hemdavom", "Clemelket", "Blalillma", "Slaneppa", "Meegni", "Smavol", "Haidnen", "Sninbo", "Smovyth", "Legnular", "Cilkaloll", "Flelimwo", "Smalagnit", "Gasiemdet", "Gleddop", "Purbas", "Blirar", "Glaidwoll", "Ninglis", "Blelkosass", "Thegbeelip", "Flamibblien", "Phisunklip", "Gniligle", "Snodbi", "Lienkiss", "Gnillboo", "Fnubbnam", "Wyngnell", "Fnaddwabaal", "Ednysan", "Caahirweep", "Fimirwai", "Nivorwiell", "Tegnit", "Tensnis", "Cable", "Smeekwal", "Blolbum", "Hynkanas", "Gilbewuth", "Cleballnin", "Ewillbiss", "Unomdath", "Clymdal", "Slillball", "Flelmam", "Fabni", "Flemwap", "Genkledith", "Lolmuhel", "Wedalwi", "Shalellnet", "Thaahidleth"]

let fNameGnomeMale = ["Slugnot", "Geemjig", "Ceddwag", "Frydnyp", "Joonsmurt", "Frurert", "Lolbovit", "Gnekwucyrt", "Slevinbiss", "Klasankkeg", "Kleebepnoc", "Bebbrog", "Klairbem", "Nengnor", "Gaknag", "Gnarwass", "Danzadoock", "Sniddwevat", "Klovankec", "Tadensmam", "Cydinkist", "Toomtug", "Claansbass", "Munkip", "Borwiss", "Gynsnam", "Roorbacec", "Lanjukem", "Zenappiert", "Hofynkaim", "Slemeddnot", "Kniddur", "Ponkurt", "Tunjirt", "Frunsmiss", "Tammog", "Gaarbicyg", "Woknanac", "Slisenkkim", "Halabbrit", "Riwunsbam", "Meruck", "Jambick", "Franjit", "Snarbap", "Zumdiet", "Dovakug", "Hinzarar", "Smuhiknec", "Gnawamtost", "Hofaimdap", "Geddnairt", "Smyprem", "Wignack", "Cadnuss", "Frenkap", "Frensnomag", "Scoonkkugack", "Zibubkat", "Puhiemmass", "Scesuddass", "Snansmass", "Hoobbryck", "Waddwig", "Snalbat", "Linjock", "Gnenzbeebaart", "Zyppinist", "Smubebkyss", "Slobenkkort", "Rymignist", "Smyddwass", "Dibkist", "Klanbum", "Dobness", "Gnygbost", "Rimzobort", "Scognanert", "Clavebkirt", "Rubuddic", "Rehymbit", "Smugbort", "Smerbop", "Paddwyrt", "Cakpick", "Ginzbem", "Slebnacec", "Tienzecur", "Smamimpac", "Snodarkyg", "Hoovimwass", "Davag", "Wonsbec", "Slimwick", "Clyrost", "Ningnut", "Dibbregack", "Widdwekag", "Newodnuck", "Gneluddut", "Scefansbat"]

let lNameGnome = ["Alunzbieg", "Apleldosp", "Aselvil", "Bernfitlacks", "Binjaim", "Blaesocket", "Bledla", "Boddlie", "Byddowe", "Caapwelim", "Cebnoo", "Cibka", "Cilwost", "Clabuknag", "Clanbirt", "Clebnym", "Clegnir", "Clemzol", "Cloollbyr", "Comeklul", "Cookpen", "Daamepruc", "Deemdost", "Dimbu", "Dinglart", "Dustseeker", "Enjiekon", "Ensboka", "Enzbufel", "Fanjas", "Flebidlul", "Flikli", "Fliwepnoo", "Flynjyss", "Gedappes", "Gemhair", "Gepposs", "Giobibaar", "Glafibna", "Gleenaddleck", "Gliefarkack", "Glomtat", "Gnakyg", "Gnanabkien", "Gnillbooss", "Hibblall", "Hirwim", "Ipswoms", "Jeenziewill", "Jobliefip", "Klasigbart", "Klenekmaip", "Kliensmack", "Knarkep", "Knodwai", "Knuwoppass", "Knylippic", "Laklir", "Lelbest", "Mirlon", "Misabbnim", "Moddwakoo", "Muddwehip", "Musydwaass", "Muwlebra", "Nakno", "Niddeka", "Nooknort", "Nuttlattle", "Palwer", "Pedengnol", "Peedlupnon", "Pelletsniffer", "Phaladdwiss", "Phidluvam", "Phupper", "Phylmamiss", "Ribbrim", "Sabblewloth", "Scelensmom", "Sciknort", "Scirass", "Scollmall", "Scovabblest", "Sheembill", "Shihinkko", "Shoolbekaac", "Sleborwac", "Smarwakyck", "Smekoc", "Smimdyl", "Smugnaimas", "Snanzbist", "Snaraidyp", "Snellmefaa", "Snepric", "Tampy", "Tesinsmal", "Thilnoofi", "Tinkerfoot", "Towuddis", "Waadbirt", "Winipran", "Woh", "Zoknes"]

let fNameOrc = ["Abgugh", "Ablakh", "Abrog", "Adguk", "Adzug", "Aggu", "Agkug", "Agnath", "Agugh", "Akgor", "Albog", "Amhosh", "Arbok", "Argug", "Arug", "Ashzog", "Azgug", "Babguk", "Baggug", "Bakduh", "Bashog", "Bizbub", "Blabnag", "Blaglut", "Blang", "Blazgurg", "Blodak", "Blogmag", "Blonak", "Blozgurg", "Blubkrut", "Bludmuk", "Blugdush", "Blugrog", "Blulbug", "Blunk", "Blurgok", "Blutruk", "Bluzhkrut", "Bogzog", "Borag", "Bozpog", "Bragha", "Brakdub", "Brarug", "Brigzag", "Brobmak", "Brogbuh", "Brolg", "Brorzug", "Brubgugh", "Brubug", "Brug", "Brughnab", "Brugzakh", "Brulg", "Brurgab", "Brushdrog", "Bruzgug", "Bubgorg", "Bubpug", "Budhagh", "Bugdush", "Bugrog", "Bukgor", "Bulgha", "Bundagh", "Burlug", "Bushnug", "Buzguul", "Dadgulg", "Dakag", "Dazpug", "Doblakh", "Dorlug", "Drabruh", "Dragguh", "Drargash", "Driblug", "Drobdakh", "Drogdug", "Drokhdag", "Drorkub", "Drubguh", "Drudash", "Drugh", "Druk", "Drulg", "Drurag", "Drurgug", "Drutrug", "Druzhkrut", "Dubkrut", "Dubzagh", "Duga", "Dugha", "Dugrug", "Dulbag", "Dunuk", "Durguk", "Dushnug", "Duzgug", "Gadzush", "Gagrug", "Gardag", "Gazg", "Ghagdash", "Ghagzug", "Ghargash", "Ghirbog", "Ghoblug", "Ghoghru", "Ghongub", "Ghozgash", "Ghubgub", "Ghubnarg", "Ghudmuk", "Ghuggug", "Ghugug", "Ghuktug", "Ghundug", "Ghurmug", "Ghutsnuk", "Ghuzrub", "Glabkub", "Glagzag", "Glark", "Glidash", "Globdub", "Glodkuh", "Glogrug", "Glorgok", "Glubbuh", "Glubrag", "Gludgug", "Glugdakh", "Glugmug", "Glukgag", "Glulgob", "Glurg", "Glurzug", "Gluzburz", "Gluznag", "Gogkug", "Golurg", "Goshog", "Grabdush", "Gragmog", "Grarbag", "Grazgub", "Grizdub", "Grogblug", "Grok", "Grorbug", "Grotrug", "Grubguh", "Grudak", "Grugdugh", "Grugmuh", "Grukgag", "Grumdush", "Grurbash", "Grurk", "Grushnak", "Gruzguh", "Gubguk", "Gudak", "Gugbug", "Gugluk", "Gugzag", "Guldush", "Gurdak", "Gurzug", "Guzgub", "Habkub", "Hagnum", "Harg", "Higbub", "Hoggu", "Horboz", "Hubbuh", "Hubkog", "Hubzub", "Hudkush", "Hughug", "Hugzug", "Huknuk", "Humkush", "Hurgok", "Hutrug", "Huznag", "Ibguk", "Idgub", "Igduk", "Igugh", "Imdush", "Irgulg", "Kabguh", "Kagduk", "Kakduh", "Kark", "Kirdag", "Kobzugh", "Kogkug", "Kolgug", "Kotrub", "Krabnag", "Kragbub", "Kragzub", "Krarboz", "Kraugh", "Krigha", "Krobdakh", "Krodrub", "Krogulg", "Krongub", "Krorzog", "Krubbag", "Krubkub", "Krubzurg", "Krug", "Krugha", "Krugrug", "Krukthak", "Krundug", "Krurzog", "Kruzg", "Kubdush", "Kublug", "Kudbug", "Kuggug", "Kugulg", "Kulbulg", "Kungash", "Kurthug", "Kuugh", "Kuzpog", "Magkugh", "Marguk", "Migmuh", "Mogduk", "Mokpug", "Motrug", "Mubgagh", "Mubrog", "Mudkub", "Mugduk", "Mugluk", "Mugrurg", "Mukdub", "Mulug", "Murdag", "Mushlak", "Muzgash", "Nabguk", "Nadush", "Nagulg", "Narg", "Nignath", "Nogh", "Noldush", "Notrub", "Nubdakh", "Nubzug", "Nugbub", "Nughbub", "Nugrug", "Nukag", "Nulbulg", "Nurbash", "Nurghud", "Nushnak", "Nuzgurg", "Obgorg", "Oblag", "Obrog", "Odbug", "Odzud", "Ogdugh", "Oghru", "Ognath", "Ogugh", "Okgag", "Olbag", "Omburz", "Orag", "Orgug", "Oruk", "Otrug", "Ozdub", "Ozpug", "Ragmog", "Rark", "Ridbagh", "Rodbagh", "Rogrug", "Rozgurg", "Rubgub", "Rubulg", "Rudmuk", "Rughbub", "Rugrog", "Rukthak", "Rumdush", "Rurdag", "Rushnok", "Ruzg", "Sabhosh", "Sakguh", "Skabdak", "Skag", "Skakag", "Skashnakh", "Skigzog", "Skobpug", "Skogrog", "Skorbog", "Skozguh", "Skubgugh", "Skubzug", "Skugak", "Skughbub", "Skugrurg", "Skulug", "Skurgag", "Skushnok", "Smabnarg", "Smagzug", "Smaruk", "Smidgug", "Smirzug", "Smogmuh", "Smomdush", "Smough", "Smubgub", "Smubzub", "Smugblug", "Smugkug", "Smugzog", "Smuknuk", "Smungash", "Smurgug", "Smuugh", "Snabgub", "Snadkub", "Snagthak", "Snarpug", "Snidhagh", "Snishnug", "Snodhagh", "Snogzub", "Snoshnakh", "Snubgug", "Snubzug", "Snugduh", "Snugmog", "Snugzush", "Snulbog", "Snungub", "Snurlug", "Snuzburz", "Sobhush", "Sogha", "Sokpug", "Sotrush", "Subguk", "Subzug", "Sugbuh", "Suglum", "Sugrak", "Sugzakh", "Surbosh", "Surthag", "Suzdakh", "Tabkrut", "Tadgulg", "Takgor", "Tatsnuk", "Thadkub", "Tharg", "Thaznag", "Thodkub", "Thoghrag", "Thokhdub", "Thorg", "Thrabgub", "Thragh", "Thramzug", "Thrazbuzg", "Thrizdub", "Throdzog", "Throgug", "Throrbash", "Thrubbuh", "Thrublag", "Thrudbug", "Thruga", "Thrughnab", "Thrugrunk", "Thruknuk", "Thrundagh", "Thrurgug", "Thruzburz", "Thubdub", "Thubnag", "Thudgig", "Thugbuh", "Thuglut", "Thugulg", "Thulgob", "Thurgug", "Thushzog", "Thuznag", "Tobgagh", "Togdush", "Tokguh", "Toshnakh", "Trabmak", "Tragzakh", "Trargash", "Trazbub", "Trobgagh", "Trodzog", "Trograk", "Trotrug", "Trubkrut", "Trubzug", "Trug", "Trughug", "Trugugh", "Truknuk", "Trung", "Trurgulg", "Trutsnuk", "Truzkub", "Tubug", "Tudzug", "Tugh", "Tugmuh", "Tukthak", "Tundagh", "Turlag", "Tuugh", "Ubdig", "Ubguh", "Ublakh", "Ubrog", "Udak", "Udhagh", "Udzush", "Ugdug", "Ughnab", "Ugmag", "Ugrub", "Ugzog", "Ukgor", "Ulbag", "Ulrarz", "Undagh", "Urbok", "Urgash", "Urluk", "Ushnak", "Utrush", "Uzdub", "Uzhug", "Zabgugh", "Zagguh", "Zakag", "Zashog", "Zidrub", "Zobhush", "Zodash", "Zoghug", "Zondagh", "Zorug", "Zubgorg", "Zublakh", "Zugdakh", "Zugluk", "Zundagh", "Zushdrog", "Zuzbuzg", "Abdak", "Blorbosh", "Brushlak", "Drukag", "Ghubrog", "Gomhosh", "Guzgug", "Kodash", "Kugzakh", "Nolg", "Ozdush", "Skubguh", "Snidzog", "Taknuk", "Thudgug", "Truugh", "Ushnakh"]
let lNameOrc = ["of the Black Bone Tribe", "of the Black Claw Tribe", "of the Black Slasher Tribe", "of the Blood Moon Tribe", "of the Blood Skull Tribe", "of the Bloody Scar Tribe", "of the Broken Bone Tribe", "of the Darkstar Tribe", "of the Ear Seekers Tribe", "of the Flaming Spike Tribe", "of the Garuk One Ears Tribe", "of the Green Moss tribe Tribe", "of the Greenhaven Tribe", "of the Heart Takers Tribe", "of the Horned Lord Tribe", "of the Iceshield Tribe", "of the Karuck Tribe", "of the Many-Arrows Tribe", "of the Nethertide Horde Tribe", "of the Onusclan Tribe", "of the Proudfist Tribe", "of the Red Fangs Tribe", "of the Ripped Gut Tribe", "of the Seven Eye Tribe", "of the Severed Fist Tribe", "of the Skortchclaw Tribe", "of the Spleen Eaters Tribe", "of the Thousand Fists Tribe", "of the Tornskulls Tribe"]

let fNameDragonbornMale = ["Adrex", "Alidorim", "Alixan", "Arjhan", "Arkul", "Azzakh", "Balasar", "Balvull", "Balxan", "Baradad", "Belcrath", "Beljhan", "Belkax", "Belziros", "Bharash", "Bidreked", "Brensashi", "Caerfras", "Caerlin", "Calugar", "Dadalan", "Dazzazn", "Direcris", "Docrath", "Dolin", "Donaar", "Drakax", "Drazavur", "Durbarum", "Durwarum", "Eragrax", "Faerjurn", "Faerqiroth", "Faersashi", "Faerxan", "Fax", "Frokris", "Gargax", "Gherash", "Ghesh", "Gorahadur", "Goralin", "Goraxan", "Gorbundus", "Greethen", "Greyax", "Heskan", "Hetrin", "Hirrathak", "Hiskan", "Hixan ", "Ildrex", "Iorfarn", "Jaryax", "Jinrash", "Jinwunax", "Kaladan", "Kerkad", "Kiirith", "Kilskan", "Kilyax", "Kilziros", "Kriv", "Krivjhan", "Krivroth", "Lorqiroth", "Lumisashi", "Lumiskan", "Maagog", "Marsashi", "Medmorn", "Medrash", "Mehen", "Morvarax", "Mozikth", "Mreksh", "Mugrunden", "Nadarr", "Nakax", "Nakul", "Naqrin", "Narghull", "Nargrax", "Narjhan", "Neslasar", "Nithther", "Norkruuth", "Nykkan", "Orlaskan", "Otivull", "Otiythas", "Pandjed", "Paqull", "Paskan", "Patrin", "Pazire", "Pijjirik", "Qelnaar", "Qelqull", "Quarethon", "Rasmorn", "Rasqiroth", "Rathrkan", "Ravobroth", "Ravofarn", "Ravoroth", "Rhogar", "Rivaan", "Sethrekar", "Shaciar", "Shamash", "Shedinn", "Srorthen", "Suljhan", "Sulprax", "Tarhun", "Tazlin", "Tazwunax", "Torinn", "Troudorim", "Trouqiroth", "Trynnicus", "Uroxan", "Valorean", "Vorjurn", "Vrondiss", "Worciar", "Worqiroth", "Worzavur ", "Wrakris", "Wralin", "Wraseth", "Wulcrath", "Wulvarax", "Wulwunax", "Wuvarax", "Xargrax", "Xarvarax", "Xarxan", "Yorkax", "Yorkris", "Yorzavur", "Zedaar", "Zorfras", "Zrafarn", "Zragar", "Zraqiroth", "Zrarinn", "Zraziros"]

let fNameDragonbornFemale = ["Aasathra", "Akra", "Antrara", "Aqwen", "Arava", "Arihime", "Arizys", "Belbirith", "Belnorae", "Belvyre", "Biri", "Blendaeth", "Burana", "Cabirith", "Caliann", "Chassath", "Crismyse", "Cristhyra", "Criswophyl", "Daar", "Darina", "Dentratha", "Doudra", "Driindar", "Drysshann", "Drysthibra", "Eggren", "Erlipatys", "Erlirinn", "Erlisira", "Erlivyre", "Eshriel", "Eshshann", "Eshsira", "Faelarys", "Faepatys ", "Farideh", "Fennys", "Findex", "Furrele", "Gesrethe", "Gilkass", "Grigil", "Grisira", "Gurgwen", "Halyassa", "Harann", "Havilar", "Hethress", "Hillanot", "Iriezys", "Irlyrish", "Irlyvys", "Jaxi", "Jezean", "Jheri", "Jocoria", "Jovyre", "Kadana", "Kahymm", "Kanorae", "Kava", "Keldrish", "Kelshann", "Kohime", "Komeila", "Korinn", "Koxora", "Lilofyire", "Lilorann", "Liloxiris", "Liloyassa", "Loralarys", "Lorariel", "Lorarinn", "Malzys", "Megren", "Mibirith", "Mijira", "Mishann", "Nagil", "Nala", "Naliann", "Nesbis", "Nesgwen", "Neszys", "Nuthra", "Nysmeila", "Nysyassa", "Obis", "Orinorae", "Orishann", "Perra", "Perthibra", "Pogranix", "Pyxrin", "Qicys", "Qifyire", "Qimeila", "Quespa", "Quilshann", "Quilthibra", "Raiann", "Rashifyire", "Rezena", "Ruloth", "Saphara", "Savaran", "Sobith", "Sogwen", "Sora", "Sosira", "Sufyire", "Suliann", "Surina", "Suwophyl", "Synthrin", "Tatyan", "Thagwen", "Thava", "Therbis", "Therdalynn", "Theryassa", "Uadjit", "Uriqorel", "Ushibith", "Valmeila", "Valpatys", "Valqorel", "Vezera", "Vyrabith", "Vyrafyire", "Wrarina", "Wrathibra", "Wrawophyl", "Xiszys", "Xyriel", "Xywophyl", "Yavyre", "Yrliann", "Yrqwen", "Zenbis", "Zenpora", "Zofgwen", "Zofshann", "Zofsira", "Zofthibra", "Zykroff"]

let nicknameDragonborn = ["Adamant", "Ambitious", "Artsy", "Babbler", "Bedcutter", "Bender", "Biggie", "Bitey", "Blade", "Bowrazer", "Brow", "Bull", "Bullseye", "Buster", "Chairgnawer", "Chairsnapper", "Chappie", "Cheery", "Chef", "Climber", "Clinker", "Coocoo", "Courteous", "Coyote", "Crawler", "Cruncher", "Crusher", "Cryo", "Dangerous", "Defender", "Devil", "Diver", "Dodger", "Doorbiter", "Drifter", "Dusty ", "Earbender", "Energizer", "Fainter", "Favorable", "Favoured", "Feigner", "Fish", "Flame", "Folder", "Fortunate", "Fuzzy", "Grappler", "Grim", "Helper", "Humorous", "Hurricane", "Ice Veins", "Indie", "Jackal ", "Joyous", "Jumper", "Launcher", "Leaper", "Lightning", "Lucky", "Merry", "Mule", "Mysterious", "Nibbler", "Pios", "Puffer", "Roarer", "Roomcarver", "Roomrazer", "Sailor", "Scaler", "Seeker", "Shelfbiter", "Shieldbiter", "Shieldwrecker", "Shifter", "Shorty", "Sloucher", "Smiley ", "Smoothie", "Snapper", "Spud", "Stamper", "Tablebender", "Tablecarver", "Trembler", "Tricky", "Trustworthy", "Vigilant", "Wild", "Zealous"]

let lNameDragonborn = ["Akambherylliax", "Althadin", "Amreashtur", "Amruajad", "Argenthrixus", "Axic", "Axor", "Baharoosh", "Beryntolthropal", "Bhenkumbyrznaax", "Caavylteradyn", "Carek", "Cechikel", "Cemtun", "Certhejaal", "Chumbyxirinnish", "Claammedamuur", "Clecanendek", "Clerrhon", "Clethinthiallor", "Clethtinthiallor", "Cloldrajur", "Craldesuudul", "Cralthud", "Crancar", "Creastatorrun", "Crincacmir", "Daardendrian", "Delmirev", "Delmokmidoc", "Dhyrktelonis", "Dialruc", "Diltheth", "Dimpeadulus", "Dompin", "Drachedandion", "Drarnok", "Dustec", "Ebynichtomonis", "Embiacnirgir", "Enkenthuad", "Enxendrek", "Ernanthijar", "Erostumak", "Esstyrlynn", "Faaldintharrun", "Fenkenkabradon", "Fharngnarthnost", "Fildoker", "Foldraankonid", "Folmac", "Gaarthar", "Gamticosh", "Gearthashkmec", "Ghaallixirn", "Gilxekilluc", "Grrrmmballhyst", "Gygazzylyshrift", "Hashphronyxadyn", "Hshhsstoroth", "Iccuuc", "Ildad", "Imbixtellrhyst", "Irnealas", "Jerynomonis", "Jharthraxyn", "Kambun", "Karrhish", "Kepeshkmolik", "Kerrhylon", "Kimbatuul", "Kiphir", "Klampad", "Klasteash", "Klealkiar", "Klichuuth", "Klinxankiar", "Kliphith", "Kloldrindead", "Kluapor", "Krephuarid", "Krialras", "Kricetol", "Kruamrith", "Lhamboldennish", "Liltutes ", "Linxakasendalor", "Lualrur", "Maccal", "Malxaan", "Mempal", "Merdijad", "Mohradyllion", "Myastan", "Myemrik", "Myimrin", "Mystan", "Narjun", "Narnajir", "Nemmiashkmek", "Nemmonis", "Norixius", "Numbucmid", "Nyombukmul", "Nyuuldus", "Oldak", "Onxidelith", "Ophinshtalajiir", "Orexijandilin", "Pfaphnyrennish", "Phrahdrandon", "Prexijandilin", "Pruncenshtor", "Pyraxtallinost", "Qyxpahrgh", "Raghthroknaar", "Shaammasijic", "Sheccac", "Shestendeliath", "Shimpiduk", "Shornash", "Shuanxur", "Skaarzborrosh", "Sumnarghthrysh", "Taarrhileallac", "Tacaad", "Tarrhunthergesh", "Temmudak", "Thaamtekelud", "Thacodimin", "Tharrhushkmenir", "Tialtetar", "Tiammanthyllish", "Tirdunkundak", "Tuaphek", "Turnuroth", "Uardin", "Uaxal", "Ucer", "Umbyrphrael", "Unxas", "Urrhaan", "Uuxirirgek", "Vangdondalor", "Verthisathurgiesh", "Voccith", "Wivvyrholdalphiax", "Wystongjiir", "Yalduash", "Yarjerit", "Yelxidak", "Yichojek", "Yorthus", "Yumputhorguun", "Zzzxaaxthroth"]

let fNameTieflingMale = ["Abad", "Aetcius", "Aetrut", "Aetthus", "Aetxes", "Ahrim", "Akmen", "Akmenos", "Akrai", "Akvir", "Akzire", "Amnon", "Amxikas", "Andmenos", "Andram", "Andros", "Andxikas", "Aranrai", "Aranrus", "Aranthos", "Aranxes", "Aranzer", "Archar", "Arkmir", "Arkxik", "Armarir", "Armeros", "Arxes", "Astar", "Balam", "Barakas", "Barxus", "Bathin", "Bright", "Caim", "Carmir", "Carvius", "Casmir", "Casrakir", "Casvir", "Casxes", "Caszer", "Cheer", "Chem", "Cimer", "Comfort", "Courage", "Cressel", "Damadius", "Damakos", "Delight", "Dhardos", "Dharemon", "Dharrut", "Ebshoon", "Ekemon", "Ekmus", "Ekris", "Erakos", "Esteem", "Euron", "Faith", "Fenriz", "Forcas", "Garrai", "Garros", "Garshoon", "Garus", "Glee", "Guemenos", "Guenon", "Guezer", "Gumos", "Guxes", "Habor", "Iados", "Iail", "Kaemon", "Kaireus", "Kairon", "Kaixire", "Kaixus", "Karnon", "Karxikas", "Kaxire", "Kilrai", "Kilxus", "Koscis", "Kosilius", "Kosrias", "Koszer", "Kyakos", "Kyichar", "Kylech", "Kymarir", "Kyrias", "Leucis", "Life", "Lokeira", "Lokerias", "Lokeros", "Lokethor", "Malcius", "Malecius", "Maleichar", "Malelech", "Malelius", "Malexus", "Malzire", "Mamnen", "Mantus", "Marbas", "Mavdos", "Mavil", "Melech", "Memarir", "Merakas", "Merihim", "Merut", "Methos", "Modean", "Mordai", "Mormo", "Morrakir", "Morrias", "Morrut", "Morthos", "Morxikas", "Nephadius", "Nephchar", "Nephzer", "Nicor", "Nirgel", "Oriax", "Ozil", "Ozira", "Ozmong", "Ozrakas", "Paymon", "Pelaios", "Purson", "Qemuel", "Raam", "Ralrus", "Ralthor", "Ralxus", "Rerakir", "Rimmon", "Roldos", "Rolrakas", "Rolrut", "Rolthos", "Rolthus", "Rolvir", "Salchar", "Sammal", "Sharakas", "Sharakir", "Shareus", "Sharis", "Siege", "Sirron", "Skaadius", "Skamos", "Skaxius", "Tethren", "Thamuz", "Therai"]
let fNameTieflingFemale = ["Afcyra", "Aflaia", "Afloth", "Afnarei", "Afspira", "Aftish", "Afvari", "Afwala", "Agate", "Agnelith", "Agnemeia", "Akta", "Amar", "Anakis", "Aniwure", "Aravari", "Ariagoria", "Ariaseis", "Arirali", "Armara", "Astaro", "Aym", "Azza", "Beleth", "Belhala", "Belloth", "Belphi", "Belpione", "Bryseis", "Bune", "Content", "Cregrea", "Crephi", "Criella", "Dadoris", "Damaia", "Danarei", "Dasolis", "Decarabia", "Dicria", "Digrea", "Dihala", "Dilia", "Diloth", "Dimpunith", "Dimvine", "Dispira", "Dordani", "Dorkaria", "Ea", "Eacria", "Eaphi", "Essential", "Frimeia", "Fripunith", "Gadreel", "Gomory", "Grifirith", "Hecat", "Hisseis", "Hissolis", "Huntress", "Ideation", "Inhala", "Inilista", "Iniseis", "Initari", "Inizes", "Insolis", "Ishte", "Jezebeth", "Joy", "Kali", "Kallista", "Kalloth", "Kalmine", "Kalxori", "Kasdeya", "Lerissa", "Levki", "Levmeia", "Levphi", "Levtari", "Lilith", "Lilnarei", "Makaria", "Malaia", "Manea", "Manise", "Manta", "Markosian", "Marlypsis", "Marqine", "Marvari", "Marza", "Marzes", "Mastema", "Mavari", "Maxori", "Misspira", "Mithcria", "Mithpione", "Mithseis", "Mithwure", "Naamah", "Nafaris", "Nahala", "Natdani", "Natdoris", "Natlypsis", "Navine", "Nedoris", "Nefirith", "Nemeia", "Nenarei", "Nethfaris", "Nethhala", "Nethwala", "Nija", "Nithxori", "Orianna", "Oriuphis", "Osah", "Peslies", "Pesmine", "Peswala", "Pesxori", "Pesza", "Peszes", "Pheki", "Phelaia", "Phelith", "Phenirith", "Phexibis", "Pheyis", "Promise", "Prosperine", "Purah", "Pyra", "Qufaris", "Quqine", "Quuphis", "Rare", "Rieta", "Rifirith", "Rihala", "Riki", "Ripione", "Ronirith", "Ronobe", "Ronwe", "Roza", "Sadoris", "Salista", "Salypsis", "Sanctity", "Sarmine", "Sarza", "Seddis", "Seere", "Seiridoris", "Seirinise", "Seiritish", "Sekhmet", "Semyaza", "Shapione", "Shava", "Shax", "Sorath", "Termina", "Uzza", "Vapula", "Varnish", "Veldoris", "Velfaris", "Velhala", "Vepar", "Verin", "Yafaris", "Yahala", "Yalies", "Yatari", "Yavari", "Yoracyra", "Yoralia", "Yoratish", "Yumeia", "Yupione", "Yuvine", "Yuza", "Zaidoris", "Zaihala", "Zailista", "Zailoth", "Zanirith", "Zapunith", "Zazes", "Zefirith", "Zenise", "Zeyis"]
let nicknameTiefling = ["Abstinence", "Abundant", "Achievement", "Adventure", "Agony", "Ambition", "Amity", "Anger", "Apologetic", "Art", "Ashen", "Ashes", "Awe", "Bangle", "Belief", "Buried", "Called", "Carrion", "Chant", "Closed", "Confidence", "Creed", "Creedence", "Cunning", "Dance", "Death", "Debauchery", "Dependence", "Desire", "Despair", "Diffidence", "Diligence", "Discipline", "Doom", "Doubt", "Dread", "Dust", "Ecstasy", "Enduring", "Ennui", "Entropy", "Excellence", "Exceptional", "Exciting", "Experience", "Expert", "Expertise ", "Expressive", "Extreme", "Faithless", "Fear", "Fidelity", "Flawed", "Forsaken", "Freedom", "Fresh", "Gladness", "Gloom", "Glory", "Gluttony", "Grief", "Hate", "Helpless", "Hero", "Honest", "Honesty", "Hope", "Horror", "Humanity", "Humiliation", "Humility", "Hunt", "Ideal", "Ignominy", "Imagination", "Increase", "Increased", "Independence", "Innovation", "Journey", "Lament", "Lamentation", "Laughter", "Lechery", "Love", "Lust", "Magnify", "Mantra", "Master", "Mastery", "Mayhem", "Merit", "Misery", "Mockery", "Murder", "Muse", "Music", "Mystery", "Normal", "Nowhere", "Obedience", "Odd", "Odyssey", "Open", "Pain", "Panic", "Panic ", "Passion", "Persecution", "Piety", "Pilgrim", "Poetry", "Possession", "Praise", "Proverb", "Pure", "Purify", "Quest", "Random", "Reason", "Recovery", "Redeemed", "Relentless", "Remember", "Remembrance", "Resolute", "Respect", "Reverence", "Revolt", "Revulsion", "Sadness", "Silence", "Solace", "Sorrow", "Struggle", "Suffering", "Temerity", "Tenacious", "Terror", "Timeless", "Torment", "Tragedy", "Treasure", "Trialed", "Tribulation", "Trickery", "Trouble", "Truth", "Vanity", "Verity", "Vice", "Virtue", "Weary", "Wit", "Winning"]
let lNameTiefling = ["Adler", "Admon", "Ahren", "Aimery", "Aksu", "Alain", "Alard", "Alaric", "Alwyn", "Amarzian", "Ambershard", "Ambert", "Anlow", "Arkalis", "Armanci", "Baldric", "Ballard", "Barrelhelm", "Baykal", "Bedrich", "Benak", "Benvolio", "Bilger", "Biljon", "Blackstrand", "Brada", "Bram", "Brandis", "Brightwater", "Carnago", "Carnavon", "Caskajaro", "Celik", "Cerma", "Chalthoum", "Coldshore", "Copperhearth", "Coyle", "Cresthill", "Cuttlescar", "Daargen", "Dalicarlia", "Dalkon", "Danamark", "Daylen", "Dedric", "Deepmiddens", "Demir", "Devries", "Dian", "Dirke", "Domarien", "Donoghan", "Drakantal", "Drumwind", "Dungarth", "Dyrk", "Eandro", "Eleftheriou", "Erbil", "Ereghast", "Evermead", "Falck", "Falken", "Fallenbridge", "Faringray", "Fletcher", "Fryft", "Gallus", "Gandt", "Garkalan", "Girgis", "Goldrudder", "Gomec", "Grantham", "Graylock", "Grimtor", "Griswold", "Gul", "Gullscream", "Hackshield", "Hagar", "Hamlin", "Hartman", "Hayward", "Helmut", "Hindergrass", "Huba", "Hyden", "Iscalon", "Iscitan", "Janda", "Jeras", "Kaplan", "Kaya", "Kirca", "Kreel", "Kroft", "Krynt", "Lamoth", "Lanik", "Lavant", "Leerstrom", "Leyten", "Lynchfield", "Madian", "Malfier", "Mansur", "Markolak", "Massri", "Meklan", "Meluzan", "Menetrian", "Mikal", "Milos", "Moonridge", "Mouggi", "Mubarak", "Muhtar", "Namen", "Navaren", "Nerle", "Netheridge", "Nilus", "Ningyan", "Norris", "Novak", "Oakenheart", "Oyal", "Ozdemir", "Paradas", "Pekkan", "Pieter", "Polat", "Pyncion", "Quentin", "Raeburn", "Ramcrown", "Ratley", "Redraven", "Regdar", "Revenmar", "Ritter", "Rockharvest", "Romazi", "Roxley", "Rybar", "Sahin", "Samm", "Sarzan", "Sawalha", "Sedlak", "Semil", "Senturk", "Seratolva", "Serechor", "Sevenson", "Shadowhorn", "Shattermast", "Shaulfer", "Shehata", "Silvergraft", "Silvertarn", "Skandalor", "Stavenger", "Steveren", "Stormchapel", "Swiller", "Szereban", "Talandro", "Talfen", "Tamond", "Taran", "Targana", "Tavon", "Thom", "Torzalan", "Towerfall", "Trelenus", "Trevethor", "Tryphon", "Umbermoor", "Vadu", "Vanan", "Varcona", "Varzand", "Vavrus", "Voortham", "Vrago", "Vrye", "Welfer", "Wendell", "Wilxes", "Wintermere", "Wolfram", "Wygarthe", "Yilmaz", "Zarkanan", "Zatchet", "Zethergyll"]

let fNameLizardMale = ["Atzaccao", "Atzachau", "Auccaszriusz", "Aunjaxl", "Bhahusk", "Bharusk", "Bhasz", "Bhimijak", "Bhiz", "Bhizk", "Bhojizzi", "Bhuguz", "Bhujurlazk", "Bhushk", "Bhuzzasz", "Brakautszosz", "Brakotsza", "Bratlakaosz", "Brintakit", "Briz", "Broakuutzixl", "Bronjisz", "Brugakuxl", "Chihaokku", "Chotlauzk", "Drarsax", "Draszuqau", "Drathraqo", "Driz", "Droszruuqisz", "Drotszaqasz", "Druqirnaxl", "Druszru", "Gagroz", "Got", "Griltaxxazk", "Griumzuaxxusz", "Grixxirlit", "Grizk", "Grotszu", "Groxxiszrushk", "Grushk", "Gruuxxata", "Gruxxiszro", "Gruzk", "Gurnoxaosz", "Guxillasz", "Guxitlout", "Guxotszaxl", "Icatzux", "Ichursishk", "Illi", "Irziuchaz", "Ithroccik", "Jahazix", "Jashraziz", "Jirna", "Joask", "Jurzizoushk", "Juz", "Juzishrask", "Juzukxoa", "Kaz", "Kik", "Koushk", "Kruxl", "Kukxoxl", "Ocautizk", "Ochaltozk", "Onjuchik", "Orloshk", "Oshrigosz", "Oxao", "Ozzucuxl", "Qrakxot", "Qrarnaxl", "Qrazk", "Qrikzaoshk", "Qrux", "Rashk", "Rhitszix", "Rhiusk", "Rhozk", "Rirzo", "Roashk", "Rujusz", "Tharnozk", "Thok", "Thratzi", "Thrix", "Throt", "Trijosk", "Tritroax", "Uaxasz", "Ucagra", "Umzax", "Urlaz", "Vit", "Vox", "Yaozzi", "Yurlot", "Yushik", "Yut", "Zix", "Zuk", "Zuzk"]
let fNameLizardFemale = ["Acori", "Aekoknaez", "Agnuce", "Agzorisk", "Ajigye", "Akrica", "Alquh", "Azderix", "Bartu", "Bathloss", "Battatos", "Beichex", "Bex", "Biegnuz", "Bukzetus", "Charsheyuz", "Chetlayu", "Cheyecesk", "Chiass", "Chikziz", "Chogzaeyuss", "Chus", "Chuthruh", "Crexuchesk", "Crez", "Crixielqe", "Crixona", "Croxiekro", "Cruss", "Crutluz", "Deizirzhia", "Dezulqask", "Dhess", "Dheza", "Dhunzex", "Dizigyu", "Dokzazo", "Drass", "Duh", "Dulziaze", "Ecaex", "Ecakkeh", "Edrarieh", "Einikass", "Ekri", "Ereinza", "Esigas", "Esithos", "Hega", "Hosk", "Igzeru", "Ijechox", "Ijigna", "Ikkaka", "Inzusosk", "Irsheji", "Isulze", "Izesuh", "Jas", "Jilqax", "Jinzus", "Kageix", "Kex", "Khersuh", "Khiz", "Koge", "Korzhusk", "Kross", "Ojerzaeh", "Oklu", "Oqelziax", "Orzesa", "Orzho", "Oseilqaz", "Ottire", "Qusk", "Raess", "Rhass", "Rhis", "Rhix", "Rhuss", "Rikniss", "Saelqix", "Sask", "Sheh", "Shikles", "Shilqoss", "Shoz", "Sih", "Srokze", "Srottuh", "Srusk", "Sruthisk", "Thare", "Thaz", "Thida", "Thrakza", "Thrusk", "Ugyasux", "Usirtih", "Uziku", "Yakruss", "Yask", "Yass", "Yes", "Yiess", "Ziss", "Zuh", "Zuru"]
let lNameLizard = ["Aciku", "Aelzox", "Ajokkuss", "Akkeross", "Aojiatisk", "Aqukous", "Aquzaxl", "Atluruz", "Authekuss", "Bekkoatiz", "Bekkoss", "Betoguz", "Biatokniax", "Birtatox", "Bisk", "Bortetu", "Boz", "Busk", "Chazaxi", "Choutho", "Chulzoxu", "Chutle", "Chuxl", "Degozu", "Dezokzaes", "Dress", "Drixl", "Duzukzo", "Erethresk", "Ijerqo", "Ittu", "Jaesk", "Jax", "Jerqusk", "Josk", "Kas", "Kekuz", "Kesk", "Kixl", "Krux", "Kuknux", "Kuthrux", "Oakaqes", "Oaros", "Okneciz", "Oss", "Qas", "Rhalzuss", "Riklus", "Rusk", "Shriago", "Shrirsu", "Shroass", "Srexl", "Sriss", "Srurqi", "Srurtuxl", "Thethoass", "Thex", "Thraeknoss", "Throrsaess", "Ucirusk", "Ucorzusk", "Uqegoz", "Urqaca", "Urtiaquss", "Uttukusk", "Yiarti", "Zurtesk"]

let nameGoblin = ["Adnus", "Aggor", "Agknas", "Ake", "Alkor", "Allok", "Alzal", "Aneewi", "Apas", "Aq", "Arlig", "Arrast", "Atmong", "Banlus", "Biaq", "Bleemrerm", "Blemvi", "Bognok", "Boltshiv", "Botpot", "Brialb", "Brimolb", "Bugknas", "Bugnus", "Builk", "Busb", "Busz", "Ceakt", "Cenqea", "Cheappo", "Cheapshiv", "Cheeft", "Cinesz", "Cleargrin", "Cledholx", "Clird", "Coitbuts", "Culzo", "Dagmuing", "Dampbulb", "Dasassee", "Deevex", "Dikeelka", "Doblorx", "Drark", "Driovarm", "Droinvikz", "Dukt", "Ealics", "Ebixle", "Edikba", "Eenidiz", "Egenk", "Eggrat", "Eglus", "Elb", "Exi", "Ezmees", "Faaf", "Fehia", "Fexkakle", "Fezbanis", "Filgit", "Filiz", "Fillor", "Fimect", "Finkis", "Fixgrinder", "Fralozz", "Funk", "Furgor", "Fusenose", "Galave", "Gargor", "Garkras", "Gatte", "Geni", "Gitart", "Givex", "Gleantiokz", "Gliehbiabs", "Glovrets", "Gnaaldi", "Gnink", "Goldcoil", "Granrig", "Grexnit", "Gringott", "Guglok", "Hiarank", "Hits", "Husb", "Iazz", "Ikol", "Jac", "Jazqalird", "Jibald", "Jild", "Jisriank", "Jynvard", "Keelk", "Kervaq", "Khirt", "Kishqal", "Kiz", "Klal", "Kleedi", "Kleni", "Klytkel", "Kogrod", "Kroberd", "Krugnot", "Kurnast", "Kurnok", "Kurrod", "Kwiqeenk", "Kwite", "Kwol", "Kwyrd", "Labinkle", "Laggor", "Laglus", "Larlig", "Lorlex", "Lurnuff", "Mak", "Mankle", "Mazz", "Meblilvee", "Nadkar", "Neelnink", "Neezqee", "Nex", "Nubaf", "Nurgit", "Oics", "Olteqe", "Pagneeg", "Peddlehook", "Peddlesteam", "Peesus", "Peets", "Peneto", "Pepperscrew", "Peva", "Phofsiqa", "Pickbeast", "Plamraal", "Poiboix", "Preegnulk", "Priegs", "Prielx", "Prilx", "Prizokx", "Pudzekt", "Puilqi", "Qashnee", "Qert", "Qeshqart", "Qetgird", "Qirt", "Qubuildia", "Raglig", "Ranrat", "Rehulsi", "Repza", "Rodgit", "Rogkar", "Rognast", "Rurmat", "Rustscrew", "Ruzi", "Shosxa", "Shrilltask", "Sizqat Falsefight", "Slemolk", "Slozabs", "Stalb", "Stesiasa", "Stiats", "Stozlang", "Streazz", "Strialkoiq", "Styrk", "Thrizzee", "Tialb", "Tirx", "Tizde", "Traki", "Trerx", "Tres", "Trimze", "Trolb", "Trong", "Tuirt", "Twapie", "Tweeki", "Twizz", "Ugluilx", "Ugrig", "Uil", "Uish", "Ulge", "Valgex", "Vasse", "Veebaxol", "Viatmilk", "Violseerm", "Vividhook", "Vohdiols", "Vos", "Vrer", "Vryl", "Ward", "Washi", "Watek", "Wiar", "Wik", "Wioss", "Wonk", "Wrik", "Wrird", "Wuvraas", "Xaac", "Xosb", "Yveenkle", "Zeez", "Ziodvord", "Zreasz", "Zrizz", "Zudacs"]

let fNameGoliathMale = ["Aglok", "Apathok", "Arlath", "Armul", "Augrhan", "Augthag", "Aurmahk", "Eagdhan", "Eglig", "Egrad", "Ergghan", "Garhak", "Geaglath", "Gearian", "Geavhik", "Geazak", "Ghalig", "Ilidhan", "Kanarhak", "Kanaroth", "Kavanath", "Kavarian", "Kazaghan", "Kazarhak", "Khudak", "Khuman", "Koralig", "Korarian", "Krakan", "Kranak", "Lakein", "Lariak", "Lazagun", "Lazariak", "Lekko", "Lorovek", "Magal", "Magun", "Maman", "Meatham", "Meathok", "Moroth", "Movoi", "Mozak", "Namul", "Naunnio", "Neoman", "Neorath", "Orepeu", "Orilu", "Panak", "Parath", "Pathu", "Taralig", "Taralok", "Taramith", "Tauglath", "Tauveith", "Thalig", "Thariak", "Thavariak", "Thoriak", "Vadhan", "Vanihl", "Varaman", "Varapath", "Vathok", "Vikein", "Vimul", "Viphak", "Vivek", "Vokin", "Vonoth", "Zamahg", "Zarin"]

let fNameGoliathFemale = ["Daageo", "Daukha", "Daumi", "Dauria", "Galgeo", "Galrrea", "Ganna", "Gathi", "Gauthia", "Gauvia", "Geadath", "Genia", "Ilagea", "Ilageo", "Ilakan", "Ilanu", "Irathag", "Kagia", "Lanihl", "Lela", "Lelo", "Lovia", "Maapu", "Maathi", "Manni", "Manthi", "Marathi", "Meadath", "Meamul", "Megeo", "Nori", "Onennio", "Orekia", "Orepeu", "Orethio", "Orikeo", "Orithia", "Paaghu", "Paanna", "Pagia", "Palath", "Parrea", "Pathea", "Pauma", "Pauvia", "Peghu", "Pevi", "Puveith", "Vaannio", "Vaveith", "Veganath", "Voki", "Vukia", "Zakha", "Zaugia", "Zaveith"]

let nicknameGolaith = ["Adepttanner", "Adeptwalker", "Adeptworker", "Bearfist", "Bearfrightener", "Bravehand", "Braveleader", "Bravesmasher", "Bravetwister", "Brightdream", "Brightwanderer", "Brightweaver", "Dawnfriend", "Dawnmender", "Dawnshot", "Dayherder", "Daylogger", "Dayrunner", "Dayworker", "Deerfrightener", "Deerpicker", "Deerrunner", "Deersmasher", "Dreamguard", "Dreamhunter", "Elanalathi", "Flintfriend", "Flintshot", "Flintwanderer", "Flowerrunner", "Foodtwister", "Frightfist", "Frightfriend", "Frightjumper", "Frightlogger", "Frightmender", "Frighttwister", "Goatbearer", "Goathand", "Goatwarrior", "Goatweaver", "Hardmender", "Hidedrifter", "Hidewanderer", "Highsmasher", "Highstriker", "Honesteye", "Honesthauler", "Horncaller", "Hornlander", "Keendrifter", "Keenhand", "Lonetwister", "Longstriker", "Lowcaller", "Lowfrightener", "Lowkiller", "Lowlogger", "Lumberclimber", "Lumberdream", "Lumberfist", "Lumberjumper", "Lumberwarrior", "Masterfist", "Mastershot", "Mountaincaller", "Mountainjumper", "Mountainshot", "Mountainstriker", "Mountainvigor", "Nightherder", "Ogolithino", "Rainherder", "Rainleaper", "Rainpicker", "Riverdream", "Riverhand", "Riverweaver", "Rootaid", "Silenthauler", "Silentwalker", "Silentweaver", "Skybearer", "Skyleader", "Skyleaper", "Slyaid", "Slydrifter", "Slyeye", "Slymaker", "Smartfriend", "Smartshot", "Steadykiller", "Steadymender", "Stonewanderer", "Stormeye", "Stormvigor", "Stronghauler", "Strongleaper", "Stronglogger", "Swiftcook", "Swiftheart", "Swiftlogger", "Swiftmaker", "Threadsmasher", "Threadworker", "Thulavi", "Thunderbearer", "Thundercaller", "Thunderhand", "Thunderleaper", "Treebearer", "Treechaser", "Tribeaid", "Tribelogger", "Tribemender", "Truefist", "Truespeaker", "Truevigor", "Truthworker", "Wandermender", "Wanderwanderer", "Wanderweaver", "Wildaid", "Wildcarver", "Wildspeaker", "Wildstriker", "Wisehauler", "Wisetwister", "Woundfist", "Woundmaker", "Woundstriker", "Bearkiller", "Dawncaller", "Fearless", "Flintfinder", "Horncarver", "Keeneye", "Lonehunter", "Longleaper", "Rootsmasher", "Skywatcher", "Steadyhand", "Threadtwister", "Twice-Orphaned", "Twistedlimb", "Wordpainter"]

let lNameGoliath = ["Agu-Ulaga", "Agu-Ulalathi", "Agu-Ulanathi", "Agu-Uleaku", "Agu-Uliala", "Agu-Ulolake", "Agu-Ulukane", "Agu-Ulupine", "Agu-Vatho", "Agu-Vavone", "Agu-Vugate", "Agu-Vupine", "Anakalatho", "Anakalavea", "Anakaliago", "Anakaligala", "Anakalukena", "Apuna-Makume", "Apuna-Mupine", "Athunakane", "Athunatake", "Athunavone", "Athunileana", "Athunugoni", "Egena-Vaga", "Egumaga", "Egumakane", "Egumeaku", "Elanakanu", "Elanathai", "Elanugoni", "Ganu-Mageane", "Ganu-Makanu", "Gathakathala", "Gathakileana", "Geanakanu", "Geanathala", "Geanigano", "Geanigone", "Geanulane", "Geanuthea", "Inulaga", "Inuleaku", "Inulekali", "Inulugoni", "Inululane", "Kalagamino", "Kalaganathi", "Kalagatake", "Kalagelo", "Kalagiaga", "Kalagigala", "Kalagukane", "Kalagutha", "Kalukatho", "Kalukupine", "Katho-Olavone", "Katho-Oliago", "Kolakakume", "Kolakamino", "Kulanathala", "Kulanigala", "Kulanugate", "Kulanukate", "Kulanukena", "Kulumakanu", "Kulumatake", "Kulumavone", "Kulumugoni", "Lakumageane", "Lakumalathi", "Lakumatho", "Lakumiaga", "Lakumiano", "Lakumupine", "Lakumuthea", "Malukanathi", "Malukigone", "Malukugate", "Malukugoni", "Munakekali", "Munakiago", "Munakukane", "Munakukate", "Muthalathai", "Muthaliano", "Muthaligo", "Nalakakume", "Nalakavi", "Nalakigala", "Nalakulane", "Nola-Kanathi", "Nola-Katho", "Nola-Kiaga", "Nugalathala", "Nugaligano", "Nulakileana", "Nulakukena", "Ogoliaga", "Ogolukane", "Ovethatho", "Ovethiago", "Ovethiala", "Ovethigano", "Ovethulane", "Ovethutha", "Thenalakane", "Thenaligone", "Thenalukena", "Thenaluthea", "Thulamino", "Thulathai", "Thulithino", "Thunukaga", "Thunukavea", "Thunukelo", "Thunukileana", "Uguniano", "Uthenu-Kageane", "Uthenu-Kigala", "Uthenu-Kileana", "Uthenu-Kulane", "Vaimei-Lakane", "Vaimei-Lalathi", "Vaimei-Lanathi", "Vaimei-Lathai", "Vaimei-Liago", "Vaimei-Liala", "Valu-Nathai", "Valu-Niala", "Valu-Nigone", "Vathunanathi", "Vathuniaga", "Vathuniano", "Veomageane", "Veomeaku", "Vuma-Thiaga", "Vunakaga", "Vunakathala", "Vunakavea", "Vunakavone", "Vunakelo", "Vunakigo", "Vunakugate"]


//***********************************



//***********************************
//*  CHARACTERISTICS LISTS          *
//*********************************** 

let skinTone = ["Alabaster", "Almond", "Amber", "Beige", "Bisque", "Black", "Bronze", "Brown", "Butterscotch", "Caramel", "Carotenoid", "Cedar", "Chalky", "Chestnut", "Chocolate", "Cinnamon", "Coffee", "Copper", "Dark", "Dark Brown", "Espresso", "Fair", "Ginger", "Golden", "Greyish", "Hickory", "Honey", "Ivory", "Light Brown", "Mahogany", "Mustard", "Ochre", "Olive", "Pale", "Peach", "Pecan", "Pink", "Porcelain", "Praline", "Reddened", "Rose-Brown", "Rosy", "Ruddy", "Russet", "Sable", "Sallow", "Sorrel", "Tan", "Tanned", "Taupe", "Tawny", "Teak", "Terracotta", "Toffee", "Umber", "Very Fair", "White"]

let lizardTone = ["Apricot", "Aquamarine", "Black", "Blue", "Blue Gray", "Blue Green", "Blue Violet", "Brick Red", "Brown", "Cadet Blue", "Copper", "Dark Brown", "Dark Orange", "Dark Red", "Dark Sienna", "Forest Green", "Gold", "Goldenrod", "Gray", "Green", "Green Blue", "Green Yellow", "Lavender", "Lemon Yellow", "Light Purple", "Light Yellow", "Magenta", "Maroon", "Midnight Blue", "Navy Blue", "Olive Green", "Orange", "Orange Red", "Orange Yellow", "Pine Green", "Pink", "Plum", "Red", "Red Orange", "Red Violet", "Salmon", "Sea Green", "Sepia", "Sky Blue", "Spring Green", "Tan", "Turquoise Blue", "Umber", "Violet", "Violet Blue", "Violet Red", "White", "Yellow", "Yellow Green", "Yellow Orange"]

let dragonbornTone = ["Brass", "Bronze", "Copper", "Gold", "Silver", "Black", "Blue", "Green", "Red", "White"]

let orcGobTone = ["Reddish Brown", "Brown", "Yellow", "Reddish Yellow", "Yellowish Green", "Greenish Yellow", "Blueish Green", "Light Green", "Dark Green", "Green", "Grey", "Greenish Grey", "Yellowish Grey", "Brownish Grey"]

let tieflingTone = ["Red", "Light Red", "Dark Red", "Barn Red", "Blush", "Burgundy", "Candy Apple Red", "Cardinal", "Crimson", "Fuchsia", "Magenta", "Maroon", "Ochre", "Orangish Red", "Pink", "Raspberry", "Red Ochre", "Red-Violet", "Rose", "Ruby", "Rust", "Salmon", "Sanguine", "Scarlet", "Vermilion", "Wine"]

let skinComp = ["Acned", "Aged", "Aglow", "Ashen", "Blackhead-Speckled", "Blemished", "Blistered", "Blotchy", "Blushing", "Bristly", "Bumpy", "Calloused", "Chapped", "Clean", "Clear", "Coarse", "Creased", "Crinkled", "Crumpled", "Delicate", "Desiccated", "Dimpled", "Downy", "Drawn", "Droopy", "Dry", "Dull", "Fine", "Flaky", "Flawless", "Flushed", "Freckled", "Furrowed", "Gleaming", "Glistening", "Glowing", "Goose-Bumped", "Gossamer", "Granular", "Greasy", "Hairy", "Healthy", "Hive-Spotted", "Inflamed", "Lackluster", "Leathery", "Lined", "Liver-Spotted", "Loose", "Luminescent", "Lumpy", "Marred", "Moist", "Mottled", "Oozing", "Paper-Thin", "Patchy", "Peeling", "Pillowy", "Pimpled", "Pitted", "Pockmarked", "Puffy", "Radiant", "Rash-Covered", "Raw", "Rough", "Ruddy", "Sallow", "Sandpapery", "Satiny", "Scabby", "Scarred", "Shimmering", "Silky", "Smooth", "Soft", "Speckled", "Splotchy", "Spotty", "Sun-Worn", "Sunburnt", "Supple", "Sweaty", "Tanned", "Taut", "Tight", "Unblemished", "Veined", "Velvety", "Wan", "Warm", "Washed-Out", "Waxen", "Weathered", "Wind-Worn", "Windburnt", "Withered", "Work-Roughened", "Worn", "Wrinkly", "Youthful"]

let demeanor = ["Shy", "Bashful", "Reserved", "Outgoing", "Happy", "Nice", "Pleasant", "Tolerating", "Grumpy", "Mean", "Angry", "Offputting", "Rude", "Caring", "Motivated", "Cheerful", "Courageous", "Enthusiastic", "Friendly", "Generous", "Grateful", "Positive", "Trusting", "Sincere", "Aloof", "Apathetic", "Calous", "Cold", "Conceited", "Fearful", "Guarded", "Insolent", "Inconsiderate", "Indifferent", "Indulgent", "Intolerant", "Lazy", "Mistrusting", "Negative", "Pessimistic", "Petty", "Selfish", "Sour", "Vain", "Welcoming"]

let descriptors1 = ["Accent of a nearby land/region", "Accident-prone", "Acne", "Acne scars", "Bad eyesight", "Blind", "Buckteeth", "Burn scars on left side", "Burn scars on right side", "Crooked nose ", "Crooked teeth", "Deep voice", "Dirty", "Dirty clothes", "Dresses very tidy", "Dry lips", "Eyepatch over left eye", "Eyepatch over right eye", "Fast talker", "Freckles", "Has bad allergies", "High-pitched voice", "Hunched over posture", "Large bushy eyebrows", "Large ears", "Large nose", "Limp", "Long nose ", "Missing a tooth", "Missing fingers on left hand", "Missing fingers on right hand", "Missing left arm ", "Missing left eye", "Missing left leg ", "Missing right arm ", "Missing right eye", "Missing right leg ", "Missing several teeth", "Missing toes on left foot", "Missing toes on right foot", "Nervous laugh", "Patched & faded clothes", "Pleasant voice", "Pointy nose ", "Rotting teeth", "Scar on forehead", "Scar on left arm", "Scar on left cheek", "Scar on left eye", "Scar on neck", "Scar on right arm", "Scar on right cheek", "Scar on right eye", "Short nose ", "Slack-jawed", "Slobbish", "Slow talker", "Smells of a farm", "Smells of fish", "Smells of garlic", "Smells of pipe tobacco", "Smells very bad", "Tiny nose", "Tired face", "Unattractive", "Uneven ears ", "Uneven eyes ", "Upturned nose", "Walks with a bad limp", "Walks with a mild limp", "Wheezes", "Wooden tooth", "Warts", "Bad breath", "Warts", "Bad breath", "Dirty nails", "Dirty hands", "Calloused hands", "Enormous sideburns", "Yellow teeth", "Compulsive scratching", "Compulsive sneezing", "Dyed/unnatural colored hair", "Heaving sweating", "Harelip", "One pierced ear", "Pierced ears", "Winks a lot", "Missing teeth", "Club-footed", "Scarred from pox"]

let descriptors2 = ["Ambidextrous", "Anchor tattoo", "Arrow tattoo", "Bad acne", "Bites their nails", "Bulbous nose", "Cold hands", "Crooked fingers", "Cross-eyed", "Cult tattoo", "Dagger tattoo", "Deaf", "Doesn't make eye contact", "Gang tattoo", "Has a thick unibrow", "Hook nose", "Hunchback", "Incredibly attractive", "Ink-stained hands", "Jaundiced", "Large scar across chin", "Large scar over right eye", "Lazy left eye ", "Lazy right eye ", "Lots of freckles", "Mermaid tattoo", "Military tattoo", "Missing all teeth", "Missing left ear", "Missing right ear", "Nagging cough", "Nose has been broke multiple times", "Often chewing on an unknown root", "Old-fashioned", "One hell of a mustache", "Peg leg", "Piercing gaze", "Religious tattoo", "Remarkably good-looking", "Sailing ship tattoo", "Sailing tattoo", "Silver tooth", "Skin is covered in battle scars", "Skull tattoo", "Smells of baked bread", "Smells of incense", "Smells of meat", "Smells of mint", "Snake tattoo", "Spits while talking", "Sword tattoo", "Talks with a lisp", "Tree tattoo", "Tribal tattoo", "Uses an ear trumpet (hearing aid)", "Very hairy", "Very unattractive", "Wears glasses", "Wild eyes", "Wooden dentures", "Boils", "Very clean", "Very white teeth", "Glasses", "Compulsive blinking", "Pierced nose", "Covered in pustules", "Exceptionally average"]

let descriptors3 = ["Alopecia", "An extra finger", "Extremely ugly. People stop and stair. Kids cruelly call names from afar.", "Fashionable clothes", "From an unknown distant land", "Gold tooth", "Great posture", "Hissing voice", "Incredibly beautiful. People stare at them.", "Mechanical hand/arm", "Missing both ears", "Missing nose", "Monk haircut", "No tongue. Cannot speak verbally", "Slave tattoo", "Smells like strong perfume", "Very large earrings with holes through the center", "Very large earrings, stretching their ears", "Visible breath even when the temperature is not cold", "Vitiligo", "Wears very fine clothing", "Glass eye", "Pierced lip", "Tribal scar on forearm", "Major deformity"]


let eyeShape = ["Round", "Almond", "Thin", "Droopy", "Hooded", "Childish", "Beedy", "Squinted", "Large", "Small", "Twinkling", "Smiling", "Proud", "Pronounced", "Attentive", "Glaring", "Bright", "Shining", "Cold", "Calculating", "Distant", "Beautiful", "Warm", "Happy", "Piercing", "Shifty", "Sleepy", "Stuning", "Watchful", "Watery"]

let eyeColor = ["Blue", "Green", "Brown"]
let eyeColor2 = ["Hazel", "Sea-green", "Amber", "Gray", "Violet"]
let eyeColor3 = ["Golden", "Red", "Orange", "Purple", "Heterochromatic"]

let facialHair = ["Clean-Shaven", "Stubbled", "Scruffy", "Goatee", "Bushy Mustache", "Clean-Shaven", "Thin Mustache", "Wide Mustache", "Mutton Chops", "Full Beard", "Clean-Shaven", "Ducktail Beard", "Long, Braided Beard", "Mangy Beard", "Unkempt Beard", "Clean-Shaven", "Long, Straight Beard", "Handlebar Mustache", "Fu Manchu", "Horseshoe Mustache", "Clean-Shaven", "Pencil Mustache", "Walrus Mustache", "Goat Patch", "Anchor Beard", "Clean-Shaven", "Soul Patch", "Chin Curtain", "Chin Strap", "Long Sideburns", "Clean-Shaven"]

let hairStyle = ["Long, Wavy", "Long, Straight", "Long, Curly", "Long, Frizzy", "Wavy, Shoulder-Length", "Straight, Shoulder-Length", "Curly, Shoulder-Length", "Frizzy, Shoulder-Length", "Short, Frizzy", "Short, Wavy", "Short, Curly", "Short, Crew cut", "Short, Flat top", "Short-Cropped", "Short, Bowl Cut", "Medium-length, Bowl Cut", "Balding", "Shaved", "Bald", "Long, Braided"]

let hairColor = ["Auburn", "Black", "Brown", "Chestnut Brown", "Copper", "Dark Brown", "Ginger Red", "Golden Blond", "Grey", "Light Blond", "Medium Blond", "Medium Brown", "Black", "Brown", "Light Brown", "Light Chestnut Brown", "Medium Blond", "Medium Brown", "Black", "Brown", "Strawberry Blond", "White", "Greenish", "Purplish", "Blueish", "Medium Blond", "Medium Brown", "Black", "Brown"]

let height = ["Tall", "Short", "Very Tall", "Very Short"]

let build = ["Average weight", "Mildly Overweight", "Extremely Overweight", "Athletic", "Skinny", "Scrawny", "Starved", "Beer-bellied", "Big-boned", "Blubbery", "Broad", "Bulky", "Chubby", "Curvaceous", "Doughy", "Dumpy", "Fleshy", "Full-figured", "Heavy-set", "Plump", "Portly", "Potbellied", "Pudgy", "Squat", "Stocky", "Stout", "Thickset", "Angular", "Bony", "Delicate", "Fine-boned", "Gangly", "Lanky", "Lean", "Lithe", "Narrow", "Sinuous", "Sleek", "Slender", "Slight", "Slim", "Spindly", "Svelte", "Thin", "Underweight", "Waif-like", "Wispy", "Active", "Beefy", "Brawny", "Burly", "Defined", "Fit", "Healthy", "Hulking", "Husky", "Limber", "Muscular", "Nimble", "Powerful", "Ripped", "Robust", "Rugged", "Shredded", "Sinewy", "Solid", "Strong", "Sturdy", "Taut", "Toned", "Tough", "Atrophied", "Crooked", "Decrepit", "Deformed", "Deteriorating", "Emaciated", "Feeble", "Frail", "Gaunt", "Haggard", "Half-starved", "Maimed", "Malnourished", "Puny", "Rickety", "Ropy", "Runty", "Scalded", "Sickly", "Underfed", "Weak", "Withered", "Barrel-chested", "Broad-shouldered", "Hourglass-shaped", "Limp", "Pear-shaped", "Pumpkinesque", "Rotund", "Round", "Serpentine", "Shapely", "Small-waisted", "Thick-waisted", "Top-heavy"]

let profession = ["Acolyte", "Acrobat", "Advocate", "Alchemist", "Animal Trainer", "Antique Dealer", "Apothecary", "Appraiser", "Apprentice<br>(Roll again for profession)", "Architect", "Archivist", "Armorer", "Arsonist", "Artisan", "Astrologer", "Astronomer", "Auctioneer", "Baker", "Banker", "Barber", "Basket Maker", "Bather", "Beautician", "Beekeeper", "Beer Merchant", "Beggar", "Bell Maker", "Bellmaker", "Blacksmith", "Bleacher", "Bookbinder", "Bookkeeper", "Bookseller", "Bootblack", "Bounty Hunter", "Bowyer/Fletcher", "Brewer", "Brick maker", "Bricklayer", "Brothel Keeper", "Buckle Maker", "Bureaucrat", "Burglar", "Butcher", "Cabinet maker", "Calligrapher", "Canvass Maker", "Carpenter", "Cartographer", "Cartwright", "Chandler (Candle Maker)", "Cheese maker", "Chef", "Chest Maker", "Child Care", "Chimney sweep", "City/Town Guard", "Civil Engineer", "Clergy member", "Clerk", "Clock Maker", "Cloth Merchant", "Coachman", "Cobbler", "Confidence Artist", "Cook", "Cooper (barrel-maker)", "Copyist", "Counterfeiter", "Courtesan", "Courtier", "Cultist", "Curator", "Custodian", "Cutpurse", "Dairy Seller", "Dancer", "Dentist", "Diplomat", "Distiller", "Ditch Digger", "Diver", "Doctor", "Doctor, Licensed", "Doctor, Unlicensed", "Domestic Servant", "Dowser", "Dream Interpreter", "Dye Maker", "Engineer", "Engraver", "Envoy", "Executioner", "Falconer", "Farmer", "Firefighter", "Fisherman", "Fishmonger", "Florist", "Forger", "Fortuneteller", "Fuller", "Furrier", "Gambler", "Gardener", "Gilder", "Gladiator", "Glassblower", "Glazier", "Glove Maker", "Goldsmith", "Gong Farmer", "Grave Digger", "Grave Robber", "Grocer", "Guide", "Haberdasher", "Hay Merchant", "Healer", "Herbalist", "Hermit", "Highwayman", "Historian", "Hostler (Horse Groom)", "Hunter or Fowler", "Illuminator (Book Artist)", "Indentured Servant", "Inn/Tavern Servant", "Innkeeper", "Inventor", "Investigator", "Jailer", "Jester", "Jeweler", "Journeyman<br>(Roll again for profession)", "Judge", "Juggler", "Kennel Master", "Knight", "Laborer", "Lamp maker", "Lamplighter", "Launderer", "Leatherworker", "Librarian", "Lightbearer", "Linguist", "Livestock Merchant", "Locksmith", "Lumberjack", "Magic Merchant", "Maid", "Mason", "Mathematician", "Mercenary", "Merchant", "Metallurgist", "Midwife/husband", "Milkmaid/lad", "Miller", "Mime", "Miner", "Minstrel", "Moneychanger", "Moneylender", "Monk", "Monster Trapper", "Mortician", "Mummer", "Musical Instrument Maker", "Musician", "Navigator", "Net maker", "Noble", "Notary", "Orphan", "Outlaw", "Painter", "Paper/Parchment Maker", "Pastrycook", "Pathfinder", "Pawnbroker", "Perfumer", "Philosopher", "Pirate", "Plasterer", "Poet", "Politician", "Porter/Courier", "Potionmaker", "Potter", "Private Guard", "Professor", "Prospector", "Prostitute", "Puppeteer", "Rake", "Ratcatcher", "Restaurateur", "Rope Maker", "Rug Maker", "Saboteur", "Saddle maker", "Saddler", "Sage", "Sage/scholar", "Sail maker", "Sailor", "Salter", "Sapper", "Scabbard Maker", "Scout", "Scribe", "Sculptor", "Servant", "Server (inn/tavern/restaurant)", "Shepherd", "Shipwright", "Sign Maker", "Silversmith", "Singer / Bard", "Skinner", "Smuggler", "Soap Maker", "Soapmaker", "Soldier", "Spice Merchant", "Squire", "Stablehand", "Steward / Majordomo", "Storyteller", "Street cleaner", "Student", "Surveyor", "Swineherd", "Tailor", "Tanner", "Tattoo Artist", "Tavern Keeper", "Tax Collector", "Taxidermist", "Teacher", "Tent maker", "Thatcher/Roofer", "Thug", "Tiler", "Tinker", "Tobacco Merchant", "Torturer", "Town Crier", "Toy Maker", "Trapper", "Undertaker", "Urchin", "Vagabond", "Vintner", "Wainwright", "Warehouse Worker", "Watchman", "Water Carrier", "Weaponsmith", "Weaver", "Wetnurse", "Wheelwright", "Wig maker", "Woodcarver", "Woodseller", "Wool Merchant", "Writer"]

let activities = ["Going fishing", "Fetching water", "Carrying a tool to the carpenter for sharpening ", "Going to the laundry service", "Going to the market", "Playing dice or board games", "Watching a street performance", "Visiting the local apothecary", "Heading to the town square", "Going to the tavern for a drink", "Carrying a message", "Bringing fresh produce to market", "Taking a package to the town blacksmith", "Delivering firewood to a neighbor", "Walking to the town church", "Going to the tailor for new clothing", "Bringing a gift to a friend's house','Carrying a tool to the carpenter for repairs','On the way to a community meeting','Taking a sick relative to see the town healer','Escorting a group of travelers to an inn','Carrying a manuscript to the local scribe','Going to the local mill to grind grain','Bringing herbs to the town herbalist','Taking a cart to the market to sell goods','On the way to visit a neighboring village','Going to the river to do laundry','Escorting a group of children to school','Taking a horse to the stable for boarding','Heading to the townhall / manor / castle to request an audience','Bringing a tribute to the local ruler(s) ','On the way to the town cobbler for shoe repairs','Carrying a basket of fresh eggs to / from market','Bringing valuables to a moneylender < i > roll for 2 additional npcs as escorts</i > ','On the way to visit a relative in a nearby village','On the way to visit a relative in this settlement','Carrying a basket of wildflowers for decoration','Going to the herbalist for a remedy','Bringing a load of hay to feed livestock','Escorting a bard / musician to the tavern','Heading to the town magistrate's office", "On the way to visit a loved one's grave','Going to the town bathhouse for a bath','Bringing a donation to the town orphanage','Escorting a group of workers to a construction site','Carrying a message to a neighboring village','Enjoying a leisurely stroll','People - watching','Carrying a small package','Pausing to listen to a musician','Window shopping','Buying supplies at the market','Visiting the local herbalist','Delivering a message to the blacksmith','Checking on the progress of a construction project','Taking a wounded soldier to the healer','Picking up fresh bread from the baker','Taking a child to the schoolmaster','Carrying supplies to the monastery','Delivering a scroll to the town scribe','Going to the weaver's shop for new fabric", "Checking on livestock at the town's pasture','Carrying a load of hay to feed the horses','Heading to the river to catch fish','Delivering a package to a neighboring village','Visiting the town's shrine to pay respects", "Delivering a message to the guards at the gate", "Heading to the town cobbler for new shoes", "Carrying fresh flowers to the church", "Bringing a bundle of wool to the dyer", "Visiting the town's potter for new dishes','Carrying a load of grapes to the winery','Heading to the town guardhouse to report a theft','Going to the tavern to meet with friends','Visiting a friend's house", "Buying a new book", "Exploring a new part of town", "Going to archery practice", "Meeting someone for a secret rendezvous", "Admiring a street performer", "Sampling food from market stalls", "Sketching the architecture", "Helping a lost child find their way", "Going birdwatching", "Going to/from a nap under a nearby shade tree", "Looking for hidden gems at local secondhand/antique shops", "Admiring intricate tapestries", "Going to the market to purchase spices", "Going to/from the clothier's shop','Feeding breadcrumbs to pigeons','Going to / from the old cemetery','Going to / from the local beekeeper','Sketching a quaint building','Visiting a mysterious fortune teller','Acquiring a new quill and ink from the stationer','Visiting a friend's home to discuss a pressing matter", "Purchasing fresh ingredients for a special meal", "Exploring the town to find a lost item", "Delivering an urgent message to a loved one", "Examining a recently discovered map at the cartographer's','Stopping by the blacksmith to inquire about repairs','Searching for a skilled tutor for a child's education", "Bringing a bouquet of wildflowers to a sick relative", "Heading to the apothecary for a remedy for a family member", "Checking on the condition of a family grave at the cemetery", "Gathering materials for crafting a special gift", "Taking a detour to visit a wise old hermit for advice", "Going hunting for rare herbs deep in the nearby forest", "Returning borrowed books to the town's library','Collecting donations for a local charity or cause','Seeking a particular book or scroll from the scribe','Searching for a missing pet within the town','Heading to the river to conduct a ritual or offering','Carrying a basket of freshly baked bread to a celebration','Navigating the streets to find a gifted bard for an event','Offering prayers and incense at a town shrine','Adopting a stray animal found on the streets','Assisting a neighbor in moving to a new home','Purchasing candles for a special religious ceremony','Heading to the herbalist to find a rare and exotic remedy','Offering food to the beggars and needy on the streets','Purchasing provisions for a long journey ahead','Heading to the apothecary for an antidote to a poison','Bringing supplies to a reclusive scholar in the town','Carrying offerings to the town's patron deity's shrine','Meeting with a local artist for a commissioned work','Heading to the town's historian to learn about the past", "Collecting signatures for a petition to the lord", "Finding a skilled craftsman for a custom-made item", "Purchasing tickets for a traveling theater troupe", "Delivering a heartfelt apology to a wronged friend"]




//***********************************
//*  MAIN                           *
//***********************************

if (commonOnly == 1) {
    commonNPC();
} else {
    let md = new Dialog({
        content: dialogContent, title: `NPC GENERATOR`,
        buttons: {
            one: {
                label: `<div style="display: flex; align-items: center;font-size:20px;"><img src="modules/shuggaloafs-simple-npc-generator/media/wizard-face.svg" width="72;" /><b>&nbsp;Common<br>Races</b></div>`,
                callback: async () => {
                    commonNPC();
                },
            },
            two: {
                label: `<div style="display: flex; align-items: center;font-size:20px;"><img src="modules/shuggaloafs-simple-npc-generator/media/goblin.svg" width="72;" /><b>&nbsp;Uncommon<br>Races</b></div>`,
                callback: async () => {
                    uncommonNPC();
                },
            },
        }

    }, { width: 520, height: 130, left: screenWidth * 0.1, top: screenHeight * 0.85 }).render(true);


}