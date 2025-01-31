import { faCheck } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import './check.css'

type Props = {
    checked: boolean
}

export default function Check({ checked }: Props) {
    return (
        <div className={`check ${checked ? 'checked' : ''}`}>
            {checked ? <FontAwesomeIcon icon={faCheck} color='var(--checkIconColor)' /> : null}
        </div>
    )
}
