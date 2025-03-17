import { useEffect, useRef } from "react";
import { customAlphabet } from "nanoid";

import PropTypes from "prop-types";

function LazyLoadedSVG(props: Readonly<TLCoA>) {
	const imgRef = useRef<HTMLImageElement>(null);
	const coa = props;

	const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 8);

	useEffect(() => {
		const options = {
			root: null,
			rootMargin: "0px",
			threshold: 0.1, // Percentage of the target element's visibility
		};
		console.log(coa);
		const callback = (
			entries: IntersectionObserverEntry[],
			observer: IntersectionObserver,
		) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					// Load SVG when it becomes visible
					let url = "";

					// Check if coa is an object and not empty
					if (typeof coa === "object" && Object.keys(coa).length > 0) {
						url = `https://armoria.herokuapp.com/?coa=${encodeURIComponent(JSON.stringify(coa))}`;
					} else {
						url = "https://armoria.herokuapp.com/?size=500&format=svg";
					}
					if (imgRef.current) {
						imgRef.current.src = url;
					}
					observer.unobserve(entry.target);
				}
			}
		};

		const observer = new IntersectionObserver(callback, options);
		if (imgRef.current) {
			observer.observe(imgRef.current);
		}

		return () => {
			observer.disconnect();
		};
	}, [coa]);

	return <img className="CoA" ref={imgRef} alt="Coat of Arms" />;
}

LazyLoadedSVG.propTypes = {
	coa: PropTypes.shape({
		t1: PropTypes.string,
		division: PropTypes.shape({
			division: PropTypes.string,
			t: PropTypes.string,
			line: PropTypes.string,
		}),
		charges: PropTypes.arrayOf(
			PropTypes.shape({
				charge: PropTypes.string,
				t: PropTypes.string,
				p: PropTypes.string,
				size: PropTypes.number,
			}),
		),
		shield: PropTypes.string,
	}),
};

export default LazyLoadedSVG;
