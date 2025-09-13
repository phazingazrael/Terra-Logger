import { Container, Typography } from "@mui/material";

import "./AboutPage.css";
const AboutPage = () => {
	return (
		<Container className="aboutPage">
			<div className="contentSubBody">
				<section className="section tlAbout">
					<Typography variant="h5">About Terra-Logger's history</Typography>
					<p>
						Terra-Logger was first come up with in June of 2023.
						<br />I had been using Azgaar's Fantasy Map Generator for several
						years prior to this point to create and manage the World Map for my
						Table Top RPG Campaign.
					</p>
					<p>
						In May of 2023 I had learned about using Obsidian.md for Table Top
						RPG's and was immediately interested in using this method to manage
						my campaign and homebrew world, There was 1 major issue however, My
						world map contained over 700 cities! There was no way I was going to
						write that many documents by hand.
					</p>
					<p>
						Terra-Logger first started out as a command line utility to read an
						Exported .json file from Azgaar's Fantasy Map Generator and output
						basic markdown files for each Country and City.
					</p>
					<p>
						Soon I had made too many changes and fixes to it that I decided to
						restart from scratch, And I also decided that Terra-Logger would be
						useful for other people as well, thus I began working on the first
						proof of concept. Several times I redesigned the way it would look
						and work, and several times I changed my mind on how it would be
						accessible to others.
						<br />I had considered a few options:
						<ul>
							<li>
								"Self Hosted" - Creating some type of self hosted website for
								either use inside of a program such as an amp stack install
								(Apache, MySql, PHP)
							</li>
							<li>
								"Desktop Program" - Using ElectronJS to create a desktop program
							</li>
							<li>
								"Web Host" - Something that could be uploaded to a webhosting
								platform.
							</li>
						</ul>
						In the end I went with a Web Host solution. Currently code is hosted
						on Github with Vercel pulling and hosting the code for public
						access.
					</p>
				</section>
				<section className="section devAbout">
					<Typography variant="h5">About the Developer</Typography>
					<p>
						Hi there! I'm Phazingazrael, But I go by Phaze.
						<br />
						I'm a Hobbyist Web Developer and a Table Top RPG Enthusiast.
						<br />
						You can find me on{" "}
						<a
							target="_blank"
							rel="noreferrer"
							href="https://github.com/phazingazrael"
						>
							Github
						</a>{" "}
						as well as on{" "}
						<a
							target="_blank"
							rel="noreferrer"
							href="https://www.reddit.com/user/Phazingazrael/"
						>
							Reddit
						</a>
					</p>
					<p>
						<Typography variant="h6">A little bit about me</Typography>
						<br />I picked up Web Development a long, long time ago, Probably
						around 23 years ago.
						<br />I was in Middle School / Junior High School at the time and
						found the thought of making my own websites to be a lot fun.
						<br /> In High School I got even more into it and ended up taking a
						class through our "Applied Technologies Center" for it, although I
						ended up never learning anything new in that class, I did end up
						participating in a few educational competitions because of it.
					</p>
					<p>
						For a brief time after high school I had an internship at a local
						Media Production company assisting in building and maintaining their
						website among other responsibilities.
					</p>
					<p>
						<Typography variant="h6">My Hobbies</Typography>I have a Lot of
						hobbies, And most of them are pretty nerdy!
						<ul>
							<li>Programming / Web Development</li>
							<li>Table Top RPG's</li>
							<li>Video Games</li>
							<ul>
								<li>Minecraft</li>
								<li>Pokemon</li>
								<li>Oxygen Not Included</li>
								<li>Satisfactory</li>
							</ul>
							<li>Reading / Audiobooks</li>
							<li>Longboarding, albeit more "street surfing"</li>
							<li>So much more than I can list here</li>
						</ul>
					</p>
				</section>
				<section className="section credits">
					<Typography variant="h5">Credits and Acknowledgments</Typography>
					<p>
						We would like to express our gratitude to the developers of{" "}
						<a
							target="_blank"
							rel="noreferrer"
							href="https://github.com/Azgaar/Fantasy-Map-Generator"
						>
							Azgaar's Fantasy Map Generator
						</a>{" "}
						for their fantastic tool, which inspired and provided the foundation
						for Terra-Logger.
					</p>
					<p>
						We would like to express our gratitude to{" "}
						<a
							target="_blank"
							rel="noreferrer"
							href="https://github.com/Shuggaloaf/"
						>
							Shuggaloaf
						</a>{" "}
						for their{" "}
						<a
							target="_blank"
							rel="noreferrer"
							href="https://github.com/Shuggaloaf/Simple_NPC_Generator/"
						>
							System Agnostic RPG NPC Generator
						</a>
						. Currently needs to be implemented in basic format to provide basic
						npc data when loading map. Will be extended with customization
						later.
					</p>
					<p>
						We would like to express our gratitude to{" "}
						<a
							target="_blank"
							rel="noreferrer"
							href="https://www.reddit.com/user/Osellic/"
						>
							u/Oselic
						</a>{" "}
						for their work on{" "}
						<a
							target="_blank"
							rel="noreferrer"
							href="https://www.reddit.com/r/worldbuilding/comments/9ugp4r/hey_squad_so_ive_got_an_idea_for_easy_world/"
						>
							This
						</a>
						.
					</p>
					<p>
						We would like to express our gratitude to Lythande for their work on{" "}
						<a
							target="_blank"
							rel="noreferrer"
							href="https://docs.google.com/spreadsheets/d/1QbuVTfTYSczRJIRbffGPDhv6jEMxoa-RyIgi1ityV8U/edit#gid=560919452"
						>
							This
						</a>
						.
					</p>
				</section>
			</div>
		</Container>
	);
};

export default AboutPage;
