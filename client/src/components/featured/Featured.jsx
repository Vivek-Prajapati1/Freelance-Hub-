import React, { useState, useEffect } from "react";
import './featured.scss';
import { useNavigate } from 'react-router-dom';

function Featured() {
  const [input, setInput] = useState("");
  const [currentBg, setCurrentBg] = useState(1);
  const navigate = useNavigate();
  
  const handleSubmit = () => {
    navigate(`gigs?search=${input}`);
  };
  
  const changeBg = (bgNumber) => {
    setCurrentBg(bgNumber);
  };
  
  // Auto-rotate backgrounds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg(prev => prev === 6 ? 1 : prev + 1);
    }, 2700);
    
    return () => clearInterval(interval);
  }, []);

  // Get the current background style
  const getBackgroundStyle = () => {
    const basePath = process.env.PUBLIC_URL || '';
    return {
      backgroundImage: `url('${basePath}/images/bg-hero${currentBg}.webp')`
    };
  };

  return (
    <div className="featured" style={getBackgroundStyle()}>
      <div className="container">
        <div className="left">
          <h1>
            Find the perfect <span>freelance</span> <br />
            <span>services</span> for your business
          </h1>
          <div className="search">
            <div className="searchInput">
              <img src="/images/search.png" alt="" />
              <input 
                type="text" 
                placeholder='Try "building mobile app"' 
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>
            <button onClick={handleSubmit}>Search</button>
          </div>
          <div className="popular">
            <span>Popular:</span>
            <button onClick={e => navigate(`gigs?search=${e.target.innerHTML}`)}>Web Design</button>
            <button onClick={e => navigate(`gigs?search=${e.target.innerHTML}`)}>WordPress</button>
            <button onClick={e => navigate(`gigs?search=${e.target.innerHTML}`)}>Logo Design</button>
            <button onClick={e => navigate(`gigs?search=${e.target.innerHTML}`)}>AI Services</button>
          </div>
        </div>
      </div>
      <div className="bg-indicator">
        {[1, 2, 3, 4, 5, 6].map(num => (
          <span 
            key={num} 
            className={currentBg === num ? "active" : ""}  

            onClick={() => changeBg(num)}
          />
        ))}
      </div>
    </div>
  );
}

export default Featured;