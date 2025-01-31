import React from "react"

export default function EraserSVG({ className = 'icon' }): React.JSX.Element {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
            viewBox="0 0 22.228 21.339"
            xmlSpace="preserve"
        >
            <defs>
                <linearGradient>
                    <stop offset="0" stopColor="#fff" stopOpacity="1"></stop>
                </linearGradient>
            </defs>
            <g transform="translate(-192.858 -2.13)">
                <path
                    fill='var(--secondaryIconColor)'
                    fillOpacity="1"
                    strokeWidth="1.186"
                    d="M207.028 2.13c-1.23 0-2.22.99-4.2 2.97l-5.82 5.82 8.4 8.4 5.82-5.82c1.98-1.98 2.97-2.97 2.97-4.2s-.99-2.22-2.97-4.2c-1.98-1.98-2.97-2.97-4.2-2.97z"
                    opacity="1"
                ></path>
                <path
                    fill='white'
                    fillOpacity="1"
                    strokeWidth="1.186"
                    d="M205.407 19.32l-8.4-8.399-1.179 1.18c-1.98 1.98-2.97 2.97-2.97 4.2s.99 2.22 2.97 4.2c1.98 1.98 2.97 2.97 4.2 2.97s2.22-.99 4.2-2.97z"
                ></path>
                <g
                    fill='white'
                    opacity="1"
                    transform="matrix(1.1855 0 0 1.1855 189.302 -1.426)"
                >
                    <path d="M9.033 21H9h.033z"></path>
                    <path
                        fillOpacity="1"
                        fillRule="nonzero"
                        strokeDasharray="none"
                        strokeWidth="1"
                        d="M9.063 21c.796-.006 1.476-.506 2.51-1.5H21a.75.75 0 010 1.5z"
                        opacity="1"
                    ></path>
                </g>
            </g>
        </svg>
    )
}
