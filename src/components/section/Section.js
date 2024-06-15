import './section.css'

export default function Section(props){
	return (
		<div className={`section ${props.className || ''}`} style={props.style}>
			{props.children}
		</div>
	)
}
