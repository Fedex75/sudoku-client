import React from "react"

export default function BulbSVG({ className = 'icon' }): React.JSX.Element {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
            viewBox="0 0 14.984 21.405"
            xmlSpace="preserve"
        >
            <defs>
                <linearGradient>
                    <stop offset="0" stopColor="#fff" stopOpacity="1"></stop>
                </linearGradient>
            </defs>
            <g transform="translate(-9.586 -30.525)">
                <g
                    fill='var(--primaryIconColor)'
                    fillOpacity="1"
                    stroke='var(--secondaryIconColor)'
                    strokeOpacity="1"
                    transform="matrix(1.07024 0 0 1.07024 4.235 28.385)"
                >
                    <path
                        fill='white'
                        fillOpacity="1"
                        stroke='var(--secondaryIconColor)'
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeOpacity="1"
                        strokeWidth="2"
                        d="M9 21h6M12 3a6 6 0 00-5.019 9.29c.954 1.452 1.43 2.178 1.493 2.286.55.965.449.625.518 1.734.008.124.008.313.008.69a1 1 0 001 1h4a1 1 0 001-1c0-.377 0-.566.008-.69.07-1.11-.033-.769.518-1.734.062-.108.54-.834 1.493-2.287A6 6 0 0012 3z"
                    ></path>
                </g>
            </g>
        </svg>
    )
}
