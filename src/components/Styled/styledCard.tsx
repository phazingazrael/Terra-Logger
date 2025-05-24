import { Card } from "@mui/material";
import { styled } from "@mui/material/styles";

export const StyledCard = styled(Card)(({ theme }) => ({
	height: "100%",
	display: "flex",
	flexDirection: "column",
	transition: "transform 0.2s ease, box-shadow 0.2s ease",
	"&:hover": {
		transform: "translateY(-4px)",
		boxShadow: theme.shadows[6],
	},
	position: "relative",
	overflow: "visible",
}));

export default StyledCard;
