import { useRef, useEffect } from 'react';

import PropTypes from 'prop-types';


const LazyLoadedSVG = ({ coa }) => {
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
          let url = '';

          // Check if coa is an object and not empty
          if (typeof coa === 'object' && Object.keys(coa).length > 0) {
            url = `https://armoria.herokuapp.com/?coa=${encodeURIComponent(JSON.stringify(coa))}`;
          } else {
            url = 'https://armoria.herokuapp.com/?size=500&format=svg';
          }
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


//LazyLoadedSVG

export default LazyLoadedSVG