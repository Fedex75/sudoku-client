import React from "react";
import { resize } from "./resize";

export default function StatisticsSVG({width = 0, height = 0, className = 'icon'}): React.JSX.Element {
    const [w, h] = resize(75.703, 57.966, width, height);

    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width={w}
            height={h}
            version="1.1"
            viewBox="0 0 20.03 15.337"
            xmlSpace="preserve"
        >
            <g transform="translate(-101.607 -6.278)">
                <g fill="none" transform="matrix(8.81944 0 0 8.81944 10.37 70.67)">
                    <g
                        fill='var(--secondaryIconColor)'
                        fillOpacity="1"
                        stroke='var(--primaryIconColor)'
                        strokeOpacity="1"
                        transform="translate(10.251 -7.867) scale(.10243)"
                    >
                        <path
                            fill='var(--secondaryIconColor)'
                            fillOpacity="1"
                            stroke='var(--primaryIconColor)'
                            strokeOpacity="1"
                            strokeWidth="1.102"
                            d="M7.436 15.794v4.934c0 .674-.445 1.22-.995 1.22h-3.98c-.55 0-.996-.546-.996-1.22v-4.934c0-.675.446-1.221.996-1.221h3.98c.55 0 .995.546.995 1.22zm6.554-9.72h-3.98c-.55 0-.995.547-.995 1.221v13.433c0 .674.445 1.22.995 1.22h3.98c.55 0 .995-.546.995-1.22V7.295c0-.674-.445-1.22-.995-1.22zm7.55 4.885h-3.981c-.55 0-.995.546-.995 1.22v8.549c0 .674.445 1.22.995 1.22h3.98c.55 0 .996-.546.996-1.22V12.18c0-.675-.446-1.221-.996-1.221z"
                        ></path>
                    </g>
                </g>
            </g>
        </svg>
    );
}
