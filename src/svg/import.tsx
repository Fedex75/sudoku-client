import React from "react";
import { resize } from "./resize";

export default function SVGImport({ width = 0, height = 0, className = 'icon' }): React.JSX.Element {
  const [w, h] = resize(64.702, 68.343, width, height);

  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={w}
      height={h}
      version="1.1"
      viewBox="0 0 21.207 18.468"
      xmlSpace="preserve"
    >
      <defs>
        <linearGradient>
          <stop offset="0" stopColor="#fff" stopOpacity="1"></stop>
        </linearGradient>
      </defs>
      <g transform="translate(-41.585 -2.862)">
        <g fill="none" transform="matrix(8.81944 0 0 8.81944 10.37 70.67)">
          <g
            fill="none"
            fillOpacity="1"
            transform="translate(3.175 -8.29) scale(.1374)"
          >
            <path
              fill='var(--secondaryIconColor)'
              d="M16.4 19.62h-10a3.75 3.75 0 01-3.75-3.75v-2.5a.75.75 0 111.5 0v2.5a2.25 2.25 0 002.25 2.25h10a2.25 2.25 0 002.25-2.25v-2.5a.75.75 0 111.5 0v2.5a3.75 3.75 0 01-3.75 3.75z"
            ></path>
            <path
              fill='var(--primaryIconColor)'
              d="M11.4 14.88a.75.75 0 01-.75-.75v-9a.75.75 0 111.5 0v9a.76.76 0 01-.75.75z"
            ></path>
            <path
              fill='var(--primaryIconColor)'
              d="M11.4 16.12a.73.73 0 01-.53-.22l-4.24-4.24a.74.74 0 010-1.06.75.75 0 011.06 0l3.71 3.71 3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.74.74 0 01-.53.22z"
            ></path>
          </g>
        </g>
      </g>
    </svg>
  );
}
