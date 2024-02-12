import { Unstable_Grid2 as Grid, Button } from '@mui/material'

import '../../assets/css/miscStyles.css'

const Categories = () => {
  return (
    <>
      <h3 className='text-2xl font-semibold'>All Categories</h3>
      <Grid container spacing={2}>
        <Grid xs={3}>
          <div className='category-container' data-id='21'>
            <div className='category-content' data-id='22'>
              <h2 className='category-name' data-id='23'>Category Name</h2>
              <p className='category-description' data-id='24'>Category Description...</p>
              <div className='category-info' data-id='25'>
                <span className='category-posts' data-id='26'>Number of Posts</span>
                <Button variant='contained' className='category-button' data-id='27'>View Posts</Button>
              </div>
            </div>
          </div>
        </Grid>

        <Grid xs={3}>
          <div className='category-container' data-id='21'>
            <div className='category-content' data-id='22'>
              <h2 className='category-name' data-id='23'>Category Name</h2>
              <p className='category-description' data-id='24'>Category Description...</p>
              <div className='category-info' data-id='25'>
                <span className='category-posts' data-id='26'>Number of Posts</span>
                <Button variant='contained' className='category-button' data-id='27'>View Posts</Button>
              </div>
            </div>
          </div>
        </Grid>
        <Grid xs={3}>
          <div className='category-container' data-id='21'>
            <div className='category-content' data-id='22'>
              <h2 className='category-name' data-id='23'>Category Name</h2>
              <p className='category-description' data-id='24'>Category Description...</p>
              <div className='category-info' data-id='25'>
                <span className='category-posts' data-id='26'>Number of Posts</span>
                <Button variant='contained' className='category-button' data-id='27'>View Posts</Button>
              </div>
            </div>
          </div>
        </Grid>
        <Grid xs={3}>
          <div className='category-container' data-id='21'>
            <div className='category-content' data-id='22'>
              <h2 className='category-name' data-id='23'>Category Name</h2>
              <p className='category-description' data-id='24'>Category Description...</p>
              <div className='category-info' data-id='25'>
                <span className='category-posts' data-id='26'>Number of Posts</span>
                <Button variant='contained' className='category-button' data-id='27'>View Posts</Button>
              </div>
            </div>
          </div>
        </Grid>
        <Grid xs={3}>
          <div className='category-container' data-id='21'>
            <div className='category-content' data-id='22'>
              <h2 className='category-name' data-id='23'>Category Name</h2>
              <p className='category-description' data-id='24'>Category Description...</p>
              <div className='category-info' data-id='25'>
                <span className='category-posts' data-id='26'>Number of Posts</span>
                <Button variant='contained' className='category-button' data-id='27'>View Posts</Button>
              </div>
            </div>
          </div>
        </Grid>
        <Grid xs={3}>
          <div className='category-container' data-id='21'>
            <div className='category-content' data-id='22'>
              <h2 className='category-name' data-id='23'>Category Name</h2>
              <p className='category-description' data-id='24'>Category Description...</p>
              <div className='category-info' data-id='25'>
                <span className='category-posts' data-id='26'>Number of Posts</span>
                <Button variant='contained' className='category-button' data-id='27'>View Posts</Button>
              </div>
            </div>
          </div>
        </Grid>
        <Grid xs={3}>
          <div className='category-container' data-id='21'>
            <div className='category-content' data-id='22'>
              <h2 className='category-name' data-id='23'>Category Name</h2>
              <p className='category-description' data-id='24'>Category Description...</p>
              <div className='category-info' data-id='25'>
                <span className='category-posts' data-id='26'>Number of Posts</span>
                <Button variant='contained' className='category-button' data-id='27'>View Posts</Button>
              </div>
            </div>
          </div>
        </Grid>
      </Grid>
    </>
  )
}

export default Categories
