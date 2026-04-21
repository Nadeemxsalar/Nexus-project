import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './Home.css';

function Home() {
  const [isUltraMode, setIsUltraMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 1000, once: false });
  }, []);

  const toggleModernMode = () => {
    setIsUltraMode(!isUltraMode);
    if (isUltraMode && isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const modernText = "⚡ NEXUS SMART SYSTEM ⚡";
  const normalText = "🌟🌟 Explore Real Hero Nadeem's World 🌟🌟";

  return (
    <div className={`nexus-home ${isUltraMode ? 'modern-mode' : ''}`}>
      
      <video className="bg-video" autoPlay loop muted playsInline>
        <source src={process.env.PUBLIC_URL + '/v2.mp4'} type="video/mp4" />
      </video> 

      <div className="cyber-bg"></div>
      <div className="overlay"></div>

      <nav>
        <div className="nav-container">
          <div className="brand">NEXUS</div>
          
          <div className="theme-switch-wrapper">
             <label className="switch">
                <input type="checkbox" id="modeToggle" onChange={toggleModernMode} checked={isUltraMode} />
                <span className="slider"></span>
             </label>
             <span className="mode-label">ULTRA MODE</span>
          </div>

          <div className="toggle" onClick={toggleMenu}>
            {isMenuOpen ? "✖" : "☰"}
          </div>
          
          <ul className={`menu ${isMenuOpen ? 'active' : ''}`} id="menu">
            <li onClick={() => setIsMenuOpen(false)}>
              <Link to="/">Home</Link>
              <div className="submenu">
                <Link to="/webnewinterface">Smart Mode</Link>
                <Link to="/thirdwebinterface">Pro Mode</Link>
              </div>
            </li>
            <li>
              <a href="#contact">Contact</a>
              <div className="submenu">
                <a href="https://www.instagram.com/top_real_nadeem/" target="_blank" rel="noreferrer">Instagram</a>
                <a href="mailto:nadeemrealhero@gmail.com">Email</a>
                <a href="tel:+919368218331">Mobile</a>
              </div>
            </li>
            <li>
              <a href="#about">About</a>
              <div className="submenu">
                <Link to="/nadeem-contact">Feedback</Link>
                <Link to="/nadeem-contact">Help</Link>
              </div>
            </li>
            <li>
              <a href="#account">Account</a>
              <div className="submenu">
                <Link to="/login">Login Page</Link>
                <Link to="/profile">Profile</Link>
              </div>
            </li>
            <li onClick={() => setIsMenuOpen(false)}>
              <a href="#logout">Logout</a>
              <div className="submenu">
                <a href="#logout">Log Out</a>
              </div>
            </li>
          </ul>
        </div>
      </nav>

      <h1 id="mainTitle" data-text={isUltraMode ? modernText : normalText}>
        {isUltraMode ? modernText : normalText}
      </h1>

      <div className="container">
        <div data-aos="zoom-in-up" className="card" id="education">
          <Link to="/education">
              <div className="card-content">
                  <h2>
                    <span className="mode-icon">📚</span>
                    <img className="mode-gif" src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f393/512.gif" alt="edu gif" />
                    Education
                  </h2>
                  <p>Courses, exams, learning resources and all about education for every age group.</p>
              </div>
          </Link>
        </div>
        
        <div data-aos="slide-left" className="card" id="technology">
          <Link to="/technology">
              <div className="card-content">
                  <h2>
                    <span className="mode-icon">💻</span>
                    <img className="mode-gif" src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f680/512.gif" alt="tech gif" />
                    Technology
                  </h2>
                  <p>Latest in gadgets, AI, web development, and everything tech-related.</p>
              </div>
          </Link>
        </div>
        
        <div data-aos="zoom-out" className="card" id="health">
          <Link to="/health">
              <div className="card-content">
                  <h2>
                    <span className="mode-icon">🏥</span>
                    <img className="mode-gif" src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f496/512.gif" alt="health gif" />
                    Health
                  </h2>
                  <p>Tips for mental & physical health, healthy living guides, and expert advice.</p>
              </div>
          </Link>
        </div>
        
        <div data-aos="slide-up" className="card" id="travel">
          <Link to="/restaurantmngt">
              <div className="card-content">
                  <h2>
                    <span className="mode-icon">🍝</span>
                    <img className="mode-gif" src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f35d/512.gif" alt="rest gif" />
                    Restaurant 🍴
                  </h2>
                  <p>Where taste meets tradition, creating unforgettable moments with every flavorful bite</p>
              </div>
          </Link>
        </div>
        
        <div data-aos="flip-right" className="card" id="art">
          <Link to="/mealmaster">
            <div className="card-content">
                <h2>
                  <span className="mode-icon">🍲</span>
                  <img className="mode-gif" src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f373/512.gif" alt="meal gif" />
                  Meal Master
                </h2>
                <p>Smart meal ideas, ingredient tracking, and weekly food planning made simple.</p>
            </div>
          </Link>
        </div>
        
        <div data-aos="flip-left" className="card" id="socialmedia">
          <Link to="/socialmedia">
            <div className="card-content">
                <h2>
                  <span className="mode-icon">📱</span>
                  <img className="mode-gif" src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f525/512.gif" alt="social gif" />
                  Social Media
                </h2>
                <p>All about trending platforms, influencer tips, and social growth strategies.</p>
            </div>
          </Link>
        </div>
        
        <div data-aos="zoom-out" className="card" id="games">
          <Link to="/gameinterface"> 
            <div className="card-content">
                <h2>
                  <span className="mode-icon">🎮</span>
                  <img className="mode-gif" src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f3b2/512.gif" alt="game gif" />
                  Games
                </h2>
                <p>Latest games, reviews, tips, walkthroughs and esports updates.</p>
            </div>
          </Link>
        </div>
        
        <div data-aos="slide-up" className="card" id="realheronadeem">
          <Link to="/portfolionadeem">
            <div className="card-content">
                <h2>
                  <span className="mode-icon">🌟</span>
                  <img className="mode-gif" src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f31f/512.gif" alt="hero gif" />
                  Real Hero Nadeem
                </h2>
                <p>Know more about Real Hero Nadeem's journey, works, and contributions.</p>
            </div>
          </Link>
        </div>
        
        <div data-aos="flip-left" className="card" id="shopping">
          <Link to="/shopingzone">
            <div className="card-content">
                <h2>
                  <span className="mode-icon">🛒</span>
                  <img className="mode-gif" src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f381/512.gif" alt="shop gif" />
                  Shopping 🛍️
                </h2>
                <p>Smart shopping starts here — trendy picks, easy checkout, and affordable prices always.</p>
            </div>
          </Link>
        </div>
      </div>

      <footer>
        <p>Owner: <strong>Real Hero Nadeem</strong> | Email: <a href="mailto:nadeemrealhero@gmail.com">nadeemrealhero@gmail.com</a></p>
        <p>
          Follow on:
          <a href="#instagram">Instagram</a> |
          <a href="#facebook">Facebook</a> |
          <a href="#youtube">YouTube</a> |
          <a href="#twitter">Twitter</a>
        </p>
        <p>All rights reserved © Real Hero Nadeem</p>
      </footer>

    </div>
  );
}

export default Home;