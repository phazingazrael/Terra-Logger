import { useEffect, useState } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { useDB } from "./db/DataContext";
import { useDeviceType } from "./hooks/useDeviceType";
import { getDataFromStore } from "./db/interactions";
import Package from "../package.json";

import MobileLayout from "./layouts/MobileLayout";

import type { MapInf } from "./definitions/TerraLogger";
import type { AppInfo } from "./definitions/AppInfo";

import "./App.css";
import { BookLoader, handleSvgReplace } from "./components/Util";

const App = (): JSX.Element => {
	const { useActiveMap } = useDB();
	const activeMap = useActiveMap<MapInf>();

	// load appSettings from IndexedDB so we can check forceMobile
	const [appSettings, setAppSettings] = useState<AppInfo | null>(null);
	const [settingsLoaded, setSettingsLoaded] = useState(false);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const id = `TL_${Package.version}`;
				const settings = (await getDataFromStore(
					"appSettings",
					id,
				)) as AppInfo | null;
				if (!cancelled) setAppSettings(settings ?? null);
			} catch (e) {
				console.error("Failed to load appSettings:", e);
				if (!cancelled) setAppSettings(null);
			} finally {
				if (!cancelled) setSettingsLoaded(true);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	// detect device once per render
	const device = useDeviceType();
	const isHandheld = device === "phone" || device === "tablet";

	// resize map
	// biome-ignore lint/correctness/useExhaustiveDependencies: needs to run on each map change
	useEffect(() => {
		if (!activeMap) return;

		if (activeMap.SVG && activeMap.SVG !== "") {
			handleSvgReplace({
				svg: activeMap.SVG,
				height: activeMap.info.height,
				width: activeMap.info.width,
			});
		}

		function handleResize() {
			const { innerHeight, innerWidth } = window;

			const mapElement = document.getElementById("map");
			const viewBox = document.getElementById("viewbox");

			const originalHeight = activeMap?.info.height;
			const originalWidth = activeMap?.info.width;

			if (mapElement && viewBox) {
				mapElement.setAttribute("height", innerHeight as unknown as string);
				mapElement.setAttribute("width", innerWidth as unknown as string);

				viewBox.setAttribute("height", innerHeight as unknown as string);
				viewBox.setAttribute("width", innerWidth as unknown as string);

				const sx = innerWidth / (originalWidth || 1);
				const sy = innerHeight / (originalHeight || 1);

				const fmt = (n: number) => (Number.isFinite(n) ? +n.toFixed(6) : 1);
				viewBox.setAttribute("transform", `scale(${fmt(sx)} ${fmt(sy)})`);
			}
		}

		window.addEventListener("resize", handleResize);
		handleResize();
		return () => window.removeEventListener("resize", handleResize);
	}, [activeMap?.SVG, activeMap?.info.width, activeMap?.info.height]);

	// avoid layout flash while classifying device or loading settings
	if (device === "unknown" || !settingsLoaded) return <BookLoader />;

	const router = createBrowserRouter([
		{
			path: "/",
			async lazy() {
				const [{ default: MainLayout }, { default: ErrorBoundary }] =
					await Promise.all([
						import("./layouts/MainLayout"),
						import("./pages/ErrorPage/ErrorPage"),
					]);
				return { Component: MainLayout, ErrorBoundary };
			},
			children: [
				{
					index: true,
					lazy: () =>
						import("./pages/HomePage/HomePage").then((m) => ({
							Component: m.default,
						})),
				},
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
				{
					path: "about",
					lazy: () =>
						import("./pages/AboutPage/AboutPage").then((m) => ({
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

	if (isHandheld) {
		if (appSettings?.forceMobile !== true) {
			return <MobileLayout />;
		}
	}
	return <RouterProvider router={router} fallbackElement={<div />} />;
};

export default App;
