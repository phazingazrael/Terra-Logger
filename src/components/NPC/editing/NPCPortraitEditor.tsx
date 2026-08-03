import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useRef, useState } from "react";
import type { NPCPortrait } from "../../../definitions/TerraLogger";

const MAX_PORTRAIT_BYTES = 8 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
	"image/png",
	"image/jpeg",
	"image/webp",
	"image/gif",
];

function readImageAsDataUrl(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () =>
			typeof reader.result === "string"
				? resolve(reader.result)
				: reject(new Error("Image could not be read."));
		reader.onerror = () =>
			reject(reader.error ?? new Error("Image could not be read."));
		reader.readAsDataURL(file);
	});
}

export function NPCPortraitEditor({
	portrait,
	onSave,
}: {
	portrait: NPCPortrait;
	onSave: (portrait: NPCPortrait) => Promise<void>;
}) {
	const [url, setUrl] = useState(portrait.kind === "url" ? portrait.value : "");
	const [pendingUpload, setPendingUpload] = useState<Extract<
		NPCPortrait,
		{ kind: "uploaded" }
	> | null>(portrait.kind === "uploaded" ? portrait : null);
	const [error, setError] = useState("");
	const [saving, setSaving] = useState(false);
	const fileInput = useRef<HTMLInputElement>(null);

	async function chooseFile(file?: File) {
		if (!file) return;
		if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
			setError("Choose a PNG, JPEG, WebP, or GIF image.");
			return;
		}
		if (file.size > MAX_PORTRAIT_BYTES) {
			setError("Portrait images must be 8 MB or smaller.");
			return;
		}
		try {
			const data = await readImageAsDataUrl(file);
			setPendingUpload({
				kind: "uploaded",
				data,
				mimeType: file.type,
				originalFileName: file.name,
			});
			setUrl("");
			setError("");
		} catch (cause) {
			setError(
				cause instanceof Error ? cause.message : "Image could not be read.",
			);
		}
	}

	async function save(next: NPCPortrait) {
		setSaving(true);
		try {
			await onSave(next);
		} finally {
			setSaving(false);
		}
	}

	return (
		<Box sx={{ p: 2, border: 1, borderColor: "divider", borderRadius: 1 }}>
			<Stack spacing={2}>
				<input
					ref={fileInput}
					hidden
					type="file"
					accept={ACCEPTED_IMAGE_TYPES.join(",")}
					onChange={(event) => void chooseFile(event.target.files?.[0])}
				/>
				<Button variant="outlined" onClick={() => fileInput.current?.click()}>
					Upload Image
				</Button>
				{pendingUpload ? (
					<Typography variant="body2">
						Selected: {pendingUpload.originalFileName || pendingUpload.mimeType}
					</Typography>
				) : null}
				<Typography variant="body2" color="text.secondary">
					or
				</Typography>
				<TextField
					label="Image URL"
					value={url}
					onChange={(event) => {
						setUrl(event.target.value);
						setPendingUpload(null);
					}}
					placeholder="https://example.com/portrait.png"
				/>
				{error ? (
					<Typography color="error" variant="body2">
						{error}
					</Typography>
				) : null}
				<Stack direction="row" spacing={1} flexWrap="wrap">
					<Button
						variant="contained"
						disabled={saving || (!pendingUpload && !url.trim())}
						onClick={() =>
							void save(pendingUpload ?? { kind: "url", value: url.trim() })
						}
					>
						{saving ? "Saving..." : "Save Portrait"}
					</Button>
					<Button
						disabled={saving}
						onClick={() => void save({ kind: "placeholder" })}
					>
						Use Default Placeholder
					</Button>
				</Stack>
			</Stack>
		</Box>
	);
}
