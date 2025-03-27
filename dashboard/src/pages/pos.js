import React from 'react';
import Sidebar from '../components/sidebar';


const Pos = () => {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div className="container">
        <h1>POS SITE</h1>
        <p>This is a simple HTML page.</p>
        <section>
          <h2>About Me</h2>
          <ul>
            <li>Web Developer</li>
            <li>Design Enthusiast</li>
            <li>Coding Learner</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default Pos;