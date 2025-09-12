import React from "react";
import ReactDOM from "react-dom/client";
import { RecoilRoot } from "recoil";
import { DBProvider } from "./db/DataContext";
import App from "./App.tsx";
import "./index.css";

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const root = document.getElementById("root")!;

ReactDOM.createRoot(root).render(
	<React.StrictMode>
		<DBProvider>
			<RecoilRoot>
				<App />
			</RecoilRoot>
		</DBProvider>
	</React.StrictMode>,
);
