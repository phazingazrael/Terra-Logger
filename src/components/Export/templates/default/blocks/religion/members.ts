import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

export const defaultReligionMembersBlock = createMustacheMarkdownBlock({
  id: "default.religion.members",
  template: `## Members
- **Rural Members:** {{members.rural}}
- **Urban Members:** {{members.urban}}`,
});
