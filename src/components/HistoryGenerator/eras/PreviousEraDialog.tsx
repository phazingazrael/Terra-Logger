import {
	Alert,
	Box,
	Button,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	Stack,
	TextField,
	Typography,
	useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useVirtualizer } from "@tanstack/react-virtual";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import type { PreviousEraInput } from "./model";
import {
	subscribeToPreviousEraDialog,
	type PreviousEraDialogRequest,
} from "./prompt";

type EraFormState = {
	name: string;
	shortName: string;
	duration: string;
	description: string;
};

type EraFormErrors = Partial<Record<keyof EraFormState, string>>;

function validate(form: EraFormState): {
	errors: EraFormErrors;
	input?: PreviousEraInput;
} {
	const errors: EraFormErrors = {};
	const name = form.name.trim();
	const shortName = form.shortName.trim();
	const duration = Number(form.duration);

	if (!name) errors.name = "Era name is required.";
	if (!shortName) errors.shortName = "A short name or abbreviation is required.";
	if (!Number.isSafeInteger(duration) || duration < 1) {
		errors.duration = "Duration must be a positive whole number of years.";
	}

	if (Object.keys(errors).length) return { errors };
	return {
		errors,
		input: {
			name,
			shortName,
			firstYear: 1,
			finalYear: duration,
			description: form.description.trim() || undefined,
		},
	};
}

const AffectedNPCList = memo(function AffectedNPCList({
	request,
}: Readonly<{ request: PreviousEraDialogRequest }>) {
	const scrollRef = useRef<HTMLDivElement>(null);
	const rowVirtualizer = useVirtualizer({
		count: request.drafts.length,
		getScrollElement: () => scrollRef.current,
		estimateSize: () => 37,
		overscan: 8,
		getItemKey: (index) => request.drafts[index]?.npcId ?? index,
	});

	return (
		<Box
			sx={{
				border: 1,
				borderColor: "divider",
				borderRadius: 1,
				backgroundColor: "background.paper",
				overflow: "hidden",
			}}
		>
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: "minmax(150px, 1fr) 72px 92px",
					columnGap: 2,
					alignItems: "center",
					px: 1.5,
					py: 0.75,
					backgroundColor: "background.paper",
					borderBottom: 1,
					borderColor: "divider",
				}}
			>
				<Typography variant="caption" fontWeight={700}>
					NPC
				</Typography>
				<Typography variant="caption" fontWeight={700} textAlign="right">
					Age
				</Typography>
				<Typography variant="caption" fontWeight={700} textAlign="right">
					Years before
				</Typography>
			</Box>
			<Box
				ref={scrollRef}
				role="list"
				aria-label="NPCs requiring a previous era"
				sx={{
					height: { xs: 180, sm: 220 },
					overflow: "auto",
					overscrollBehavior: "contain",
				}}
			>
				<Box
					sx={{
						height: rowVirtualizer.getTotalSize(),
						position: "relative",
						minWidth: 360,
					}}
				>
					{rowVirtualizer.getVirtualItems().map((virtualRow) => {
						const draft = request.drafts[virtualRow.index];
						if (!draft) return null;

						return (
							<Box
								key={virtualRow.key}
								role="listitem"
								data-index={virtualRow.index}
								ref={rowVirtualizer.measureElement}
								sx={{
									position: "absolute",
									top: 0,
									left: 0,
									width: "100%",
									transform: `translateY(${virtualRow.start}px)`,
									display: "grid",
									gridTemplateColumns: "minmax(150px, 1fr) 72px 92px",
									columnGap: 2,
									alignItems: "center",
									px: 1.5,
									py: 0.75,
									borderBottom: 1,
									borderColor: "divider",
								}}
							>
								<Typography variant="body2" noWrap title={draft.npcName}>
									{draft.npcName}
								</Typography>
								<Typography
									variant="body2"
									color="text.secondary"
									textAlign="right"
								>
									{draft.age}
								</Typography>
								<Typography
									variant="body2"
									color="text.secondary"
									textAlign="right"
								>
									{draft.yearsBeforeCurrentEra}
								</Typography>
							</Box>
						);
					})}
				</Box>
			</Box>
		</Box>
	);
});

