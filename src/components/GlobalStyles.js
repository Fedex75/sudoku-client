import { createGlobalStyle} from 'styled-components'
export const GlobalStyles = createGlobalStyle`
  #root {
    background-color: ${({ theme }) => theme.background};
  }

  .main-loading-screen {
    display: grid;
    place-items: center;
    background-color: ${({ theme }) => theme.background};
  }

  .navbar {
    color: ${({ theme }) => theme.navbarFontColor};
  }

  .navbar__user-wrapper__settings i {
    color: ${({ theme }) => theme.navbarFontColor};
  }

  .navbar__user-wrapper__login-button {
    color: ${({ theme }) => theme.navbarFontColor};
    border-color: ${({ theme }) => theme.loginButtonBorderColor};
  }

  .edit-buttons__button {
    color: ${({ theme }) => theme.editButtonColor};
    background-color: ${({ theme }) => theme.editButtonBackground};
  }sudoku__loading-screen

  .numpad__button.number {
    background-color: ${({ theme }) => theme.numpadButtonBackground};
  }

  .numpad__button.disabled {
    background-color: ${({ theme }) => theme.disabledButtonBackground};
    border-color: ${({ theme }) => theme.disabledButtonBorderColor};
  }

  .numpad__button.loplace-items: center;

  .sudoku__win-screen__title {
    color: ${({ theme }) => theme.navbarFontColor};
  }

  .new-game-menu__list {
    background-color: ${({ theme }) => theme.gameMenuListBackground};
    box-shadow: ${({ theme }) => theme.gameMenuListShadow};
    border: ${({ theme }) => theme.gameMenuListBorder};
  }

  .menu-button {
    border-top-color: ${({ theme }) => theme.menuButtonBorderColor};
    color: ${({ theme }) => theme.menuButtonColor};
  }

  .new-game-menu__mode-selector {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    justify-content: center;
    padding: 10px;
  }
  
  .new-game-menu__mode-selector__item {
    display: grid;
    place-items: center;
    border-style: solid;
    border-width: 1px;
    border-color: ${({theme}) => theme.modeSelectorBorderColor};
    border-radius: 5px;
    color: ${({theme}) => theme.modeSelectorColor};
    padding: 5px;
    cursor: pointer;
  }

  .new-game-menu__mode-selector__item.selected {
    border-color: ${({theme}) => theme.modeSelectorSelectedBorderColor};
    background-color: ${({theme}) => theme.modeSelectorSelectedBorderColor};
    color: white;
  }

  .menu-button:hover {
    color: ${({ theme }) => theme.menuButtonHoverColor};
    background-color: ${({ theme }) => theme.menuButtonHoverBackground};
  }

  .settings__item {
    background-color: ${({ theme }) => theme.settingsItemBackground};
    border-color: ${({ theme }) => theme.settingsItemBorder};
  }

  .settings__item__title {
    color: ${({ theme }) => theme.settingsItemTitleColor};
  }

  .menu-button.cancel {
    background-color: ${({ theme }) => theme.cancelButtonBackround};
    font-weight: ${({ theme }) => theme.cancelButtonFontWeight};
  }

  @media only screen and (max-width: 880px) {
    .new-game-menu__list {
      border: ${({ theme }) => theme.mobile__gameMenuListBorder};
    }

    .menu-button {
      color: ${({ theme }) => theme.mobile__menuButtonColor};
      border-top-color: ${({ theme }) => theme.mobile__menuButtonBorderColor};
    }
  }
`