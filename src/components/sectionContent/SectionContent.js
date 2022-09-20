import './sectionContent.css'

export default function SectionContent({children, id}){
	return (
		<div className='section__content' id={id}>
			{children}
		</div>
	)
}