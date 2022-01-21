import React from 'react';
import Navbar from './Navbar';

function Section(props){
  return (
    <div className="section">
      <Navbar currentSection={props.name}/>
      <div className="section__content" id={props.name}>
        {props.children}
      </div>
    </div>
  )
}

export default Section;