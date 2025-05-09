# Terra-Logger

![GitHub](https://img.shields.io/github/license/phazingazrael/terra-logger?style=plastic) ![GitHub all releases](https://img.shields.io/github/downloads/phazingazrael/terra-logger/total?style=plastic) ![Electron.js](https://img.shields.io/badge/Uses-Electron.js-blue?style=plastic)

Terra-Logger is a tool that simplifies the process of organizing and managing data from Azgaar's Fantasy Map Generator.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Future Plans](#future-plans)
- [Contributing](#contributing)
- [License](#license)

## Introduction

Terra-Logger is a tool that simplifies the process of organizing and managing data from Azgaar's Fantasy Map Generator. With Terra-Logger, you can take an exported JSON file from Azgaar's generator and automatically generate organized individual Markdown files for each city, province, country, religious details, and more. This makes it easier to document and present your world-building project in a structured and easily readable format.
**Please note: This is a one-way process, and changes made to exported files will not sync to your map.**

## Features

- Convert Azgaar's Fantasy Map Generator JSON files into individual Markdown files for each location and detail.
- Automatically organize the information for cities, provinces, countries, religious details, and more.
- Display all available information for easy editing before exporting files.
- Future plans to include customizable templates for Markdown files, allowing you to further tailor the output to your specific needs.

## Installation

To be provided.

## Usage

To use Terra-Logger, follow these steps:

1. Export a JSON file from Azgaar's Fantasy Map Generator.
2. Launch Terra-Logger and import the exported JSON file.
3. Terra-Logger will display a user-friendly interface with all the available information.
4. Edit and customize the details as needed.
5. Export the organized individual Markdown files for each location and detail.

## Future Plans

We have exciting plans for future versions of Terra-Logger:

### Version 1.0 (Release)

- ~~Importing .map file from Azgaar's Fantasy Map Generator.~~
- ~~Use the included SVG from the .map file to render the actual map as the program's background.~~
- Exporting of simple markdown files for imported data.
- Ability to modify data prior to export.
- Automatically include relevant Emblems or Coat of Arms as an SVG file.
- Select location for exported files

### Version 1.1.0

- Ability to choose between multiple Markdown Templates.
- Customize how exported files are organized.

### Version 1.2.0

- Ability to generate random world history, applying additional details for World Building based off [This](https://www.reddit.com/r/worldbuilding/comments/9ugp4r/hey_squad_so_ive_got_an_idea_for_easy_world/) by [u/Oselic](https://www.reddit.com/user/Osellic/) and [This](https://docs.google.com/spreadsheets/d/1QbuVTfTYSczRJIRbffGPDhv6jEMxoa-RyIgi1ityV8U/edit#gid=560919452) by Lythande.


## Contributing

We appreciate your interest in contributing to Terra-Logger! If you have any ideas for improvements, new features, or bug reports, please follow these steps:

1. Check the [issue tracker](https://github.com/phazingazrael/terra-logger/issues) to see if your idea or bug has already been discussed or reported.
2. If you don't find an existing issue, [create a new issue](https://github.com/phazingazrael/terra-logger/issues/new).
3. Clearly describe the problem, feature request, or bug you have identified. Provide as much relevant information as possible, such as error messages, steps to reproduce the issue, or examples of expected behavior.
4. If you would like to work on the issue yourself, please indicate your interest in the issue comments. This helps prevent duplicated efforts.
5. Wait for project maintainers to review and respond to your issue. They will provide guidance, additional information, or request changes if needed.

By utilizing the issue tracker, we can keep track of all contributions, discussions, and progress in one place. It also allows other users to participate in the discussion or contribute to existing issues.

We value your feedback and contributions to make Terra-Logger better. Thank you for helping us improve the software!

## License

Terra-Logger is licensed under the [MIT License](LICENSE). You can find the full text of the license in the [LICENSE](LICENSE) file.

## Acknowledgments

We would like to express our gratitude to the developers of [Azgaar's Fantasy Map Generator](https://github.com/Azgaar/Fantasy-Map-Generator) for their fantastic tool, which inspired and provided the foundation for Terra-Logger.

We would like to express our gratitude to [Shuggaloaf](https://github.com/Shuggaloaf/) for their [System Agnostic RPG NPC Generator](https://github.com/Shuggaloaf/Simple_NPC_Generator/). Currently implemented in basic format to provide basic npc data when loading map. Will be extended with customization later.
