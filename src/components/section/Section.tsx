import { PropsWithChildren } from 'react';
import './section.css'

type Props = {
	className?: string;
	style?: {};
}

export default function Section({className, style, children}: PropsWithChildren<Props>){
	return (
		<div className={`section ${className || ''}`} style={style}>
			{children}
		</div>
	)
}
