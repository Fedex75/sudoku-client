import React, { PropsWithChildren } from 'react'

export default function TopbarButtons(props: PropsWithChildren){
	return (
		<div className='topbar__buttons'>
			{props.children}
		</div>
	)
}
