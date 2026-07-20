import React from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const LazyAnalytics = React.lazy(() =>
	import("@vercel/analytics/react").then((m) => ({ default: m.Analytics })),
);

/** Renders Vercel Analytics only in production. No-op in dev. */
export function ProdAnalytics() {
	if (!import.meta.env.PROD) return null;
	return (
		<React.Suspense fallback={null}>
			<LazyAnalytics />
			<SpeedInsights />
		</React.Suspense>
	);
}
