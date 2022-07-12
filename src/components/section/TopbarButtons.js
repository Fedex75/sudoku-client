import React from 'react'

function TopbarButtons(props){
	return (
		<div className='topbar__buttons'>
			{props.children}
		</div>
	)
}

export default TopbarButtons