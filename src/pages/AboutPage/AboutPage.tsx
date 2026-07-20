import {
	Card,
	CardContent,
	Container,
	Divider,
	Link,
	Stack,
	Typography,
} from "@mui/material";
import { GithubLogo, RedditLogo } from "@phosphor-icons/react";

import "./AboutPage.css";

const AboutPage = () => {
	return (
		<Container className="aboutPage">
			<section className="section tlAbout aboutHero">
				<Typography variant="h3" component="h1">
					About Terra-Logger
				</Typography>

				<Typography variant="body1" className="aboutHeroText">
					Terra-Logger is a worldbuilding utility built around Azgaar Fantasy
					Map Generator data. It helps turn generated map data into editable,
					exportable campaign documentation for Markdown and Obsidian workflows.
				</Typography>
			</section>

			<section className="aboutGrid">
				<Card className="aboutCard">
					<CardContent>
						<Typography variant="h5" component="h2">
							Why it exists
						</Typography>

						<Typography variant="body2" color="text.secondary">
							Terra-Logger started from a tabletop RPG problem: managing a world
							map with hundreds of cities without hand-writing every document.
						</Typography>

						<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
							The first version was a command-line utility that converted Azgaar
							exports into basic Markdown. It later became a hosted web app so
							the workflow could be more visual, editable, and useful to other
							worldbuilders.
						</Typography>
					</CardContent>
				</Card>

				<Card className="aboutCard">
					<CardContent>
						<Typography variant="h5" component="h2">
							Project direction
						</Typography>

						<ul className="aboutList">
							<li>
								Import and update Azgaar <code>.map</code> files.
							</li>
							<li>Create editable Atlas pages for world entities.</li>
							<li>
								Support pre-export editing instead of raw generated output only.
							</li>
							<li>Export Markdown and Obsidian-ready vault structures.</li>
							<li>
								Keep templates flexible instead of forcing one campaign style.
							</li>
						</ul>
					</CardContent>
				</Card>

				<Card className="aboutCard aboutDeveloperCard">
					<CardContent>
						<Typography variant="h5" component="h2">
							About the developer
						</Typography>

						<Typography variant="body2" color="text.secondary">
							Terra-Logger is built by Phazingazrael / Phaze, a hobbyist web
							developer and tabletop RPG enthusiast.
						</Typography>

						<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
							The project combines long-running interests in web development,
							worldbuilding, tabletop RPGs, and tools that make large creative
							projects easier to maintain.
						</Typography>

						<Stack
							direction="row"
							spacing={1.5}
							flexWrap="wrap"
							useFlexGap
							sx={{ mt: 2 }}
						>
							<Link
								className="socialBadge socialBadgeGithub"
								target="_blank"
								rel="noreferrer"
								href="https://github.com/phazingazrael"
								underline="none"
							>
								<GithubLogo size={20} weight="fill" />
								<span>GitHub</span>
							</Link>

							<Link
								className="socialBadge socialBadgeReddit"
								target="_blank"
								rel="noreferrer"
								href="https://www.reddit.com/user/Phazingazrael/"
								underline="none"
							>
								<RedditLogo size={20} weight="fill" />
								<span>Reddit</span>
							</Link>
						</Stack>
					</CardContent>
				</Card>

				<Card className="aboutCard aboutCreditsCard">
					<CardContent>
						<Typography variant="h5" component="h2">
							Credits and acknowledgments
						</Typography>

						<Typography variant="body2" color="text.secondary">
							Terra-Logger exists because of the tools, resources, and community
							ideas that came before it.
						</Typography>

						<Divider sx={{ my: 2 }} />

						<ul className="aboutList">
							<li>
								<Link
									target="_blank"
									rel="noreferrer"
									href="https://github.com/Azgaar/Fantasy-Map-Generator"
								>
									Azgaar&apos;s Fantasy Map Generator
								</Link>{" "}
								for the map generator Terra-Logger is built around.
							</li>

							<li>
								<Link
									target="_blank"
									rel="noreferrer"
									href="https://github.com/Shuggaloaf/Simple_NPC_Generator/"
								>
									Shuggaloaf&apos;s System Agnostic RPG NPC Generator
								</Link>{" "}
								for future NPC generation direction.
							</li>

							<li>
								<Link
									target="_blank"
									rel="noreferrer"
									href="https://www.reddit.com/r/worldbuilding/comments/9ugp4r/hey_squad_so_ive_got_an_idea_for_easy_world/"
								>
									u/Osellic&apos;s worldbuilding resource
								</Link>{" "}
								for community worldbuilding inspiration.
							</li>

							<li>
								Lythande&apos;s shared worldbuilding spreadsheet resources.
							</li>
						</ul>
					</CardContent>
				</Card>
			</section>
		</Container>
	);
};

export default AboutPage;
