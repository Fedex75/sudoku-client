import './sectionContent.css'

export default function SectionContent({children, id, paddingTop = 10}){
	return (
		<div className='section__content' id={id} style={{paddingTop: paddingTop}}>
			{children}
		</div>
	)
}