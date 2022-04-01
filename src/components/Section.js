import React from 'react';
import Navbar from './Navbar';

function Section(props){
  return (
    <div className="section">
      <Navbar currentSection={props.name} themeName={props.themeName} toggleTheme={props.toggleTheme} gameMode={props.gameMode} setGameMode={props.setGameMode}/>
      <div className="section__content" id={props.name}>
        {props.children}
      </div>
    </div>
  )
}

export default Section;