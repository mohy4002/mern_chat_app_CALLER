import React from 'react';
import './css/Reviews.css'; // Create this CSS file

const Review = (props) => {

  return (
    <div className="review-container">
      <img src={props.user.avatar} alt="avatar" className='avatar'/>
      <div className="triangle-left"></div>
      <div className="review-content">
        <h4 className="review-title">{props.user.name}</h4>
        <p className="review-text">{props.user.review}</p>
        <div className="review-rating">
          {Array.from({ length: props.user.rating }, (_, index) => (
            <span key={index} className="star">★</span>
          ))}
          {Array.from({ length: 5 - props.user.rating }, (_, index) => (
            <span key={index} className="star empty">☆</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Review;