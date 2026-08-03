import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// Loads Terra-Logger's ambient AFMG type declarations into the project graph.
import "./definitions/AFMG";
import { refreshAncestryCatalog } from "./components/NPC/generator/ancestries/catalog";
import { refreshNPCAppearanceCatalog } from "./components/NPC/generator/appearance";
import { refreshGenderCatalog } from "./components/NPC/generator/genders";
import { refreshGovernmentDefinitionCatalog } from "./components/NPC/generator/governments";
import { refreshNamePoolCatalog } from "./components/NPC/generator/namePools";
import { refreshNPCProfessionCatalog } from "./components/NPC/generator/professions";
import { refreshNPCProfileGenerationCatalog } from "./components/NPC/generator/profile";
import { PreviousEraDialog } from "./components/HistoryGenerator/eras/PreviousEraDialog";
import { DBProvider } from "./db/DataContext";
import { initializeGeneratorCatalogs } from "./generators/defaults";
import "./index.css";

void initializeGeneratorCatalogs()
	.then(() =>
		Promise.all([
			refreshGovernmentDefinitionCatalog(),
			refreshGenderCatalog(),
			refreshAncestryCatalog(),
			refreshNamePoolCatalog(),
			refreshNPCProfessionCatalog(),
			refreshNPCAppearanceCatalog(),
			refreshNPCProfileGenerationCatalog(),
		]),
	)
	.catch((error: unknown) => {
		console.error("Failed to initialize generator catalogs.", error);
	});

const root = document.getElementById("root");
if (root) {
	ReactDOM.createRoot(root).render(
		<React.StrictMode>
			<DBProvider>
				<App />
				<PreviousEraDialog />
			</DBProvider>
		</React.StrictMode>,
	);
}
