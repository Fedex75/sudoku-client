import React from "react";

export default function UndoSVG({ className = 'icon' }): React.JSX.Element {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
            viewBox="0 0 18.642 15.446"
            xmlSpace="preserve"
        >
            <g transform="translate(-8.034 -4.496)">
                <g
                    fill="none"
                    fillOpacity="1"
                    strokeWidth="0.121"
                    transform="matrix(8.81944 0 0 8.81944 10.37 70.67)"
                >
                    <path
                        fill='var(--primaryIconColor)'
                        fillRule="evenodd"
                        d="M.252-7.477a.09.09 0 00-.128 0l-.362.363a.09.09 0 000 .128l.362.362a.09.09 0 10.128-.128l-.298-.298.298-.299a.09.09 0 000-.128z"
                        clipRule="evenodd"
                    ></path>
                    <path
                        fill='var(--secondaryIconColor)'
                        strokeDasharray="none"
                        d="M.044-7.14h1.11a.695.695 0 010 1.388H.31a.09.09 0 010-.18h.845a.513.513 0 000-1.028H.044l-.09-.09z"
                        opacity="1"
                    ></path>
                </g>
            </g>
        </svg>
    );
}
