import React from "react";

const LazyAnalytics = React.lazy(() =>
	import("@vercel/analytics/react").then((m) => ({ default: m.Analytics })),
);

const LazySpeedInsights = React.lazy(() =>
	import("@vercel/speed-insights/next").then((m) => ({
		default: m.SpeedInsights,
	})),
);

/** Renders Vercel Analytics only in production. No-op in dev. */
export function ProdAnalytics() {
	if (!import.meta.env.PROD) return null;
	return (
		<React.Suspense fallback={null}>
			<LazyAnalytics />
			<LazySpeedInsights />
		</React.Suspense>
	);
}
