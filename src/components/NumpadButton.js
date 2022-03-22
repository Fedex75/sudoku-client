import React, {useRef} from 'react';
import useLongPress from '../utils/useLongPress';

function NunmpadButton(props){
	const endLongPressFired = useRef(false);
	const [onTouchStart, onTouchEnd] = useLongPress((type) => {
		endLongPressFired.current = true;
		props.onClick(props.number, type);
	}, 500);

	return (
		<div
			/*ref={divRef}*/
			className={props.className}
			onClick={(e) => {
				e.stopPropagation();
				e.preventDefault();
				if (endLongPressFired.current) endLongPressFired.current = false;
				else props.onClick(props.number, 'primary');
			}}
			onContextMenu={(e) => {
				e.stopPropagation();
				e.preventDefault();
				props.onClick(props.number, 'secondary');
			}}
			onTouchStart={(e) => {
				e.stopPropagation();
				e.preventDefault();
				onTouchStart();
			}}
			onTouchEnd={(e) => {
				e.stopPropagation();
				e.preventDefault();
				onTouchEnd();
			}}
		>
			{props.number}
		</div>
	);
}

export default NunmpadButton;