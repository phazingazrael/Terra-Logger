type svgData = {
  svg: string;
  height: number;
  width: number;
};

export const handleSvgReplace = (data: svgData) => {
  const mapElement = document.getElementById('map');

  if (mapElement) {
    mapElement.remove();
  }

  // Get current window dimensions
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  // Get original dimensions from data
  const originalHeight = data.height;
  const originalWidth = data.width;

  // insert SVG into DOM
  document.body.insertAdjacentHTML('afterbegin', data.svg);

  // assign SVG elements to variables
  const mapItem = document.getElementById('map');
  const viewBox = document.getElementById('viewbox');

  // apply transformations to scale SVG
  if (mapItem) {
    if (viewBox) {
      mapItem.setAttribute('height', windowHeight as unknown as string);
      mapItem.setAttribute('width', windowWidth as unknown as string);
      viewBox.setAttribute('height', windowHeight as unknown as string);
      viewBox.setAttribute('width', windowWidth as unknown as string);
    }

    // Apply transformation to scale content
    if (innerHeight > originalHeight) {
      viewBox?.classList.add('svgScaledUp');
    } else if (innerHeight < originalHeight) {
      viewBox?.classList.add('svgScaledDown');
    }

    viewBox?.setAttribute(
      'transform',
      `scale(${innerWidth / originalWidth},${innerHeight / originalHeight})`,
    );
  }

  return data;
};
