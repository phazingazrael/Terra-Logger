# Web App Development Roadmap

## 1. Vision and Objectives

### Vision

- **What problem does your web app solve?**
  The project, Terra-Logger, will solve the problem of having to manually write a new document for each city, country, or other detail provided by Azgaar's Fantasy Map Generator.

- **Who is the target audience for your web app?**
  Dungeon Masters and Game Masters for Tabletop RPG systems, as well as authors or others who participate in world-building.

- **What makes your web app unique or better than existing solutions?**
  Terra-Logger provides an automated system for creating detailed documents on the various aspects of the map. Currently, exporting from Azgaar's Fantasy Map Generator would export individual lists for cities, countries, and other details. Terra-Logger will provide Markdown Files for use inside of an Obsidian.md Vault with interlinking notes and references, including relevant Coat of Arms when possible as well as an image copy of the map when last saved.

### Objectives

- **What are the key objectives you aim to achieve with the initial release?**

  - Allow users to import an existing .map file from Azgaar's Fantasy Map Generator.
  - Display Map data in an easy to understand way prior to creating markdown files.
  - Generate random 'system agnostic' fantasy NPC data when needed for map data.
  - Use the included SVG from the .map file to render the actual map as the program's background for further mental association.
  - Provide users with Obsidian.md compatible markdown files with relevant Coat of Arms if possible.
  - Provide users with an exported copy of the map as well.
  - Select location for exported files.
  - Implement basic but thorough Jest testing.
  - Potentially allow users the ability to modify data prior to export.

- **What are the long-term goals for your web app?**
  - Add multiple markdown file templates, allowing users to select which one is used.
  - Customize how exported files are organized.
  - Generate random 'system agnostic' fantasy NPC data when needed for map data. Rework to provide 'ORC License' content-based NPC's for related systems. Plans include Pathfinder 2nd Edition, Dungeons and Dragons 5th edition. Rework to specify NPC details.
  - Far Future: Provide users the ability to generate random world history, applying additional details for World Building based on [this](https://www.reddit.com/r/worldbuilding/comments/9ugp4r/hey_squad_so_ive_got_an_idea_for_easy_world/) by [u/Oselic](https://www.reddit.com/user/Osellic/) and [this](https://docs.google.com/spreadsheets/d/1QbuVTfTYSczRJIRbffGPDhv6jEMxoa-RyIgi1ityV8U/edit#gid=560919452) by Lythande.

## 2. Current State Assessment

- **Which features are already implemented in your web app?**

  - Allow users to import an existing .map file from Azgaar's Fantasy Map Generator.
  - Display Map data in an easy to understand way prior to creating markdown files.
  - Generate random 'system agnostic' fantasy NPC data when needed for map data.

- **What are the known bugs or performance issues?**

  - Use the included SVG from the .map file to render the actual map as the program's background for further mental association. - Only works when first loading the .map file and does not work when re-loading data from the internal database.
  - When deleting all map information from the internal database, it does not fully delete and causes the program to think a map is loaded.

- **What areas need refinement or testing before release?**
  - Yes.

## 3. Prioritization (MoSCoW Method)

### Must Have

- **What are the critical features that must be in place for launch?**
  - Allow users to import an existing .map file from Azgaar's Fantasy Map Generator.
  - Display Map data in an easy to understand way prior to creating markdown files.
  - Generate random 'system agnostic' fantasy NPC data when needed for map data.
  - Use the included SVG from the .map file to render the actual map as the program's background for further mental association.
  - Provide users with Obsidian.md compatible markdown files with relevant Coat of Arms if possible.
  - Provide users with an exported copy of the map as well.
  - Implement basic but thorough Jest testing.
  - Select location for exported files.

## 4. Milestones and Timelines

- **What are the deadlines for each milestone?**
  - No existing deadlines; this is a hobby project worked on when time is available.

## 5. Resource Allocation

- **How many team members are working on the project?**

  - One.

- **What are their roles and responsibilities?**

  - Everything.

- **Are there any tools or external resources you'll be relying on?**
  - Using Electron.js, React.js, Node.js, and various NPM Libraries such as MUI React.

## 6. Risk Management

- **What potential risks could impact your timeline?**

  - Major bugs, inability to work on the project, dreaming up random new features.

- **What mitigation strategies have you planned?**
  - Major bugs: test the app as development progresses, Learn to implement Jest testing, Implement basic but thorough Jest testing.

## 7. Communication Plan

- **How will progress be tracked and reported?**

  - Currently using a todo.md that is lacking. Open to suggestions here....

- **What is the frequency of team meetings?**

  - There are none; this is a one-person project.

- **How will decisions be communicated to the team?**
  - As this is a one-person project, all communication is done internally, typically via notes and reminders left for when available to work on the project.

## 8. Continuous Feedback Loop

- **How will you gather feedback from users during the beta phase?**

  - There is no beta phase planned currently. Release (1.0) will act as the testing version/phase for users and their various use cases.

- **What mechanisms will be in place for users to report issues or suggest improvements?**
  - GitHub Issue Templates are in the works to assist users in providing feedback.

## 9. Launch Plan

- **What are the final steps before launch (e.g., testing, marketing)?**

  - Finalize code for release version,
  - Ensure testing works and passes,
  - Light marketing at launch on Reddit for Azgaar's Fantasy Map Generator.

- **How will you address immediate issues post-launch?**
  - Through GitHub issues.

## 10. Post-Launch and Beyond

- **How will you monitor for bugs or issues post-launch?**

  - GitHub issues.

- **What is the plan for the next set of features or updates?**
  - First major update (1.1) will include the following:
    1. Add multiple markdown file templates, allowing users to select which one is used.
    2. Customize how exported files are organized.
    3. Generate random 'system agnostic' fantasy NPC data when needed for map data. Rework to provide 'ORC License' content-based NPC's for related systems. Plans include Pathfinder 2nd Edition, Dungeons and Dragons 5th edition. Rework to specify NPC details.
