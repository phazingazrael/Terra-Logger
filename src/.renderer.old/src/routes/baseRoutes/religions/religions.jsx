import { Unstable_Grid2 as Grid, Button, Container } from '@mui/material'

import './religions.css';

const Religions = () => {
  return (
    <Container>
      <h3 className='text-2xl font-semibold'>All Religions</h3>
      <Grid container spacing={2}>
        <Grid xs={3}>
          <div className="religion-container">
            <div className="religion-content">
              <h2 className="religion-name">Category Name</h2>
              <p className="religion-description">Category Description...</p>
              <div className="religion-info">
                <span className="religion-posts">Number of Posts</span>
                <Button className="religion-button">View Posts</Button>
              </div>
            </div>
          </div>
        </Grid>

        <Grid xs={3}>
          <div className="religion-container">
            <div className="religion-content">
              <h2 className="religion-name">Category Name</h2>
              <p className="religion-description">Category Description...</p>
              <div className="religion-info">
                <span className="religion-posts">Number of Posts</span>
                <Button className="religion-button">View Posts</Button>
              </div>
            </div>
          </div>
        </Grid>
        <Grid xs={3}>
          <div className="religion-container">
            <div className="religion-content">
              <h2 className="religion-name">Category Name</h2>
              <p className="religion-description">Category Description...</p>
              <div className="religion-info">
                <span className="religion-posts">Number of Posts</span>
                <Button className="religion-button">View Posts</Button>
              </div>
            </div>
          </div>
        </Grid>
        <Grid xs={3}>
          <div className="religion-container">
            <div className="religion-content">
              <h2 className="religion-name">Category Name</h2>
              <p className="religion-description">Category Description...</p>
              <div className="religion-info">
                <span className="religion-posts">Number of Posts</span>
                <Button className="religion-button">View Posts</Button>
              </div>
            </div>
          </div>
        </Grid>
        <Grid xs={3}>
          <div className="religion-container">
            <div className="religion-content">
              <h2 className="religion-name">Category Name</h2>
              <p className="religion-description">Category Description...</p>
              <div className="religion-info">
                <span className="religion-posts">Number of Posts</span>
                <Button className="religion-button">View Posts</Button>
              </div>
            </div>
          </div>
        </Grid>
        <Grid xs={3}>
          <div className="religion-container">
            <div className="religion-content">
              <h2 className="religion-name">Category Name</h2>
              <p className="religion-description">Category Description...</p>
              <div className="religion-info">
                <span className="religion-posts">Number of Posts</span>
                <Button className="religion-button">View Posts</Button>
              </div>
            </div>
          </div>
        </Grid>
        <Grid xs={3}>
          <div className="religion-container">
            <div className="religion-content">
              <h2 className="religion-name">Category Name</h2>
              <p className="religion-description">Category Description...</p>
              <div className="religion-info">
                <span className="religion-posts">Number of Posts</span>
                <Button className="religion-button">View Posts</Button>
              </div>
            </div>
          </div>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Religions
