import React, { forwardRef, useImperativeHandle } from 'react'
import { faChevronLeft, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'
import { Input, ExpandCard } from '../'
import { useRef } from 'react'
import './topbar.css'
import SVGLogo from '../../svg/logo'

const animationDurations = {
	'expand': 150,
	'collapse': 150
}

const Topbar = forwardRef(({logo = false, title = null, subtitle = null, children = [], backURL = null, onBack = null, search = false, searchValue = '', onSearch = () => {}, buttons = [], onTitleClick = () => {}}, ref) => {
	const topbarRef = useRef(null)

	const currentAnimations = useRef([])
	const rectsBeforeAnimation = useRef([])
	const marginsBeforeAnimation = useRef([])
	const expandedIndex = useRef(null)

	function doAnimation(timestamp){
		let i = 0
    	while (i < currentAnimations.current.length){
			const animation = currentAnimations.current[i]
			if (animation.startTimestamp === null) animation.startTimestamp = timestamp
      		const progress = (timestamp - animation.startTimestamp) / animationDurations[animation.type]

			if (progress < 1){
				switch(animation.type){
					case 'expand':
					{
						const offsetLeft = (rectsBeforeAnimation.current[animation.index].left - 7) * progress
						const offsetRight = (rectsBeforeAnimation.current[animation.index].right - 7) * progress

						Array.from(topbarRef.current.children).forEach((child, i) => {
							if (i < animation.index){
								child.style.left = `${rectsBeforeAnimation.current[i].left - offsetLeft}px`
								child.style.right = `${rectsBeforeAnimation.current[i].right + offsetLeft}px`
							} else if (i === animation.index){
								child.style.left = `${rectsBeforeAnimation.current[i].left - offsetLeft}px`
								child.style.right = `${rectsBeforeAnimation.current[i].right - offsetRight}px`
							} else {
								child.style.left = `${rectsBeforeAnimation.current[i].left + offsetRight}px`
								child.style.right = `${rectsBeforeAnimation.current[i].right - offsetRight}px`
							}
						})
						break
					}
					case 'collapse':
					{
						const offsetLeft = (animation.target.left - 7) * progress
						const offsetRight = (animation.target.right - 7) * progress

						Array.from(topbarRef.current.children).forEach((child, i) => {
							if (i < expandedIndex.current){
								child.style.left = `${rectsBeforeAnimation.current[i].left + offsetLeft}px`
								child.style.right = `${rectsBeforeAnimation.current[i].right - offsetLeft}px`
							} else if (i === expandedIndex.current){
								child.style.left = `${rectsBeforeAnimation.current[i].left + offsetLeft}px`
								child.style.right = `${rectsBeforeAnimation.current[i].right + offsetRight}px`
							} else {
								child.style.left = `${rectsBeforeAnimation.current[i].left - offsetRight}px`
								child.style.right = `${rectsBeforeAnimation.current[i].right + offsetRight}px`
							}
						})

						break
					}
					default:
						break
				}

				i++
			} else {
				switch(animation.type){
					case 'expand':
						const child = topbarRef.current.children[animation.index]
						child.style.left = `${animation.target.left}px`
						child.style.right = `${animation.target.right}px`
						Array.from(topbarRef.current.children).forEach((child, i) => {
							if (i !== animation.index){
								child.style.visibility = 'hidden'
							}
						})
						break
					case 'collapse':
						Array.from(topbarRef.current.children).forEach((child, i) => {
							child.style.position = 'static'
							child.style.overflowX = 'visible'
							child.style.marginRight = marginsBeforeAnimation.current[i]
						})

						rectsBeforeAnimation.current = []
						expandedIndex.current = null
						break
					default:
						break
				}

				currentAnimations.current.splice(i, 1)
			}
		}

		if (currentAnimations.current.length > 0) requestAnimationFrame((ts) => {doAnimation(ts)})
	}

	useImperativeHandle(ref, () => ({
		expand({buttonIndex, newBackgroundColor, newFontColor}){
			if (window.innerWidth >= 800) return

			const topbarRect = topbarRef.current.getBoundingClientRect()

			rectsBeforeAnimation.current = Array(topbarRef.current.children.length).fill(null)
			marginsBeforeAnimation.current = Array(topbarRef.current.children.length).fill(null)

			Array.from(topbarRef.current.children).forEach((child, i) => {
				const rect = child.getBoundingClientRect()
				rectsBeforeAnimation.current[i] = {left: rect.left, right: window.innerWidth - rect.right, top: topbarRect.top, bottom: window.innerHeight - topbarRect.bottom}
				marginsBeforeAnimation.current[i] = child.style.marginRight
			})

			Array.from(topbarRef.current.children).forEach((child, i) => {
				child.style.position = 'absolute'
				child.style.overflowX = 'hidden'
				child.style.left = `${rectsBeforeAnimation.current[i].left}px`
				child.style.right = `${rectsBeforeAnimation.current[i].right}px`
				child.style.top = `${rectsBeforeAnimation.current[i].top}px`
				child.style.bottom = `${rectsBeforeAnimation.current[i].bottom}px`
				child.style.marginRight = 0
			})

			const realIndex = topbarRef.current.children.length - buttons.length + buttonIndex

			expandedIndex.current = realIndex

			currentAnimations.current.push({
				type: 'expand',
				index: realIndex,
				target: {left: topbarRect.left, right: window.innerWidth - topbarRect.right},
				startTimestamp: null
			})

			const child = topbarRef.current.children[realIndex]

			child.style.backgroundColor = newBackgroundColor
			child.style.color = newFontColor

			requestAnimationFrame((timestamp) => {doAnimation(timestamp)})
		},
		collapse({newBackgroundColor, newFontColor}){
			if (expandedIndex.current === null) return
			const target = {...rectsBeforeAnimation.current[expandedIndex.current]}
			const topbarRect = topbarRef.current.getBoundingClientRect()

			rectsBeforeAnimation.current = Array(topbarRef.current.children.length).fill(null)

			Array.from(topbarRef.current.children).forEach((child, i) => {
				child.style.visibility = 'visible'
				const rect = child.getBoundingClientRect()
				rectsBeforeAnimation.current[i] = {left: rect.left, right: window.innerWidth - rect.right, top: topbarRect.top, bottom: window.innerHeight - topbarRect.bottom}
			})

			currentAnimations.current.push({
				type: 'collapse',
				target: target,
				startTimestamp: null
			})

			const child = topbarRef.current.children[expandedIndex.current]

			child.style.backgroundColor = newBackgroundColor
			child.style.color = newFontColor

			requestAnimationFrame((timestamp) => {doAnimation(timestamp)})
		}
	}))

	return (
		<div className='topbar'>
			<div ref={topbarRef} className='topbar__top' style={{gridTemplateColumns: `${backURL || onBack ? 'fit-content(0)' : ''} fit-content(0) auto ${buttons.length > 0 ? `repeat(${buttons.length}, fit-content(0))` : ''}`, gridTemplateAreas: `"${backURL || onBack ? 'back' : ''} title additional ${buttons.map((_, i) => 'button' + i).join(' ')}"`}}>
				{
					backURL ?
					<Link to={backURL}>
						<ExpandCard className='topbar__top__back'>
							<FontAwesomeIcon icon={faChevronLeft} style={{color: 'var(--theme-color)', fontSize: 24}} />
						</ExpandCard>
					</Link> :
					onBack ?
					<ExpandCard className='topbar__top__back'>
						<FontAwesomeIcon icon={faChevronLeft} style={{color: 'var(--theme-color)', fontSize: 24}} onClick={onBack} />
					</ExpandCard> : null
				}
				{
					subtitle ?
					<div className='topbar__title-wrapper subtitle' onClick={onTitleClick}>
						<p className='topbar__title'>{title}</p>
						<p className='topbar__subtitle'>{subtitle}</p>
					</div> :
					title ?
					<ExpandCard className='topbar__title-wrapper' style={{width: 'fit-content'}} onClick={onTitleClick}>
						<p className='topbar__title'>{title}</p>
						<p className='topbar__subtitle'>{subtitle}</p>
					</ExpandCard> :
					logo ?
					<SVGLogo fill='var(--primaryTextColor)' height={16} />
					: null
				}
				<div className='topbar__top__additional' style={{gridTemplateColumns: `repeat(${children?.length || 0}, fit-content(0))`}}>
					{children}
				</div>
				{buttons}
			</div>
			{ search ?
				<div className='topbar__bottom'>
					<Input compact type="text" icon={faMagnifyingGlass} iconColor="var(--secondary-text-color)" value={searchValue} onChange={onSearch} placeholder="Buscar contraseñas" />
				</div> : null
			}
		</div>
	)
})

export default Topbar
