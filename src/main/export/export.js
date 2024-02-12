const fs = require('fs');
const path = require('path');

const baseDirectory = './';

const createFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }
};

const createFile = (filePath, content = '') => {
  fs.writeFileSync(filePath, content, 'utf-8');
};

const createTemplates = (category, templates) => {
  const categoryPath = path.join(baseDirectory, category);
  createFolder(categoryPath);

  templates.forEach((template) => {
    const templatePath = path.join(categoryPath, `${template}.md`);
    const templateContent = `# ${template}\n\n## Overview\n\n## Notes\n`;
    createFile(templatePath, templateContent);
  });
};

const generateTemplates = (category, templates) => {
  const categoryPath = path.join(baseDirectory, category);
  createFolder(categoryPath);

  templates.forEach((template) => {
    const templatePath = path.join(categoryPath, `${template}_Template.md`);
    if (!fs.existsSync(templatePath)) {
      createFile(templatePath, `# ${template}\n\n## Overview\n\n## Notes\n`);
    }
  });
};

// Create top-level folders
createFolder(baseDirectory);

// Create category folders
const categories = [
  'Events',
  'Groups',
  'Other',
  'Sources',
  'Things',
];

categories.forEach((category) => {
  createFolder(path.join(baseDirectory, category));
});

// Generate template files if not exists
const templatesByCategory = {
  Events: ['Incident', 'Quest', 'Scene', 'Storyline', 'Time_Period'],
  Groups: ['Group_List', 'Group_Commerce', 'Group_Criminal', 'Group_Ethnic', 'Group_Family', 'Group_Government', 'Group_Military', 'Group_Other', 'Group_Religious'],
  Other: ['Campaign_Planner', 'Concept', 'Plot_Idea', 'Prep_Journal', 'Session_Journal'],
  Sources: ['GM_Synopsis', 'Player_Synopsis', 'Story_Source'],
  Things: ['Named_Equipment', 'Named_Object', 'Named_Vehicle'],
};

categories.forEach((category) => {
  generateTemplates(category, templatesByCategory[category] || []);
});

console.log('Folder structure and templates created successfully!');
