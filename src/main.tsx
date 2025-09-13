import React from "react";
import ReactDOM from "react-dom/client";
import { DBProvider } from "./db/DataContext";
import App from "./App.tsx";
import "./index.css";

const root = document.getElementById("root");
if (root) {
	ReactDOM.createRoot(root).render(
		<React.StrictMode>
			<DBProvider>
				<App />
			</DBProvider>
		</React.StrictMode>,
	);
}