export function PreviousEraDialog() {
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
	const [request, setRequest] = useState<PreviousEraDialogRequest>();
	const [errors, setErrors] = useState<EraFormErrors>({});
	const formKey = request?.id ?? "closed";
	const nameRef = useRef<HTMLInputElement>(null);
	const shortNameRef = useRef<HTMLInputElement>(null);
	const durationRef = useRef<HTMLInputElement>(null);
	const descriptionRef = useRef<HTMLTextAreaElement>(null);

	useEffect(
		() =>
			subscribeToPreviousEraDialog((nextRequest) => {
				setRequest((activeRequest) => {
					if (activeRequest && activeRequest.id !== nextRequest.id) {
						activeRequest.reject(
							new Error("Previous-era entry was replaced by another request."),
						);
					}
					return nextRequest;
				});
				setErrors({});
			}),
		[],
	);

	const birthOffsetRange = useMemo(() => {
		if (!request?.drafts.length) return undefined;

		let oldest = Number.POSITIVE_INFINITY;
		let newest = Number.NEGATIVE_INFINITY;
		for (const draft of request.drafts) {
			oldest = Math.min(oldest, draft.yearsBeforeCurrentEra);
			newest = Math.max(newest, draft.yearsBeforeCurrentEra);
		}

		return { oldest, newest };
	}, [request]);

	const close = () => {
		request?.reject(
			new Error("Previous-era details were cancelled by the user."),
		);
		setRequest(undefined);
		setErrors({});
	};

	const save = () => {
		if (!request) return;
		const form: EraFormState = {
			name: nameRef.current?.value ?? "",
			shortName: shortNameRef.current?.value ?? "",
			duration: durationRef.current?.value ?? "",
			description: descriptionRef.current?.value ?? "",
		};
		const result = validate(form);
		setErrors(result.errors);
		if (!result.input) return;
		request.resolve(result.input);
		setRequest(undefined);
		setErrors({});
	};

	const singular = request?.drafts.length === 1;

	return (
		<Dialog
			open={Boolean(request)}
			disableEscapeKeyDown
			fullWidth
			fullScreen={fullScreen}
			maxWidth="md"
			scroll="paper"
			aria-labelledby="previous-era-dialog-title"
			aria-describedby="previous-era-dialog-description"
			slotProps={{
				paper: {
					sx: fullScreen ? undefined : { maxHeight: "calc(100dvh - 48px)" },
				},
			}}
		>
			<DialogTitle id="previous-era-dialog-title">
				Previous Era Required
			</DialogTitle>
			<DialogContent dividers sx={{ overscrollBehavior: "contain" }}>
				{request ? (
					<Stack spacing={2} key={formKey}>
						<Alert severity="warning" id="previous-era-dialog-description">
							{singular
								? `${request.drafts[0]?.npcName} was born before the current era began. Provide the previous era details needed to place this NPC correctly.`
								: "The following NPCs were born before the current era began. Provide the previous era details needed to place them correctly."}
						</Alert>
						<Box>
							<Stack
								direction="row"
								alignItems="center"
								justifyContent="space-between"
								spacing={1}
								sx={{ mb: 0.75 }}
							>
								<Typography variant="subtitle2">
									Affected NPC{singular ? "" : "s"}
								</Typography>
								<Chip
									size="small"
									label={`${request.drafts.length.toLocaleString()} NPC${singular ? "" : "s"}`}
								/>
							</Stack>
							<AffectedNPCList request={request} />
						</Box>
						{birthOffsetRange ? (
							<Typography variant="body2" color="text.secondary">
								Unresolved births occurred{" "}
								{birthOffsetRange.oldest}
								{birthOffsetRange.oldest === birthOffsetRange.newest
									? " years before the current era."
									: ` to ${birthOffsetRange.newest} years before the current era.`}
							</Typography>
						) : null}
						<Divider />
						<TextField
							inputRef={nameRef}
							label="Era name"
							defaultValue=""
							error={Boolean(errors.name)}
							helperText={errors.name}
							autoFocus
							required
							fullWidth
						/>
						<TextField
							inputRef={shortNameRef}
							label="Short name / abbreviation"
							defaultValue=""
							error={Boolean(errors.shortName)}
							helperText={
								errors.shortName ??
								"Used in compact history labels, such as 481 PE."
							}
							required
							fullWidth
						/>
						<Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
							<TextField
								inputRef={durationRef}
								label="Duration (years)"
								type="number"
								defaultValue={request.defaultDuration}
								error={Boolean(errors.duration)}
								helperText={
									errors.duration ??
									"Years in this era, counted from 1."
								}
								required
								fullWidth
							/>
						</Stack>
						<TextField
							inputRef={descriptionRef}
							label="Description"
							defaultValue=""
							multiline
							minRows={3}
							fullWidth
							helperText="Optional context for future History Generator expansion."
						/>
					</Stack>
				) : null}
			</DialogContent>
			<DialogActions
				sx={{
					px: 3,
					py: 1.5,
					flexDirection: { xs: "column-reverse", sm: "row" },
					alignItems: "stretch",
					"& > :not(style) ~ :not(style)": {
						ml: { xs: 0, sm: 1 },
						mt: { xs: 1, sm: 0 },
					},
				}}
			>
				<Button onClick={close}>Cancel History Generation</Button>
				<Button onClick={save} variant="contained">
					Save Era and Continue
				</Button>
			</DialogActions>
		</Dialog>
	);
}
