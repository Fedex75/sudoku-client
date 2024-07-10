import React from 'react';
import './editButton.css'
import { isTouchDevice } from '../../utils/isTouchDevice';

type Props = {
	onClick: () => void;
	highlight?: boolean;
	yellow?: boolean;
	icon: React.ReactNode;
	enabled?: boolean;
}

function EditButton({onClick, highlight = false, yellow = false, icon, enabled = true}: Props): React.JSX.Element {
	return (
		<div
			className={`edit-buttons__button fade_in ${highlight ? 'highlight' : ''} ${yellow ? 'yellow' : ''} ${enabled ? '' : 'disabled'}`}
			onTouchStart={e => {
				e.stopPropagation();
				onClick();
			}}
			onClick={e => {
				e.stopPropagation();
				if (isTouchDevice) return;
				if (enabled) onClick();
			}}
			onContextMenu={e => {
				e.stopPropagation();
				e.preventDefault();
				if (isTouchDevice) return;
				if (enabled) onClick();
			}}
		>
			{icon}
		</div>
	)
}

export default EditButton
