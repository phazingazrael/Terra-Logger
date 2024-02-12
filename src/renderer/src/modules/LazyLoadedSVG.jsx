import React, { useRef, useEffect } from 'react';

export const LazyLoadedSVG = ({ coa }) => {
  const imgRef = useRef(null);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1 // Percentage of the target element's visibility
    };

    const callback = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Load SVG when it becomes visible
          const url = `https://armoria.herokuapp.com/?coa=${encodeURIComponent(JSON.stringify(coa))}`;
          imgRef.current.src = url;
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(callback, options);
    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, [coa]);

  return <img ref={imgRef} alt="Coat of Arms" />;
};
