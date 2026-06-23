import { useEffect, useMemo, useRef, useState } from "react";
import type { AtlasEditorContext } from "../../../../definitions/Atlas";
import type { TLCity, TLCountry } from "../../../../definitions/TerraLogger";
import { Button } from "@mui/material";

const COUNTRY_CITIES_PATH = "cities";

export function CountryCitiesMembershipEditor({
	context,
}: {
	context: AtlasEditorContext;
}) {
	const country = context.entity as TLCountry;
	const countryKey = getCountryKey(country);
	const hasHydratedCountryCities = useRef<string | null>(null);
	const [selectedCityKey, setSelectedCityKey] = useState("");

	const relatedCities = useMemo(
		() => normalizeCityList(context.related?.cities ?? []),
		[context.related?.cities],
	);

	const embeddedCities = useMemo(
		() => normalizeCityList((country as { cities?: unknown }).cities),
		[country],
	);

	const relatedAssignedCities = useMemo(
		() => relatedCities.filter((city) => cityBelongsToCountry(city, country)),
		[relatedCities, country],
	);

	useEffect(() => {
		if (hasHydratedCountryCities.current === countryKey) return;

		hasHydratedCountryCities.current = countryKey;

		if (embeddedCities.length > 0) return;
		if (relatedAssignedCities.length === 0) return;

		context.onEntityFieldChange({
			path: COUNTRY_CITIES_PATH,
			value: relatedAssignedCities,
		});
	}, [context, countryKey, embeddedCities.length, relatedAssignedCities]);

	const currentCities = embeddedCities;

	const currentCityKeys = useMemo(
		() => new Set(currentCities.map(getCityKey).filter(Boolean)),
		[currentCities],
	);

	const unassignedCities = useMemo(
		() =>
			relatedCities
				.filter((city) => !currentCityKeys.has(getCityKey(city)))
				.filter(cityHasNoCountry)
				.sort((a, b) =>
					getCityDisplayName(a).localeCompare(getCityDisplayName(b)),
				),
		[relatedCities, currentCityKeys],
	);

	function setCountryCities(nextCities: TLCity[]) {
		context.onEntityFieldChange({
			path: COUNTRY_CITIES_PATH,
			value: nextCities,
		});
	}

	function queueCityUpdate(city: TLCity) {
		const key = getCityKey(city);

		if (!key) return;

		context.onRelatedUpdate({
			action: "update",
			store: "cities",
			key,
			value: city,
		});
	}

	function addSelectedCity() {
		const selectedCity = relatedCities.find(
			(city) => getCityKey(city) === selectedCityKey,
		);

		if (!selectedCity) return;

		const updatedCity = assignCityToCountry(selectedCity, country);

		queueCityUpdate(updatedCity);

		setCountryCities(mergeCitiesByKey([...currentCities, updatedCity]));

		setSelectedCityKey("");
	}

	function removeCity(cityToRemove: TLCity) {
		const cityKey = getCityKey(cityToRemove);
		const sourceCity =
			relatedCities.find((city) => getCityKey(city) === cityKey) ??
			cityToRemove;

		const updatedCity = removeCityCountry(sourceCity);

		queueCityUpdate(updatedCity);

		setCountryCities(
			currentCities.filter((city) => getCityKey(city) !== cityKey),
		);
	}

	return (
		<div className="atlas-country-cities-editor">
			<div className="atlas-country-cities-editor__header-wrapper">
				<div className="atlas-country-cities-editor__header">
					<div>
						<strong>Cities</strong>
						<span>
							{currentCities.length} assigned cit
							{currentCities.length === 1 ? "y" : "ies"}
						</span>
					</div>
				</div>

				{unassignedCities.length > 0 ? (
					<div className="atlas-country-cities-add">
						<strong>Add existing unassigned city</strong>

						<div className="atlas-country-cities-add__controls">
							<select
								value={selectedCityKey}
								onChange={(event) => setSelectedCityKey(event.target.value)}
							>
								<option value="">Select city...</option>

								{unassignedCities.map((city) => {
									const key = getCityKey(city);

									return (
										<option key={key} value={key}>
											{getCityDisplayName(city)}
										</option>
									);
								})}
							</select>

							<Button
								variant="outlined"
								type="button"
								disabled={!selectedCityKey}
								onClick={addSelectedCity}
							>
								Add to country
							</Button>
						</div>

						<p className="atlas-muted">
							Only existing unassigned cities are shown here. This editor never
							creates new cities.
						</p>
					</div>
				) : null}
			</div>

			<section className="atlas-country-cities-list">
				<strong>
					{`Assigned Cit${currentCities.length === 1 ? "y" : "ies"}`}
				</strong>

				{currentCities.length > 0 ? (
					<div className="atlas-country-city-list">
						{currentCities
							.slice()
							.sort((a, b) =>
								getCityDisplayName(a).localeCompare(getCityDisplayName(b)),
							)
							.map((city) => (
								<CountryCityMembershipRow
									key={getCityKey(city)}
									city={city}
									onRemove={() => removeCity(city)}
								/>
							))}
					</div>
				) : (
					<p className="atlas-muted">
						No cities are currently assigned to this country.
					</p>
				)}
			</section>
		</div>
	);
}

