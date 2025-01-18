import React from "react"

export default function MagicWandSVG({ className = 'icon', fill = 'var(--primaryIconColor)' }): React.JSX.Element {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
            viewBox="0 0 19.147 19.04"
            xmlSpace="preserve"
        >
            <g transform="translate(-40.663 -29.212)">
                <g
                    fill={fill}
                    fillOpacity="1"
                    stroke="none"
                    strokeOpacity="1"
                    transform="matrix(.97296 0 0 .97296 40.663 29.212)"
                >
                    <path
                        fill='var(--secondaryIconColor)'
                        strokeWidth="0.582"
                        d="M9.656 7.409c-.546-.547-1.296-.683-1.674-.305l-.768.768C6.836 8.25 6.972 9 7.52 9.546l1.604 1.604 7.9 7.9c.547.547 1.296.683 1.674.305l.768-.768c.378-.378.242-1.127-.304-1.674l-7.9-7.9z"
                    ></path>
                    <path fill={fill} d="M9 15a1 1 0 10-2 0v.5a1 1 0 102 0z"></path>
                    <path fill={fill} d="M4.707 12.707a1 1 0 10-1.414-1.414l-1 1a1 1 0 101.414 1.414z"></path>
                    <path fill={fill} d="M15 7a1 1 0 100 2h.5a1 1 0 100-2z"></path>
                    <path fill={fill} d="M1 7a1 1 0 000 2h.5a1 1 0 000-2z"></path>
                    <path fill={fill} d="M13.707 3.707a1 1 0 00-1.414-1.414l-1 1a1 1 0 001.414 1.414z"></path>
                    <path fill={fill} d="M3.707 2.293a1 1 0 00-1.414 1.414l1 1a1 1 0 001.414-1.414z"></path>
                    <path fill={fill} d="M9 1a1 1 0 10-2 0v.5a1 1 0 002 0z"></path>
                </g>
            </g>
        </svg>
    )
}
