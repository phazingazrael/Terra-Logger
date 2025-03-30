import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Container,
	Box,
	Grid2 as Grid,
	Typography,
	Chip,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	Divider,
} from "@mui/material";
import { useEffect, useState } from "react";

import { getAllTags } from "../../components/Tags/Tags";

import { styled } from "@mui/material/styles";
// Styled components
const CategoryIcon = styled("span")({
	fontSize: "28px",
	marginRight: "12px",
});

interface TagData {
	_id: string;
	Name: string;
	Tags: TagItems[];
	Type: string;
}

interface TagItems {
	_id: string;
	Default: boolean;
	Description: string;
	Name: string;
	Type: string;
}

const tagsData: TagData[] = getAllTags();

const categoryIcons = {
	WorldOverview: "🌍",
	Maps: "🗺️",
	Characters: "👤",
	Technology: "⚙️",
	MagicSystem: "✨",
	ReligionsAndMythology: "🛐",
	Economy: "💰",
	Politics: "🏛️",
	TimeAndCalendar: "🗓️",
	CreaturesAndFlora: "🦄",
	Locations: "📍",
	CulturalArtifacts: "🏺",
	EducationAndKnowledge: "📚",
	EventsAndHistory: "📜",
	Miscellaneous: "🔍",
};

const formatCategoryName = (name: string) => {
	return name.replace(/([A-Z])/g, " $1").trim();
};

const Tags = () => {
	const [tagsList, setTagsList] = useState<TagData[] | undefined>();
	// Function to filter objects based on a specific tag _id
	useEffect(() => {
		setTagsList(tagsData);
	}, []);

	return (
		<Container>
			<div className="contentSubHead">
				<h3>All Tags</h3>
			</div>
			<div className="contentSubBody">
				<Grid container spacing={2}>
					{tagsList?.map((tag) => (
						<Grid size={4} key={tag._id}>
							<Accordion
								elevation={3}
								sx={{
									borderRadius: 2,
									"&:before": {
										display: "none",
									},
									transition: "transform 0.2s ease, box-shadow 0.2s ease",
									"&:hover": {
										transform: "translateY(-4px)",
										boxShadow: 6,
									},
								}}
							>
								<AccordionSummary
									expandIcon={<ExpandMoreIcon />}
									aria-controls={`panel-${tag._id}-content`}
									id={`panel-${tag._id}-header`}
									sx={{
										bgcolor: "grey.50",
										borderRadius: "8px 8px 0 0",
										minHeight: 64,
										"& .MuiAccordionSummary-content": {
											margin: "12px 0",
										},
									}}
								>
									<Box sx={{ display: "flex", alignItems: "center" }}>
										<CategoryIcon>
											{categoryIcons[tag.Name as keyof typeof categoryIcons] ||
												"📋"}
										</CategoryIcon>
										<Typography component="h3">
											{formatCategoryName(tag.Name)}
										</Typography>
										<Chip
											label={tag.Tags.length}
											size="small"
											sx={{
												ml: 1,
												bgcolor: "action.hover",
												fontSize: "0.75rem",
											}}
										/>
									</Box>
								</AccordionSummary>

								<AccordionDetails sx={{ p: 0 }}>
									<List disablePadding>
										{tag.Tags.map((tagItem, index) => (
											<div key={tagItem._id}>
												<ListItem disablePadding>
													<ListItemButton onClick={() => {}} sx={{ py: 1.5 }}>
														<ListItemText
															primary={tagItem.Name}
															secondary={tagItem.Description}
														/>
													</ListItemButton>
												</ListItem>
												{index < tag.Tags.length - 1 && <Divider />}
											</div>
										))}
									</List>
								</AccordionDetails>
							</Accordion>
						</Grid>
					))}
				</Grid>
			</div>
		</Container>
	);
};

export default Tags;
