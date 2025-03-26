function rgbToRgba(rgb: string, opacity: number) {
  // Parse the RGB values from the string
  const match = rgb.match(/\d+/g);
  if (match) {
    const [r, g, b] = match;
    // Return the RGBA color string with opacity
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
}

export default rgbToRgba;
