import React from 'react'
import CountUp from 'react-countup';


function Countup() {
  return (
    <div className='row counts p-0'>
        <div className="col text-center">
          <div className="stat">
                  <CountUp end={10000}
                    prefix="👥 " 
                    suffix=" +"
                    duration={2.5} />
          </div>
        </div>
        <div className="col text-center">
          <div className="stat">
                  <CountUp end={100}
                    suffix="ms" 
                    prefix="⚡ "
                    duration={2.5} />
          </div>
        </div>
        <div className="col text-center">
          <div className="stat">
                  <CountUp end={100}
                  separator="," suffix="+" prefix="🖼️ "
                  duration={2.5} />
          </div>
        </div>
        <div className="col text-center">
          <div className="stat">
                  <CountUp end={100} 
                  prefix="🌍 " 
                  suffix="/195"
                  duration={2.5} />
          </div>
        </div>
    </div>
  )
}

export default Countup