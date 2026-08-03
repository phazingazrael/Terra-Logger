### Todo List

**Version 1.0 (Release)**

- [x] Importing .map file from Azgaar's Fantasy Map Generator.
- [x] Automatically include relevant Emblems or Coat of Arms as an SVG file.
- [x] Use the included SVG from the .map file to render the actual map as the program's background.
- [x] Exporting of simple markdown and SVG files where relevant.

**Version 1.1.0**

- [x] Additional Exports (Cultures, Notes, Cities, Countries, Religions).
- [x] Ability to choose between multiple Markdown Templates.
  - [x] Basic Markdown.
  - [x] Bag of Tips Inspired Vault.
- [x] Replace the legacy JSONUI editor with the Atlas Document Editor.
- [x] Support editing Cities.
- [x] Support editing Countries.
- [x] Support editing Cultures.
- [x] Support editing Religions.
- [x] Support editing Notes.
- [ ] Support editing Militaries (converted from notes/country data)
- [ ] Support editing Points of Interest (converted from notes data)
- [x] Support reusable Atlas sections.
- [x] Support reusable Atlas blocks.
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
- [x] Implement Shuggaloaf's System Agnostic RPG NPC Generator.
  - [ ] Expand NPC generation for Atlas entities.

**Version 1.2.0**

- [ ] Implement [Chris Whong's](https://github.com/chriswhong) [Mapbox Gl Version](https://github.com/chriswhong/mapbox-fantasy-map-generator) of AFMG?
- [ ] Ability to generate random world history, applying additional details for World Building based off [This](https://www.reddit.com/r/worldbuilding/comments/9ugp4r/hey_squad_so_ive_got_an_idea_for_easy_world/) by [u/Oselic](https://www.reddit.com/user/Osellic/) and [This](https://docs.google.com/spreadsheets/d/1QbuVTfTYSczRJIRbffGPDhv6jEMxoa-RyIgi1ityV8U/edit#gid=560919452) by Lythande.
- [ ] Expand procedural lore generation.
- [ ] Improve Atlas editor performance.
- [ ] Reduce unnecessary React renders.
- [ ] Investigate Atlas pages requiring manual refresh.
- [ ] Continue improving Atlas usability.
- [ ] Continue improving Digital Garden integration.
- [ ] Improve Markdown Builder performance.
- [ ] Support user-defined export presets.
- [ ] Replace the current SVG rendering approach with interactive safer version.
- [ ] Consolidate HTML and SVG sanitization.
- [ ] Replace deprecated browser APIs.
- [ ] Establish automated testing.
  - [ ] Configure Vitest.
  - [ ] Configure jsdom.
  - [ ] Configure Testing Library.
  - [ ] Configure jest-dom.
  - [ ] Configure coverage reporting.
  - [ ] Create Atlas editor tests.
  - [ ] Create Markdown Builder tests.
  - [ ] Create import/export tests.
  - [ ] Create regression tests.
  - [ ] Document the testing framework.
- [ ] Continue reducing technical debt.