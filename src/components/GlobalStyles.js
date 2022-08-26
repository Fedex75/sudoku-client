import { createGlobalStyle} from 'styled-components'
export const GlobalStyles = createGlobalStyle`
  :root {
    --theme-color: #4b7bec;
    --red: #fc5c65;
    --green: #26de81;
  }  

  html, body, #root {
		margin: 0;
		width: 100%;
		height: 100%;
		font-family: sans-serif;
		user-select: none;
		touch-action: manipulation;
	}

  #root {
    background-color: ${({ theme }) => theme.background};
  }

  body {
		position: fixed;
		user-select: none;
	}

	a {
		text-decoration: none;
	}

	p {
		margin: 0;
	}

  .main-loading-screen {
    display: grid;
    place-items: center;
    height: 100%;
    background-color: ${({ theme }) => theme.background};
  }

  /*Button*/

  .button {
    display: grid;
    place-items: center;
    padding: 7px 0;
    border-radius: 15px;
    font-size: 22px;
  }

  .button.disabled {
    filter: brightness(80%);
  }

  .button.ghost {
    height: fit-content;
    font-size: 16px;
    padding: 5px 20px;
    margin-bottom: 0;
  }

  /*Section*/

  .section {
    display: grid;
    grid-template-rows: fit-content(0) auto fit-content(0);
    grid-template-areas:
      "top"
      "center"
      "bottom";
    background-color: var(--light-gray);
    height: 100%;
    padding-bottom: 20px;
    box-sizing: border-box;
  }

  .section__content {
    grid-area: center;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
  }

  .topbar {
    grid-area: top;
    display: flex;
    flex-flow: column;
    align-items: center;
    justify-content: center;
    background-color: ${({ theme }) => theme.topbarBackgroundColor};
    padding-right: 10px;
    height: 44px;
  }

  .topbar__top {
    display: grid;
    grid-template-columns: fit-content(0) auto fit-content(0);
    grid-template-areas: "back title buttons";
    align-items: center;
    /*min-height: 48px;*/
    width: 100%;
  }

  .topbar__top.subtitle {
    grid-template-rows: fit-content(0) fit-content(0);
    grid-template-areas:
      "back title buttons"
      "back subtitle buttons";
  }

  .topbar__top__back {
    grid-area: back;
    display: grid;
    place-items: center;
    padding: 10px;
    height: 44px;
    box-sizing: border-box;
  }

  .topbar__top__back {
    font-size: 20px;
  }

  .topbar__bottom {
    width: 100%;
  }

  .topbar__title {
    grid-area: title;
    color: ${({ theme }) => theme.topbarFontColor};
  }

  .topbar__top.subtitle .topbar__title {
    font-size: 16px;
  }

  .topbar__subtitle {
    grid-area: subtitle;
    color: ${({ theme }) => theme.topbarFontColor};
  }

  .topbar__top.subtitle .topbar__subtitle {
    font-size: 16px;
  }

  .topbar__buttons {
    grid-area: buttons;
    display: flex;
    gap: 20px;
    white-space: nowrap;
  }

  .topbar__buttons__button {
    color: var(--theme-color);
    font-size: 24px;
  }

  /*Action Sheet*/

  .action-sheet__list {
    display: flex;
    flex-flow: column;
    margin-bottom: 10px;
  }

  .action-sheet__list__title {
    display: grid;
    place-items: center;
    border-radius: 15px 15px 0 0;
    background-color: ${({ theme }) => theme.actionSheetButtonBackground};
    color: ${({ theme }) => theme.secondaryTextColor};
    padding: 10px;
    text-align: center;
  }

  .action-sheet__list .action-sheet__button {
    border-radius: 0;
  }

  .action-sheet__button {
    display: grid;
    place-items: center;
    font-size: 22px;
    border-radius: 15px;
    padding: 14px 0;
    border-top: solid 1px ${({ theme }) => theme.actionSheetButtonBorder};
    background-color: ${({ theme }) => theme.actionSheetButtonBackground};
  }

  .action-sheet__button.cancel {
    border-top: none;
    background-color: ${({ theme }) => theme.actionSheetCancelBackground};
    margin-bottom: 10px;
  }

  .action-sheet__button:first-child {
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;
  }

  .action-sheet__button:last-child {
    border-bottom-left-radius: 15px;
    border-bottom-right-radius: 15px;
  }

  /*Home*/

  #home {
    display: grid;
    grid-template-rows: fit-content(0) auto;
    padding: 10px;
  }
  
  .home__grid {
    display: grid;
    grid-template-columns: auto auto;
    grid-template-rows: auto auto;
    gap: 20px;
  }
  
  .home__grid__item {
    display: grid;
    grid-template-rows: auto fit-content(0);
    justify-content: center;
    background-color: ${({ theme }) => theme.homeGridBackground};
    border-radius: 20px;
    padding: 10px;
    padding-top: 15px;
    box-sizing: border-box;
    box-shadow: ${({ theme }) => theme.homeGridShadow};
  }

  .home__grid__item__icon-wrapper {
    display: grid;
    place-items: center;
  }

  .home__grid__item__icon-wrapper__icon {
    font-size: 60px;
    color: ${({ theme }) => theme.homeGridIconColor};
  }

  .home__grid__item__title {
    color: ${({ theme }) => theme.primaryTextColor};
    text-align: center;
    font-size: 18px;
    margin-top: 5px;
  }

  .home__continue-wrapper {
    display: flex;
    flex-flow: column;
    justify-content: flex-end;
    width: 100%;
  }

  .home__continue-wrapper__subtitle {
    color: ${({ theme }) => theme.primaryTextColor};
    text-align: center;
    font-size: 18px;

  }

  .edit-buttons__button {
    display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 10px;
		width: 100%;
		height: 100%;
		cursor: pointer;
    color: ${({ theme }) => theme.editButtonColor};
    background-color: ${({ theme }) => theme.editButtonBackground};
  }

  .edit-buttons__button.highlight {
		background-color: #4b7bec;
		color: white;
	}

	.edit-buttons__button.yellow {
		background-color: #fed330;
		color: white;
	}

	.edit-buttons__button:hover {
		background-image: linear-gradient(rgba(0, 0, 0, 0.1) 0 0);
	}

	.edit-buttons__button__icon {
		font-size: 35px;
	}

  .numpad {
		grid-area: numpad;
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr;
		grid-template-rows: 1fr 1fr 1fr 1fr;
		padding: 0 10px;
		gap: 7px;
	}

	.numpad__button {
    position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		color: #4b7bec;
		font-size: 50px;
		border-radius: 10px;
		cursor: pointer;
	}

  .numpad__button:hover {
		background-image: linear-gradient(rgba(0, 0, 0, 0.1) 0 0);
	}

  .numpad__button.number {
    background-color: ${({ theme }) => theme.numpadButtonBackground};
  }

  .numpad__button.disabled {
    background-color: ${({ theme }) => theme.disabledButtonBackground};
    border-color: ${({ theme }) => theme.disabledButtonBorderColor};
    border-style: solid;
		border-width: 1px;
		cursor: default;
  }

  .numpad__button.disabled:hover {
		background-image: none;
	}

  .numpad__button.hidden {
		visibility: hidden;
	}

  .numpad__button.locked {
    border-width: 1px;
		border-style: solid;
		color: white;
    background-color: ${({ theme }) => theme.lockedButtonBackgroundColor};
    border-color: ${({ theme }) => theme.lockedButtonBorderColor};
  }

  .numpad__button.color {
    color: white;
  }

  #sudoku {
		display: flex;
		justify-content: center;
		align-items: flex-start;
		width: calc(100% - 6px);
		padding-left: 3px;
	}

	.game {
		display: grid;
		grid-template-columns: auto;
		grid-template-rows: fit-content(0) auto;
		grid-template-areas:
			"sudoku"
			"numpad";
    gap: 10px;
	  width: 100%;
    height: 100%;
	}

	.sudoku {
		grid-area: sudoku;
		display: flex;
		justify-content: center;
		align-items: center;
	}

  .canvas__wrapper {
    width: 100%;
  }

	.sudoku__win-screen-wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 100%;
	}

	.sudoku__win-screen {
		display: flex;
    flex-flow: column;
		justify-content: center;
    width: 100%;
    padding: 20px;
	}

  .sudoku__win-screen__title {
    grid-area: title;
		text-align: center;
		color: white;
		font-size: 30px;
    color: ${({ theme }) => theme.primaryTextColor};
    margin-bottom: 15px;
  }

  .bookmark-off {
    color: ${({ theme }) => theme.bookmarkOffColor};
  }

  .bookmark-on {
    color: ${({ theme }) => theme.bookmarkOnColor};
  }

  #settings {
    margin-top: 10px;
    padding: 0 10px 10px 10px;
		overflow-y: scroll;
	}

	.settings {
		padding-top: 40px;
	}

	.settings__list {
		display: flex;
		flex-flow: column;
	}

  .settings__item {
    display: grid;
		grid-template-columns: auto fit-content(0);
		padding: 15px 25px;
		border-width: 1px 1px 0px 1px;
		border-style: solid;
		align-items: center;
    background-color: ${({ theme }) => theme.settingsItemBackground};
    border-color: ${({ theme }) => theme.settingsItemBorder};
  }

  settings__item:first-child {
		border-top-left-radius: 10px;
		border-top-right-radius: 10px;
	}

	.settings__item:last-child {
		border-bottom-left-radius: 10px;
		border-bottom-right-radius: 10px;
		border-width: 1px 1px 1px 1px;
	}

	.settings__item__title {
		font-size: 20px;
		margin-right: 40px;
    color: ${({ theme }) => theme.settingsItemTitleColor};
	}

  .settings__version {
    text-align: center;
    margin-top: 10px;
    color: ${({ theme }) => theme.primaryTextColor};
  }

  .bookmarks__wrapper {
    display: flex;
    flex-flow: column;
    gap: 20px;
    padding: 10px;
    margin-top: 10px;
    overflow-y: scroll;
  }

  .bookmarks__item {
    display: flex;
    flex-flow: column;
    background-color: ${({ theme }) => theme.homeGridBackground};
    padding: 10px;
    border-radius: 20px;
  }

  .bookmarks_item__top {
    display: grid;
    grid-template-columns: auto fit-content(0) fit-content(0);
    gap: 10px;
    margin-bottom: 10px;
    font-size: 20px;
  }

  .bookmarks__item__top__title {
    color: ${({ theme }) => theme.primaryTextColor};
  }

  .bookmarks__item__canvas-wrapper {
    display: grid;
    place-items: center;
  }

  .bookmarks__empty {
    display: flex;
    flex-flow: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: ${({theme}) => theme.bookmarksEmptyColor};
  }
`