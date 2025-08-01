import React from "react";

export default function SVGSettings({ className = 'icon' }): React.JSX.Element {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
            viewBox="0 0 17.119 18.083"
            xmlSpace="preserve"
        >
            <defs>
                <linearGradient>
                    <stop offset="0" stopColor="#fff" stopOpacity="1"></stop>
                </linearGradient>
            </defs>
            <g transform="translate(-74.664 -2.95)">
                <g fill="none" transform="matrix(8.81944 0 0 8.81944 10.37 70.67)">
                    <g
                        fill="none"
                        strokeOpacity="1"
                        strokeWidth="1.5"
                        transform="matrix(.09535 0 0 .09535 7.116 -7.798)"
                    >
                        <circle cx="12" cy="12" r="3" stroke='var(--primaryIconColor)'></circle>
                        <path
                            stroke='var(--secondaryIconColor)'
                            d="M13.765 2.152C13.398 2 12.932 2 12 2c-.932 0-1.398 0-1.765.152a2 2 0 00-1.083 1.083c-.092.223-.129.484-.143.863a1.617 1.617 0 01-.79 1.353 1.617 1.617 0 01-1.567.008c-.336-.178-.579-.276-.82-.308a2 2 0 00-1.478.396C4.04 5.79 3.806 6.193 3.34 7c-.466.807-.7 1.21-.751 1.605a2 2 0 00.396 1.479c.148.192.355.353.676.555.473.297.777.803.777 1.361 0 .558-.304 1.064-.777 1.36-.321.203-.529.364-.676.556a2 2 0 00-.396 1.479c.052.394.285.798.75 1.605.467.807.7 1.21 1.015 1.453a2 2 0 001.479.396c.24-.032.483-.13.819-.308a1.617 1.617 0 011.567.008c.483.28.77.795.79 1.353.014.38.05.64.143.863a2 2 0 001.083 1.083C10.602 22 11.068 22 12 22c.932 0 1.398 0 1.765-.152a2 2 0 001.083-1.083c.092-.223.129-.484.143-.863.02-.558.307-1.074.79-1.353a1.617 1.617 0 011.567-.008c.336.178.579.276.819.308a2 2 0 001.479-.396c.315-.242.548-.646 1.014-1.453.466-.807.7-1.21.751-1.605a2 2 0 00-.396-1.479c-.148-.192-.355-.353-.676-.555A1.617 1.617 0 0119.562 12c0-.558.304-1.064.777-1.36.321-.203.529-.364.676-.556a2 2 0 00.396-1.479c-.052-.394-.285-.798-.75-1.605-.467-.807-.7-1.21-1.015-1.453a2 2 0 00-1.479-.396c-.24.032-.483.13-.82.308a1.617 1.617 0 01-1.566-.008 1.617 1.617 0 01-.79-1.353c-.014-.38-.05-.64-.143-.863a2 2 0 00-1.083-1.083z"
                            opacity="1"
                        ></path>
                    </g>
                </g>
            </g>
        </svg>
    );
};
