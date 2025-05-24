import { Paper, styled } from "@mui/material";

export const ContentMain = styled(Paper)(({ theme }) => ({
	backgroundColor: "rgba(193, 197, 195, 0.6)",
	...theme.typography.body2,
	padding: theme.spacing(1),
	color: theme.palette.text.primary,
	overflow: "auto",
}));

export default ContentMain;
