export function rgbToRgba(rgb, opacity) {
    // Parse the RGB values from the string
    const [r, g, b] = rgb.match(/\d+/g);

    // Return the RGBA color string with opacity
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}