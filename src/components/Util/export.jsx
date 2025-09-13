import { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormGroup,
  FormControlLabel,
} from "@mui/material";

const defaultOptions = [
  'Cities',
  'Countries',
  'Religions',
  'Cultures',
  'Governments',
  'Notes',
  'Map SVG',
  'Coat of Arms SVGs',
];

export const Export = () => {
  //const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [Defaults, setDefaults] = useState([]);
  const [selectAllDefaults, setSelectAllDefaults] = useState(true);
  const [open, setOpen] = useState(true);


  const handleExport = () => {
    // Assuming you have another JSON object (dataToExport) to be sent to the API
    const dataToExport = ['test'];
    const exportOptions = {
      template: selectedTemplate,
      Defaults,
    };

    // Send the exportOptions and dataToExport to your API
    fetch('http://localhost:3000/api/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ exportOptions, dataToExport }),
    })
      .then(response => response.json())
      .catch(error => {
        console.error('Error exporting data:', error);
      });
  };

  const onClose = () => {
    setOpen(false);
  }

  const handleSelectAllDefaults = () => {
    setSelectAllDefaults(!selectAllDefaults);
    setDefaults(selectAllDefaults ? [] : [...defaultOptions]);
  };

  const handleSelectDefault = (option) => {
    const updatedDefaults = Defaults.includes(option)
      ? Defaults.filter((item) => item !== option)
      : [...Defaults, option];

    setDefaults(updatedDefaults);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Export Options</DialogTitle>
      <DialogContent>
        {/* <FormControl fullWidth>
          <InputLabel id="template-label">Select Template</InputLabel>
          <Select
            labelId="template-label"
            id="template"
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
          >
            {templates.map((template) => (
              <MenuItem key={template} value={template}>
                {template}
              </MenuItem>
            ))}
          </Select>
        </FormControl> */}
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={selectAllDefaults}
                onChange={handleSelectAllDefaults}
              />
            }
            label="Select All Defaults"
          />
          {defaultOptions.map((option) => (
            <FormControlLabel
              key={option}
              control={
                <Checkbox
                  checked={Defaults.includes(option)}
                  onChange={() => handleSelectDefault(option)}
                />
              }
              label={option}
            />
          ))}
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleExport} variant="contained" color="primary">
          Export
        </Button>
      </DialogActions>
    </Dialog>
  );
};
