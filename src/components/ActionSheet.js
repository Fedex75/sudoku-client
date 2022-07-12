import ActionSheetReact from 'actionsheet-react';
import { useState } from 'react';

export function ActionSheetButton({title, color = 'var(--theme-color)', onClick = () => {}, cancel = false}){
	const [clicked, setClicked] = useState(false);

	return (
		<div
			className={`action-sheet__button ${cancel ? 'cancel' : ''}`}
			onClick={onClick}
			onTouchStart={() => {setClicked(true)}}
			onTouchEnd={() => {setClicked(false)}}
			style={{
				color: color,
				filter: clicked ? 'brightness(90%)' : 'none'
			}}
		>	
			{title}
		</div>
	);
}

export default function ActionSheet({reference, title = null, cancelTitle = null, onClose = () => {}, children}){
	function cancel(){
		reference.current.close();
		onClose();
	}

	return (
		<ActionSheetReact
			ref={reference}
			sheetStyle={{
				backgroundColor: "transparent",
				padding: 10,
				boxSizing: 'border-box'
			}}
			bgStyle={{
				backgroundColor: "rgba(1, 1, 1, 0.5)"
			}}
			sheetTransition='transform 0.2s ease-in-out'
			bgTransition='opacity 0.2s ease-in-out, z-index 0.2s ease-in-out'
			onClose={onClose}
		>
			<div className='action-sheet__list'>
				{
					title !== null ?
					<div className='action-sheet__list__title'>
						{title}
					</div> : null
				}
				{children}
			</div>
			{cancelTitle !== null ? <ActionSheetButton cancel title={cancelTitle} onClick={cancel} /> : null}
		</ActionSheetReact>
	);
}

//<Button title="Cerrar sesíon" backgroundColor='#efeef1' color='var(--dark-red)' />
//<Button title="Cancelar" backgroundColor='white' color='var(--dark-yellow)'/>