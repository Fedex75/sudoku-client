import React from "react";
import { resize } from "./resize";

export default function SVGMenu({ strokeTop = '#000', strokeBottom = '#000', width = 0, height = 0 }) {
  const [w, h] = resize(72.952, 34.739, width, height);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={w}
      height={h}
      version="1.1"
      viewBox="0 0 19.302 9.191"
      xmlSpace="preserve"
    >
      <defs>
        <linearGradient>
          <stop offset="0" stopColor="#fff" stopOpacity="1"></stop>
        </linearGradient>
      </defs>
      <g transform="translate(-161.512 -7.52)">
        <g fill="none" transform="matrix(8.81944 0 0 8.81944 10.37 70.67)">
          <g fill="none" transform="matrix(.11514 0 0 .11514 13.373 -7.926)">
            <g
              fill="none"
              strokeDasharray="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity="1"
              strokeWidth="0.913"
              transform="translate(-126.969 11.423) scale(1.89961)"
            >
              <path stroke={strokeBottom} d="M93.598 1.798h-9.093"></path>
              <path stroke={strokeTop} d="M93.598-2.054h-9.093"></path>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};
