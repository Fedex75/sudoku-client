import { forwardRef } from 'react'
import './expandCard.css'

const ExpandCard = forwardRef(({children, className, style, expanded = false, onClick = () => {}}, ref) => {

  function clickHandler(){
    if (!expanded) onClick()
  }

  return (
    <div ref={ref} className={`expand-card ${className || ''}`} style={style} onClick={clickHandler}>
      {children}
    </div>
  )
})

export default ExpandCard