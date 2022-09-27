import { forwardRef, useImperativeHandle, useRef } from 'react'
import './expandCard.css'

const animationDurations = {
  'expandH': 150,
  'collapseH': 150
}

const ExpandCard = forwardRef(({children, className, style, expanded = false, onClick = () => {}}, ref) => {
  const divRef = useRef(null)

  const currentAnimations = useRef([])

  const rectBeforeAnimation = useRef(null)
  const marginBeforeAnimation = useRef(null)

  function doAnimation(timestamp){
    let i = 0
    while (i < currentAnimations.current.length){
      const animation = currentAnimations.current[i]
      if (animation.startTimestamp === null) animation.startTimestamp = timestamp
      const progress = (timestamp - animation.startTimestamp) / animationDurations[animation.type]

      if (progress < 1){
        switch(animation.type){
          case 'expandH':
            divRef.current.style.left = `${(animation.target.left - rectBeforeAnimation.current.left) * progress + rectBeforeAnimation.current.left}px`
            divRef.current.style.right = `${(animation.target.right - rectBeforeAnimation.current.right) * progress + rectBeforeAnimation.current.right}px`
            divRef.current.style.top = `${rectBeforeAnimation.current.top}px`
            divRef.current.style.bottom = `${rectBeforeAnimation.current.bottom}px`
            break
          case 'collapseH':
            divRef.current.style.left = `${(animation.target.left - animation.startRect.left) * progress + animation.startRect.left}px`
            divRef.current.style.right = `${(animation.target.right - animation.startRect.right) * progress + animation.startRect.right}px`
            break
          default:
            break
        }

        i++
      } else {
        switch(animation.type){
          case 'expandH':
            divRef.current.style.left = `${animation.target.left}px`
            divRef.current.style.right = `${animation.target.right}px`
            break
          case 'collapseH':
            divRef.current.style.left = `${animation.target.left}px`
            divRef.current.style.right = `${animation.target.right}px`
            divRef.current.style.position = 'static'
            divRef.current.style.overflowX = 'visible'
            divRef.current.style.marginRight = marginBeforeAnimation.current
            rectBeforeAnimation.current = null
            break
          default:
            break
        }
        currentAnimations.current.splice(i, 1)
      }

      if (currentAnimations.current.length > 0) requestAnimationFrame((ts) => {doAnimation(ts)})
    }
  }

  useImperativeHandle( ref, () => ({
    expandH(newBackgroundColor, newFontColor){
      const rect = divRef.current.getBoundingClientRect()
      const topbarRect = document.getElementsByClassName('topbar__top')[0].getBoundingClientRect()
      rectBeforeAnimation.current = {left: rect.left, right: window.innerWidth - rect.right, top: topbarRect.top, bottom: window.innerHeight - topbarRect.bottom}
      marginBeforeAnimation.current = divRef.current.style.marginRight
      currentAnimations.current.push({
        type: 'expandH',
        target: {left: topbarRect.left, right: window.innerWidth - topbarRect.right},
        startTimestamp: null
      })

      divRef.current.style.backgroundColor = newBackgroundColor
      divRef.current.style.color = newFontColor
      divRef.current.style.position = 'absolute'
      divRef.current.style.overflowX = 'hidden'
      divRef.current.style.marginRight = 0

      requestAnimationFrame((timestamp) => {doAnimation(timestamp)})
    },
    collapseH(newBackgroundColor, newFontColor){
      if (rectBeforeAnimation.current === null) return
      const rect = divRef.current.getBoundingClientRect()
      currentAnimations.current.push({
        type: 'collapseH',
        startRect: {left: rect.left, right: window.innerWidth - rect.right},
        target: rectBeforeAnimation.current,
        startTimestamp: null
      })

      divRef.current.style.backgroundColor = newBackgroundColor
      divRef.current.style.color = newFontColor

      requestAnimationFrame((timestamp) => {doAnimation(timestamp)})
    }
  }))

  function clickHandler(){
    if (!expanded && currentAnimations.current.length === 0) onClick()
  }

  return (
    <div ref={divRef} className={`expand-card ${className || ''}`} style={style} onClick={clickHandler}>
      {children}
    </div>
  )
})

export default ExpandCard