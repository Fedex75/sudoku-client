import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark, faChartSimple, faPlay } from "@fortawesome/free-solid-svg-icons";
import './statistics.css';
import { ThemeName } from "../../../utils/DataTypes";
import { AccentColor } from "../../../utils/Colors";

type Props = {
    theme: ThemeName;
    accentColor: AccentColor;
}

export default function Statistics({ theme, accentColor }: Props) {
    const { t } = useTranslation();

    return (
        <div className='home__statistics'>
            <p className='home__section-title'>{t('home.statistics')}</p>

            <div className='home__statistics-list'>
                <p>WIP</p>
            </div>

            <div className='home__tabSwitcher-wrapper'>
                <div className='home__tabSwitcher'>
                    <Link to="/home">
                        <div className='home__tabSwitcher__tab'>
                            <FontAwesomeIcon className='home__tabSwitcher__icon' icon={faPlay} />
                        </div>
                    </Link>
                    <Link to="/home/bookmarks">
                        <div className='home__tabSwitcher__tab'>
                            <FontAwesomeIcon className='home__tabSwitcher__icon' icon={faBookmark} />
                        </div>
                    </Link>
                    <Link to="/home/statistics">
                        <div className='home__tabSwitcher__tab selected'>
                            <FontAwesomeIcon className='home__tabSwitcher__icon' icon={faChartSimple} />
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
