import Spline from '@splinetool/react-spline';
import React, { useState } from 'react';
import './css/sline.css'
import { useInView } from 'react-intersection-observer';

const FloatingObject = () => {
  const { ref, inView } = useInView({
    triggerOnce: true, // Load only once
    threshold: 0.2,     // Load when 20% of the element is in view
  });  
  const [loaded, setLoaded] = useState(false);

  return (
    <div ref={ref} className='splinobj' style={{ width: '100%', height: '100vh',pointerEvents: 'none' }}>
 {inView && !loaded && <p>Loading 3D Model...</p>}
 {inView && (
      <Spline 
        scene="https://prod.spline.design/xUSCNe7Mldxril7y/scene.splinecode?version=2" 
        onLoad={() => setLoaded(true)}
        />
        )}
    </div>
  );
};

export default FloatingObject;
