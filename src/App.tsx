import { useEffect } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { useDB } from "./db/DataContext";

import type { MapInf } from "./definitions/TerraLogger";

import "./App.css";

const App = (): JSX.Element => {
	const { useActiveMap } = useDB();
	const activeMap = useActiveMap<MapInf>();

	// resize map
	// biome-ignore lint/correctness/useExhaustiveDependencies: needs to run on each map change
	useEffect(() => {
		if (!activeMap) return;
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
			const originalHeight = activeMap?.info.height;
			const originalWidth = activeMap?.info.width;

			// Scale the map to fit the new window dimensions
			if (mapElement) {
				if (viewBox) {
					// Set the new height and width of the map element
					mapElement.setAttribute("height", innerHeight as unknown as string);
					mapElement.setAttribute("width", innerWidth as unknown as string);

					// Set the new height and width of the viewBox element
					viewBox.setAttribute("height", innerHeight as unknown as string);
					viewBox.setAttribute("width", innerWidth as unknown as string);

					const sx = innerWidth / (originalWidth || 1);
					const sy = innerHeight / (originalHeight || 1);

					// optional: tidy decimals
					const fmt = (n: number) => (Number.isFinite(n) ? +n.toFixed(6) : 1);

					// Apply transformation to scale content
					viewBox.setAttribute("transform", `scale(${fmt(sx)} ${fmt(sy)})`);
				}
			}
		}

		window.addEventListener("resize", handleResize);
		// do an initial fit when map changes
		handleResize();
		return () => window.removeEventListener("resize", handleResize);
	}, [activeMap?.info.width, activeMap?.info.height]);

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
				{
					path: "notes",
					lazy: () =>
						import("./pages/Notes/Notes").then((m) => ({
							Component: m.default,
						})),
				},
				{
					path: "cultures",
					lazy: () =>
						import("./pages/CulturesPage/CulturesPage").then((m) => ({
							Component: m.default,
						})),
				},
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
				{
					path: "view_note/:_id",
					lazy: () =>
						import("./pages/ViewingPages/note").then((m) => ({
							Component: m.default,
						})),
				},
				{
					path: "view_culture/:_id",
					lazy: () =>
						import("./pages/ViewingPages/culture").then((m) => ({
							Component: m.default,
						})),
				},
			],
		},
	]);

	return <RouterProvider router={router} fallbackElement={<div />} />;
};

export default App;
