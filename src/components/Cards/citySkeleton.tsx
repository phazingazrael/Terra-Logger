import {
	Card,
	CardActions,
	CardContent,
	Chip,
	Skeleton,
	Avatar,
	Box,
} from "@mui/material";

import "./cards.css";

function CityCardSkeleton() {
	return (
		<Card
			sx={{
				height: "100%",
				display: "flex",
				flexDirection: "column",
				transition: "transform 0.2s ease, box-shadow 0.2s ease",
				"&:hover": {
					transform: "translateY(-4px)",
					boxShadow: 6,
				},
				position: "relative",
				overflow: "visible",
			}}
		>
			{/* City CoA */}
			<Avatar
				sx={{
					position: "absolute",
					top: -10,
					right: 16,
					boxShadow: 2,
					width: 75,
					height: 75,
				}}
				variant="rounded"
			>
				<Skeleton variant="rounded" width="100%" height="100%" />
			</Avatar>
			{/* City Details */}
			<CardContent sx={{ flexGrow: 1, pt: 3 }}>
				{/* City Name */}
				<Box
					sx={{
						mb: 2,
					}}
				>
					<Skeleton variant="rounded" width={120} height={30} />
				</Box>

				{/* City Detail Chips */}
				<Box
					sx={{
						display: "flex",
						gap: 1,
						mb: 2,
						flexWrap: "wrap",
						mt: 3,
					}}
				>
					<Skeleton variant="rounded" width={50} height={15} />
					<Skeleton variant="rounded" width={50} height={15} />
					<Skeleton variant="rounded" width={50} height={15} />
				</Box>

				{/* City Population */}
				<Skeleton variant="rounded" width={210} height={60} />
			</CardContent>
			<CardActions className="tile-info">
				<Skeleton>
					<Chip label={`TagSkele`} size="small" />
				</Skeleton>
				<Skeleton>
					<Chip label={`TagSkele`} size="small" />
				</Skeleton>

				<Skeleton variant="rounded" width={100} height={40} />
			</CardActions>
		</Card>
	);
}
export default CityCardSkeleton;
