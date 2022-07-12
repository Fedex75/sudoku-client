import React from 'react'

function SectionContent({children, id, paddingTop = 10}){
	return (
		<div className='section__content' id={id} style={{paddingTop: paddingTop}}>
			{children}
		</div>
	)
}

export default SectionContent