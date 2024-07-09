import React from "react";
import { resize } from "./resize";

export default function SVGRestart({ stroke = '#000', fill = '#000', width = 0, height = 0, className = 'icon' }): React.JSX.Element {
  const [w, h] = resize(64.556, 68.963, width, height);

  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={w}
      height={h}
      version="1.1"
      viewBox="0 0 17.08 18.247"
      xmlSpace="preserve"
    >
      <defs>
        <linearGradient>
          <stop offset="0" stopColor="#fff" stopOpacity="1"></stop>
        </linearGradient>
      </defs>
      <g transform="translate(-74.312 -29.765)">
        <g fill="none" transform="matrix(8.81944 0 0 8.81944 10.37 70.67)">
          <g fill="none" transform="matrix(.11514 0 0 .11514 13.373 -7.926)">
            <g
              fill="none"
              stroke={stroke}
              strokeOpacity="1"
              transform="matrix(.9613 0 0 .9613 -56.305 25.62)"
            >
              <path
                fill="none"
                stroke={stroke}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity="1"
                strokeWidth="1.5"
                d="M19.729 10.929A8.003 8.003 0 018.5 20.197M18.364 8.05l-.707-.707A8 8 0 005.754 18m12.61-9.95h-4.243m4.243 0V3.809"
                clipPath="url(#clipPath1)"
              ></path>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
