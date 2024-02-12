import React from 'react'

import PropTypes from 'prop-types'

import './feature-card.css'

const FeatureCard = (props) => {
  return (
    <div className="featuresCard feature-card-feature-card">
      <div className="feature-card-container">
        <h3 className="feature-card-text heading3">{props.heading}</h3>
        <span className="bodySmall">{props.subHeading}</span>
      </div>
    </div>
  )
}

FeatureCard.defaultProps = {
  heading: 'Lorem ipsum',
  subHeading:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In lorem lorem, malesuada in metus vitae, scelerisque accumsan ipsum.',
}

FeatureCard.propTypes = {
  heading: PropTypes.string,
  subHeading: PropTypes.string,
}

export default FeatureCard
