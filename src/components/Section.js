import React from 'react';
import Navbar from './Navbar';

function Section(props){
  return (
    <div className="section">
      <Navbar currentSection={props.name} themeName={props.themeName} toggleTheme={props.toggleTheme}/>
      <div className="section__content" id={props.name}>
        {props.children}
      </div>
    </div>
  )
}

export default Section;