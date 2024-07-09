import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import GameHandler from "../../utils/GameHandler";
import Numpad from "../../components/numpad/Numpad";
import ClassicCanvas from "./ClassicCanvas";
import { BoardAnimation, CanvasRef, CellCoordinates, MouseButtonType, ThemeName } from "../../utils/DataTypes";
import { Navigate } from "react-router";
import { AccentColor } from "../../utils/Colors";
import SettingsHandler from "../../utils/SettingsHandler";
import { isTouchDevice } from "../../utils/isTouchDevice";

type Props = {
	theme: ThemeName;
	accentColor: AccentColor;
	paused: boolean;
	handleComplete: () => void;
};

const ClassicGame = forwardRef(({ theme, accentColor, paused, handleComplete }: Props, ref) => {
	const [noteMode, setNoteMode] = useState(isTouchDevice); //If it's a touch device, start with notes on, otherwise off
	const [noteDragMode, setNoteDragMode] = useState<boolean | null>(null);
	const [showLinks, setShowLinks] = useState(false);
	const [lockedInput, setLockedInput] = useState(0);
	const [showColors, setShowColors] = useState(false);

	const [colorMode, setColorMode] = useState(false);
	const [selectMode, setSelectMode] = useState(false);
	const [selectedCellBeforeSelectMode, setSelectedCellBeforeSelectMode] = useState<CellCoordinates | null>(null);

	const [possibleValues, setPossibleValues] = useState<number[]>([]);
	const [completedNumbers, setCompletedNumbers] = useState<number[]>([]);

	const [render, setRender] = useState(0);

	const canvasRef = useRef<CanvasRef>(null);

	useImperativeHandle(ref, () => ({
		timerClick() {
			canvasRef.current?.stopAnimations()
			if (paused) {
				canvasRef.current?.doAnimations([{ type: 'fadein' }])
			} else {
				canvasRef.current?.doAnimations([{ type: 'fadeout' }])
			}
		}
	}));

	function onCanvasClick(coords: CellCoordinates, type: MouseButtonType, hold: boolean) {
		if (!GameHandler.game || !canvasRef.current) return;

		let animations: BoardAnimation[] = [];

		const cell = GameHandler.game.get(coords);
		const cellPossibleValues = GameHandler.game.possibleValues[coords.x][coords.y];

		if (selectMode){
			GameHandler.game.selectCell(coords);
		} else if (type === 'tertiary'){
			handleSetColor(coords);
		} else {
			if (lockedInput === 0){
				GameHandler.game.selectedCells = [coords];
				if (cell.value > 0 && SettingsHandler.settings.autoChangeInputLock && GameHandler.game.mode === 'classic') setLockedInput(cell.value);
			} else {
				if (hold){
					if (cellPossibleValues.includes(lockedInput)){
						if ((noteMode || type === 'secondary') && (cellPossibleValues.length > 1 || !SettingsHandler.settings.autoSolveNakedSingles)){
							if (cell.notes.includes(lockedInput) !== noteDragMode || GameHandler.game.onlyAvailableInBox(coords, lockedInput)) [, animations] = GameHandler.game.setNote([coords], lockedInput);
						} else {
							if (cell.value === 0) animations = GameHandler.game.setValue([coords], lockedInput);
						}
					}
				} else {
					GameHandler.game.selectedCells = [coords];
					if (cell.value > 0){
						setLockedInput(li => cell.value === li ? 0 : cell.value);
					} else {
						if ((noteMode || type === 'secondary')){
							if (SettingsHandler.settings.autoSolveNakedSingles && cellPossibleValues.length === 1){
								if (cellPossibleValues.includes(lockedInput)) animations = GameHandler.game.setValue([coords], lockedInput);
							} else {
								if (cell.notes.includes(lockedInput) || cellPossibleValues.includes(lockedInput)){
									let newNoteMode;
									[newNoteMode, animations] = GameHandler.game.setNote([coords], lockedInput);
									setNoteDragMode(newNoteMode);
								}
							}
						} else {
							if (cellPossibleValues.includes(lockedInput)) animations = GameHandler.game.setValue([coords], lockedInput);
						}
					}
				}
			}
		}

		updatePossibleValues();

		if (animations.length > 0){
			canvasRef.current?.doAnimations(animations);
			if (animations[0].type === 'board') handleComplete();
		}

		setRender(r => r === 100 ? 0 : r + 1);
	}

	function onUndo() {
		if (GameHandler.complete || !GameHandler.game || !canvasRef.current) return;

		GameHandler.game.popBoard();
		canvasRef.current.stopAnimations();
		updatePossibleValues();
		setRender(r => r === 100 ? 0 : r + 1);
	}

	function onErase() {
		if (GameHandler.complete || !GameHandler.game || !canvasRef.current) return;
		GameHandler.game.erase(GameHandler.game.selectedCells);
		updatePossibleValues();
		canvasRef.current.stopAnimations();
		setRender(r => r === 100 ? 0 : r + 1);
	}

	function onNote() {
		setNoteMode(n => !n);
	}

	function onHint() {

	}

	function onMagicWand() {
		if (selectMode){
			//Auto color selected cells
			//This is actually a bit more involved than it seems
			//I should change the color system so that cells can be grouped together
			//Cells that are painted at the same time should form a group
			//This means they can be locked and auto-solved if permitted
		} else {
			setShowLinks(s => !s);
		}
	}

	function onSelect() {
		if (!GameHandler.game) return;
		if (selectMode){
			setSelectMode(false);
			if (selectedCellBeforeSelectMode) GameHandler.game.selectedCells = [selectedCellBeforeSelectMode];
			else GameHandler.game.selectedCells = [];
		} else {
			setSelectMode(true);
			if (GameHandler.game.selectedCells.length > 0) setSelectedCellBeforeSelectMode(GameHandler.game.selectedCells[0]);
			else setSelectedCellBeforeSelectMode(null);
			GameHandler.game.selectedCells = [];
		}
	}

	function onColor() {
		setShowColors(c => !c);
	}

	function onColorButtonClick() {

	}

	function onNumpadButtonClick(number: number, type: MouseButtonType) {
		if (GameHandler.complete || !GameHandler.game || !canvasRef.current) return;

		let animations: BoardAnimation[] = [];

		if (type === 'primary'){
			if (possibleValues.includes(number)){
				if (noteMode && (possibleValues.length > 1 || !SettingsHandler.settings.autoSolveNakedSingles)){
					[, animations] = GameHandler.game.setNote(GameHandler.game.selectedCells, number);
				} else {
					if (lockedInput > 0) setLockedInput(number);
					animations = GameHandler.game.setValue(GameHandler.game.selectedCells, number);
				}
			}
		} else setLockedInput(li => li === number ? 0 : number);
		updatePossibleValues();

		if (animations.length > 0){
			canvasRef.current.doAnimations(animations);
			if (animations[0].type === 'board') handleComplete();
		}

		setRender(r => r === 100 ? 0 : r + 1);
	}

	function handleSetColor(coords: CellCoordinates, color = accentColor){
		if (GameHandler.complete || !GameHandler.game || !canvasRef.current) return;

		const cell = GameHandler.game.get(coords);
		//if (cell.value === 0 && cell.notes.length > 1){
		GameHandler.game.setColor(coords, cell.color !== color ? color : 'default');
		canvasRef.current.renderFrame();
		//}
	}

	function updatePossibleValues(){
		if (!GameHandler.game) return;

		let newPossibleValues: number[] = [];
		for (const c of GameHandler.game.selectedCells){
			if (noteMode && GameHandler.game.get(c).value === 0){
				for (const v of GameHandler.game.possibleValues[c.x][c.y]){
					if (!newPossibleValues.includes(v)) newPossibleValues = newPossibleValues.concat(v);
				}
			}
		}

		setPossibleValues(newPossibleValues);
		setCompletedNumbers(GameHandler.game.completedNumbers);
	}

	useEffect(() => {
		updatePossibleValues();
	}, []);

	useEffect(() => {
		canvasRef.current?.renderFrame();
	}, [render, lockedInput, showColors, showLinks, selectMode]);

	if (!GameHandler.game) return <Navigate to="/"></Navigate>;

	return (
		<div className="game">
			<div className="sudoku">
				<ClassicCanvas ref={canvasRef} onClick={onCanvasClick} showLinks={showLinks} game={GameHandler.game} lockedInput={lockedInput} theme={theme} accentColor={accentColor} paused={paused} nSquares={9} />
			</div>
			<Numpad
				onUndo={onUndo}
				onErase={onErase}
				onNote={onNote}
				onHint={onHint}
				onMagicWand={onMagicWand}
				onSelect={onSelect}
				onColor={onColor}
				onColorButtonClick={onColorButtonClick}
				onNumpadButtonClick={onNumpadButtonClick}

				noteHighlighted={noteMode}
				magicWandHighlighted={showLinks}
				selectHighlighted={selectMode}
				colorOn={showColors}

				colorMode={false}

				lockedInput={lockedInput}
				possibleValues={possibleValues}
				completedNumbers={completedNumbers}
			/>
		</div>
	);
});

export default ClassicGame;
