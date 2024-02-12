export const scaleSVG = (svgString, original, scaled) => {
    // Parse the SVG string into a DOM object
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');

    console.log(original);
    console.log


    // Get the root SVG element
    const svgElement = svgDoc.querySelector('svg');

    // Get the viewBox attribute
    const viewBoxAttr = svgElement.getAttribute('viewBox');
    const [minX, minY, width, height] = (viewBoxAttr || '0 0 100 100').split(' ').map(parseFloat);

    // Calculate scaling factors
    const scaleX = scaled.width / original.width;
    const scaleY = scaled.height / original.height;

    // Scale the root SVG element
    svgElement.setAttribute('width', window.innerWidth);
    svgElement.setAttribute('height', window.innerHeight);

    // Scale all child elements
    Array.from(svgElement.children).forEach(child => {
        child.setAttribute('x', (parseFloat(child.getAttribute('x')) - minX) * scaleX);
        child.setAttribute('y', (parseFloat(child.getAttribute('y')) - minY) * scaleY);
        child.setAttribute('width', parseFloat(child.getAttribute('width')) * scaleX);
        child.setAttribute('height', parseFloat(child.getAttribute('height')) * scaleY);
    });

    // Serialize the updated SVG back to a string
    const serializer = new XMLSerializer();
    const updatedSvgString = serializer.serializeToString(svgDoc);
    console.log(updatedSvgString);
    return updatedSvgString;
}