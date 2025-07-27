import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';

type SectionLinkProps = {
    color?: string;
    icon?: IconDefinition;
    iconColor?: string;
    title: string;
    link: string;
    additionalInfo?: string;
};

export default function SectionLink({ color, iconColor, icon, title, link, additionalInfo }: SectionLinkProps) {
    return (
        <Link to={link} className='settings__section-link'>
            {icon && <div className='settings__section-link__icon' style={{ backgroundColor: color }}><FontAwesomeIcon icon={icon} color={iconColor} /></div>}
            <div className='settings__section-link__right-wrapper'>
                <p className='settings__section-link__title'>{title}</p>
                {additionalInfo && <p className='settings__section-link__info'>{additionalInfo}</p>}
                <FontAwesomeIcon icon={faChevronRight} color='gray' fontSize={12} />
            </div>
        </Link>
    );
}
