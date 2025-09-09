import { useEffect } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { useRecoilState } from "recoil";
import mapAtom from "./atoms/map";
import { initDatabase } from "./db/database";

import type { MapInf } from "./definitions/TerraLogger";

import "./App.css";

const App = (): JSX.Element => {
	const [map] = useRecoilState<MapInf>(mapAtom);

	// resize map
	useEffect(() => {
		/**
		 * Handles the window's resize event.
		 * This function is called whenever the user resizes the window.
		 */
		function handleResize() {
			// Get the new window dimensions
			const { innerHeight, innerWidth } = window;

			// Log the new window dimensions
			console.info("resized to: ", innerWidth, "x", innerHeight);

			// Get the map elements
			const mapElement = document.getElementById("map");
			const viewBox = document.getElementById("viewbox");

			// Get the original dimensions of the map
			const originalHeight = map.info.height;
			const originalWidth = map.info.width;

			// Scale the map to fit the new window dimensions
			if (mapElement) {
				if (viewBox) {
					// Set the new height and width of the map element
					mapElement.setAttribute("height", innerHeight as unknown as string);
					mapElement.setAttribute("width", innerWidth as unknown as string);

					// Set the new height and width of the viewBox element
					viewBox.setAttribute("height", innerHeight as unknown as string);
					viewBox.setAttribute("width", innerWidth as unknown as string);

					// Apply transformation to scale content
					viewBox.setAttribute(
						"transform",
						`scale(${innerWidth / originalWidth},${innerHeight / originalHeight})`,
					);
				}
			}
		}

		window.addEventListener("resize", handleResize);
	});

	// Initialize the database
	useEffect(() => {
		/**
		 * Initializes the IndexedDB database.
		 * This function is called once, when the component mounts.
		 */
		const initializeDatabase = async () => {
			try {
				// Initialize the IndexedDB database
				const database = await initDatabase();

				if (database) {
					console.info("Database initialized");
				}
			} catch (error) {
				// Handle any errors that occur when initializing the database
				console.error("Failed to initialize database:", error);
			}
		};

		initializeDatabase();
	}, []);

	const router = createBrowserRouter([
		{
			path: "/",
			async lazy() {
				const [{ default: MainLayout }, { default: ErrorBoundary }] =
					await Promise.all([
						import("./layouts/MainLayout"),
						import("./pages/ErrorPage/ErrorPage"), // this module should export a React component that uses useRouteError()
					]);
				return { Component: MainLayout, ErrorBoundary };
			},
			children: [
				{
					index: true, // replaces path: "/"
					lazy: () =>
						import("./pages/HomePage/HomePage").then((m) => ({
							Component: m.default,
						})),
				},
				// {
				// 	path: "tags",
				// 	lazy: () =>
				// 		import("./pages/Tags/Tags").then((m) => ({ Component: m.default })),
				// },
				{
					path: "settings",
					lazy: () =>
						import("./pages/Settings/Settings").then((m) => ({
							Component: m.default,
						})),
				},
				{
					path: "countries",
					lazy: () =>
						import("./pages/CountriesPage/CountriesPage").then((m) => ({
							Component: m.default,
						})),
				},
				{
					path: "cities",
					lazy: () =>
						import("./pages/CitiesPage/CitiesPage").then((m) => ({
							Component: m.default,
						})),
				},
				{
					path: "religions",
					lazy: () =>
						import("./pages/ReligionsPage/ReligionsPage").then((m) => ({
							Component: m.default,
						})),
				},
				// Viewing Pages
				{
					path: "export",
					lazy: () =>
						import("./pages/ExportPage/export").then((m) => ({
							Component: m.default,
						})),
				},
				// Viewing Pages
				{
					path: "view_city/:_id",
					lazy: () =>
						import("./pages/ViewingPages/city").then((m) => ({
							Component: m.default,
						})),
				},
				{
					path: "view_country/:_id",
					lazy: () =>
						import("./pages/ViewingPages/country").then((m) => ({
							Component: m.default,
						})),
				},
				{
					path: "view_religion/:_id",
					lazy: () =>
						import("./pages/ViewingPages/religion").then((m) => ({
							Component: m.default,
						})),
				},
			],
		},
	]);

	return <RouterProvider router={router} fallbackElement={<div />} />;
};

export default App;
