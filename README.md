# Terra-Logger

![GitHub](https://img.shields.io/github/license/phazingazrael/terra-logger?style=plastic)

Terra-Logger is a tool that simplifies the process of organizing and managing data from Azgaar's Fantasy Map Generator.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Usage](#usage)
- [Future Plans](#future-plans)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Introduction

Terra-Logger is a tool that simplifies the process of organizing and managing data from Azgaar's Fantasy Map Generator. With Terra-Logger, you can take an exported map file from Azgaar's generator and automatically generate organized individual Markdown files for each city, country, religious details, and more. This makes it easier to document and present your world-building project in a structured and easily readable format.
**Please note: This is a one-way process, and any changes made to exported files will not sync to your map.**

## Features

- Convert Azgaar's Fantasy Map Generator map files into individual Markdown files for each city, country, and religious detail.
- Automatically organize the information for cities, countries, religious details, and more.
- Display all available information for easy review before exporting files.

## Usage

To use Terra-Logger, follow these steps:

1. Visit Azgaar's Fantasy Map Generator and save your .map file.
2. Import Your .map file into Terra-Logger under the settings page.
3. View your data.
4. Export the organized Markdown files.

## Future Plans

We have exciting plans for future versions of Terra-Logger:

### Version 1.1.0

- [x] Additional Exports (Cultures, Notes, Cities, Countries, Religions).
- [x] Ability to choose between multiple Markdown Templates.
  - Currently only basic Markdown and the Bag of Tips Inspired Vault.
- [x] Implement Shuggaloaf's System Agnostic RPG NPC Generator.
  - [x] Further customize Shuggaloaf's System Agnostic RPG NPC Generator to allow specific npc type generation for map data use.
  - [ ] Expand NPC generation for Atlas entities.
- [x] Replace the legacy JSONUI editor with the Atlas Document Editor.
- [x] Support editing Cities.
- [x] Support editing Countries.
- [x] Support editing Cultures.
- [x] Support editing Religions.
- [ ] Improve Religion and Culture associations within Cities and Countries using existing AFMG `.map` data.
- [ ] Improve links between related entities, including Religions, governments and geographic regions, using available map data.
- [ ] Derive suggested themes for Countries, Cultures and other entities from their existing map data.
- [x] Support editing Notes.
- [x] Support editing NPCs, Historical Eras and Developmental Eras.
- [ ] Support editing Militaries (converted from notes/country data)
- [ ] Support editing Points of Interest (converted from notes data)
- [x] Replace the legacy Markdown exporter with the Markdown Builder.
- [x] Support reusable Markdown export blocks.
- [x] Support Atlas custom section exports.
- [ ] Continue export customization.
  - [ ] Customize exported frontmatter.
  - [ ] Select exported sections.
- [ ] Continue Atlas editor improvements.
  - [x] Improve rich text editing.
  - [ ] Expand reusable block types.
  - [ ] Expand reusable section presets.
- [ ] Rewrite background map support to be written in canvas, supporting better viewing options.
  - [ ] Support zooming to various features on map.
 **AFMG Update Support**
- [x] AFMG v1.124.0 (Economy) Update support.
- [x] AFMG v1.140.0 (Labels) Update Support.
- [x] AFMG v1.150.0 (Journeys) Update Support.
- [x] AFMG v1.152.1 (Options) Update Support.
- [x] AFMG v1.153.0 (Omnibar) Update Support.
- [x] AFMG v1.154.0 (Icon Library) Update Support.
- [x] AFMG v1.155.0 (Translations) Update Support.
- [x] AFMG v1.156.0 Update Support.
- [x] AFMG v1.157.0 (Economy Rework) Update Support.
- [x] AFMG v1.158.0 Update Support.

### Version 1.2.0

- [ ] Implement [Chris Whong's](https://github.com/chriswhong) [Mapbox Gl Version](https://github.com/chriswhong/mapbox-fantasy-map-generator) of AFMG?
- [ ] Ability to generate random world history, applying additional details for World Building based off [This](https://www.reddit.com/r/worldbuilding/comments/9ugp4r/hey_squad_so_ive_got_an_idea_for_easy_world/) by [u/Oselic](https://www.reddit.com/user/Osellic/) and [This](https://docs.google.com/spreadsheets/d/1QbuVTfTYSczRJIRbffGPDhv6jEMxoa-RyIgi1ityV8U/edit#gid=560919452) by Lythande.

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

We would like to express our gratitude to [u/Oselic](https://www.reddit.com/user/Osellic/) for their work on [This](https://www.reddit.com/r/worldbuilding/comments/9ugp4r/hey_squad_so_ive_got_an_idea_for_easy_world/)

We would like to express our gratitude to Lythande for their work on [This](https://docs.google.com/spreadsheets/d/1QbuVTfTYSczRJIRbffGPDhv6jEMxoa-RyIgi1ityV8U/edit#gid=560919452)
