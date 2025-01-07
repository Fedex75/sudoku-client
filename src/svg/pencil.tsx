import React from "react";

export default function PencilSVG({ className = 'icon' }): React.JSX.Element {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
            viewBox="0 0 19.956 21.226"
            xmlSpace="preserve"
        >
            <g fill='var(--primaryIconColor)' fillOpacity="1" transform="translate(-222.55 -2.45)">
                <path
                    fillRule="evenodd"
                    stroke='var(--secondaryIconColor)'
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeOpacity="1"
                    strokeWidth="1.931"
                    d="M238.66 3.62l2.504 2.038a1.242 1.242 0 01-.01 1.79l-1.903 2.317-6.475 7.9a.822.822 0 01-.431.267l-3.358.772a.85.85 0 01-.88-.753l.157-3.312a.77.77 0 01.19-.458l6.196-7.55 2.182-2.662a1.367 1.367 0 011.828-.349z"
                    clipRule="evenodd"
                ></path>
                <path
                    strokeWidth="1.287"
                    d="M223.515 21.745a.966.966 0 000 1.93zm17.636 1.93a.965.965 0 100-1.93zm-17.636 0h17.636v-1.93h-17.636z"
                ></path>
            </g>
        </svg>
    );
}
