import { Container, Grid, Card, CardContent, Typography, Avatar, Paper } from '@mui/material';
import { MdTerrain, MdBook, MdPeople, MdEvent } from 'react-icons/md';

const Overview = () => {
    return (
        <Container>
            <div className="contentSubHead">
                <h3 className="">Overview</h3>
            </div>
            <div className="contentSubBody">
                <Grid container spacing={3}>
                    {/* Tile 1: World Overview */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Card component={Paper} elevation={3}>
                            <CardContent>
                                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                                    <MdTerrain fontSize="large" />
                                </Avatar>
                                <Typography variant="h6" sx={{ mt: 2 }}>
                                    World Overview
                                </Typography>
                                <Typography variant="subtitle2" sx={{ mt: 1 }}>
                                    Total Landscapes: 120
                                </Typography>
                                <Typography variant="subtitle2">Active Regions: 80</Typography>
                                <Typography variant="subtitle2">Resources: 500</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Tile 2: Blog Posts */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Card component={Paper} elevation={3}>
                            <CardContent>
                                <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                                    <MdBook fontSize="large" />
                                </Avatar>
                                <Typography variant="h6" sx={{ mt: 2 }}>
                                    Blog Posts
                                </Typography>
                                <Typography variant="subtitle2" sx={{ mt: 1 }}>
                                    Published Articles: 300
                                </Typography>
                                <Typography variant="subtitle2">Categories: 15</Typography>
                                <Typography variant="subtitle2">Comments: 1200</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Tile 3: Community */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Card component={Paper} elevation={3}>
                            <CardContent>
                                <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56 }}>
                                    <MdPeople fontSize="large" />
                                </Avatar>
                                <Typography variant="h6" sx={{ mt: 2 }}>
                                    Community
                                </Typography>
                                <Typography variant="subtitle2" sx={{ mt: 1 }}>
                                    Total Users: 5000
                                </Typography>
                                <Typography variant="subtitle2">Active Creators: 800</Typography>
                                <Typography variant="subtitle2">Roles: 5</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Tile 4: Events */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Card component={Paper} elevation={3}>
                            <CardContent>
                                <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                                    <MdEvent fontSize="large" />
                                </Avatar>
                                <Typography variant="h6" sx={{ mt: 2 }}>
                                    Events
                                </Typography>
                                <Typography variant="subtitle2" sx={{ mt: 1 }}>
                                    Total Events: 50
                                </Typography>
                                <Typography variant="subtitle2">Upcoming: 10</Typography>
                                <Typography variant="subtitle2">Registrations: 200</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Tile 5: User Analytics with Bar Graph */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Card component={Paper} elevation={3}>
                            <CardContent>
                                {/*bar graph here*/}
                                <Typography variant="h6" sx={{ mt: 2 }}>
                                    User Analytics
                                </Typography>
                                <Typography variant="subtitle2" sx={{ mt: 1 }}>
                                    New Users Today: 150
                                </Typography>
                                <Typography variant="subtitle2">Active Users: 3500</Typography>
                                <Typography variant="subtitle2">Total Signups: 20,000</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Tile 6: Revenue Overview with Pie Chart */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Card component={Paper} elevation={3}>
                            <CardContent>
                                {/*pie graph here*/}
                                <Typography variant="h6" sx={{ mt: 2 }}>
                                    Revenue Overview
                                </Typography>
                                <Typography variant="subtitle2" sx={{ mt: 1 }}>
                                    Total Revenue: $250,000
                                </Typography>
                                <Typography variant="subtitle2">This Month: $35,000</Typography>
                                <Typography variant="subtitle2">Top Product: XYZ Widget</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Tile 7: Security Metrics with Bar Graph */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Card component={Paper} elevation={3}>
                            <CardContent>
                                {/*bar graph here*/}
                                <Typography variant="h6" sx={{ mt: 2 }}>
                                    Security Metrics
                                </Typography>
                                <Typography variant="subtitle2" sx={{ mt: 1 }}>
                                    Threats Detected: 5
                                </Typography>
                                <Typography variant="subtitle2">Security Updates: 10</Typography>
                                <Typography variant="subtitle2">Last Audit: 2 weeks ago</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Tile 8: Content Management with Pie Chart */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Card component={Paper} elevation={3}>
                            <CardContent>
                                {/*pie graph here*/}
                                <Typography variant="h6" sx={{ mt: 2 }}>
                                    Content Management
                                </Typography>
                                <Typography variant="subtitle2" sx={{ mt: 1 }}>
                                    Published Articles: 300
                                </Typography>
                                <Typography variant="subtitle2">Pending Reviews: 15</Typography>
                                <Typography variant="subtitle2">Drafts: 50</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </div>
        </Container>
    );
};

export default Overview;
