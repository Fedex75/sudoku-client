import { faCheck } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import './check.css'

export default function Check({checked}){
  return (
    <div className={`check ${checked ? 'checked' : ''}`}>
      {checked ? <FontAwesomeIcon icon={faCheck} color='var(--checkIconColor)' /> : null }
    </div>
  )
}