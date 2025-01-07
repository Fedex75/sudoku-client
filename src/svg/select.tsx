import React from "react";

export default function SelectSVG({className = 'icon'}): React.JSX.Element {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="2 2.5 19.523 19.523"
            fill="var(--primaryIconColor)"
        >
            <path d="M5.5 3a.5.5 0 010 1A1.5 1.5 0 004 5.5a.5.5 0 01-1 0A2.5 2.5 0 015.5 3zm3 1a.5.5 0 010-1h2a.5.5 0 110 1h-2zm5 0a.5.5 0 110-1h2a.5.5 0 110 1h-2zm-5 17a.5.5 0 110-1h2a.5.5 0 110 1h-2zm5 0a.5.5 0 110-1h2a.5.5 0 110 1h-2zM3 8.5a.5.5 0 011 0v2a.5.5 0 11-1 0v-2zm0 5a.5.5 0 111 0v2a.5.5 0 11-1 0v-2zm0 5a.5.5 0 111 0A1.5 1.5 0 005.5 20a.5.5 0 110 1A2.5 2.5 0 013 18.5zM18.5 21a.5.5 0 110-1 1.5 1.5 0 001.5-1.5.5.5 0 111 0 2.5 2.5 0 01-2.5 2.5zm2.5-5.5a.5.5 0 11-1 0v-2a.5.5 0 111 0v2zm0-5a.5.5 0 11-1 0v-2a.5.5 0 111 0v2zm0-5a.5.5 0 11-1 0A1.5 1.5 0 0018.5 4a.5.5 0 110-1A2.5 2.5 0 0121 5.5z"></path>
        </svg>
    );
}