function CountryCityMembershipRow({
	city,
	onRemove,
}: {
	city: TLCity;
	onRemove: () => void;
}) {
	return (
		<article className="atlas-country-city-row">
			<div>
				<strong>{getCityDisplayName(city)}</strong>
				<span>{getCityMetaLabel(city)}</span>
			</div>

			<Button
				size="small"
				variant="outlined"
				color="error"
				type="button"
				onClick={onRemove}
			>
				Remove
			</Button>
		</article>
	);
}

function normalizeCityList(value: unknown): TLCity[] {
	if (!Array.isArray(value)) return [];

	return value.filter((city): city is TLCity => {
		return Boolean(city) && typeof city === "object";
	});
}

function assignCityToCountry(city: TLCity, country: TLCountry): TLCity {
	return {
		...city,
		country: createCityCountryRef(country),
	};
}

function removeCityCountry(city: TLCity): TLCity {
	return {
		...city,
		country: createEmptyCityCountryRef(),
	};
}

function createCityCountryRef(country: TLCountry): TLCity["country"] {
	const record = country as Record<string, unknown>;

	return {
		_id: String(record._id ?? ""),
		id: toNumber(record.id),
		name: String(record.name ?? ""),
		nameFull: String(record.nameFull ?? ""),
		govForm: String(record.govForm ?? ""),
		govName: String(record.govName ?? ""),
	};
}

function createEmptyCityCountryRef(): TLCity["country"] {
	return {
		_id: "",
		id: 0,
		name: "",
		nameFull: "",
		govForm: "",
		govName: "",
	};
}

function toNumber(value: unknown): number {
	if (typeof value === "number" && Number.isFinite(value)) return value;

	if (typeof value === "string") {
		const parsed = Number(value);

		return Number.isFinite(parsed) ? parsed : 0;
	}

	return 0;
}

function cityHasNoCountry(city: TLCity): boolean {
	const country = (city as { country?: unknown }).country;

	if (!country) return true;

	if (typeof country === "string") {
		return !country.trim();
	}

	if (typeof country !== "object") return false;

	const record = country as Record<string, unknown>;

	return ![
		record._id,
		record.id,
		record.name,
		record.nameFull,
		record.govName,
	].some((value) => typeof value === "string" && value.trim());
}

function cityBelongsToCountry(city: TLCity, country: TLCountry): boolean {
	const cityCountry = (city as { country?: unknown }).country;

	if (!cityCountry || typeof cityCountry !== "object") return false;

	const countryRecord = country as Record<string, unknown>;
	const cityCountryRecord = cityCountry as Record<string, unknown>;

	return (
		valuesMatch(cityCountryRecord._id, countryRecord._id) ||
		valuesMatch(cityCountryRecord.id, countryRecord.id) ||
		valuesMatch(cityCountryRecord.name, countryRecord.name) ||
		valuesMatch(cityCountryRecord.nameFull, countryRecord.nameFull) ||
		valuesMatch(cityCountryRecord.govName, countryRecord.govName)
	);
}

function valuesMatch(left: unknown, right: unknown): boolean {
	const leftValue = String(left ?? "").trim();
	const rightValue = String(right ?? "").trim();

	return Boolean(leftValue && rightValue && leftValue === rightValue);
}

function mergeCitiesByKey(cities: TLCity[]): TLCity[] {
	const output: TLCity[] = [];
	const seen = new Set<string>();

	for (const city of cities) {
		const key = getCityKey(city);

		if (!key) continue;
		if (seen.has(key)) continue;

		seen.add(key);
		output.push(city);
	}

	return output;
}

function getCountryKey(country: TLCountry): string {
	const record = country as Record<string, unknown>;

	return String(record._id ?? record.id ?? record.name ?? "country");
}

function getCityKey(city: TLCity): string {
	const record = city as Record<string, unknown>;

	return String(record._id ?? record.id ?? record.name ?? "");
}

function getCityDisplayName(city: TLCity): string {
	const record = city as Record<string, unknown>;

	return String(
		record.nameFull ?? record.fullName ?? record.name ?? "Unnamed city",
	);
}

function getCityMetaLabel(city: TLCity): string {
	const record = city as Record<string, unknown>;
	const parts = [record.type, record.size]
		.map((value) => String(value ?? "").trim())
		.filter(Boolean);

	return parts.join(" · ");
}
