import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

export const defaultReligionGeneralInformationBlock =
  createMustacheMarkdownBlock({
    id: "default.religion.generalInformation",
    template: `## General Information
- **Code:** {{code}}
- **Culture Center:** {{center.name}}
- **Type:** {{type}}
- **Form:** {{form}}
- **Deity:** {{deity}}`,
  });
