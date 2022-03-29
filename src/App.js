import React, {useState, useEffect} from 'react';
import { Route } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import Settings from './components/Settings';
import Sudoku from './components/Sudoku';
import './utils/SettingsHandler';
import UserButton from './components/UserButton';
import Modal from 'react-modal/lib/components/Modal';
import { Link } from 'react-router-dom';
import eventBus from "./components/EventBus";
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from "./components/GlobalStyles";
import ThemeHandler from './utils/ThemeHandler';
import ThemeSwitch from './components/ThemeSwitch';

function App() {
  const [loading, setLoading] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [theme, setTheme] = useState(ThemeHandler.themeName);

	const customStyles = {
		overlay: {
			position: 'fixed',
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			backgroundColor: ThemeHandler.theme.modalOverlayBackground,
		},
		content: {
			display: 'flex',
			flexFlow: 'column',
			justifyContent: 'center',
			alignItems: 'center',
			gap: '20px',
			top: 0,
			left: 0,
			padding: 0,
			width: '100%',
			height: '100%',
			backgroundColor: ThemeHandler.theme.modalOverlayBackground,
			border: 'none',
		}
	};

	function themeToggler(){
		ThemeHandler.toggleTheme();
		setTheme(ThemeHandler.themeName);
	}

  function closeModal() {
    setIsModalOpen(false);
  }

	useEffect(() => {
		/*Auth.checkSession().then(authenticated => {
			if (authenticated){
				setLoading(false);
			} else {
				//window.location.replace(Auth.authRedirect + '&continue=' + encodeURIComponent('https://sudoku.zaifo.com.ar/overview'))
        setLoading(false);
			}
		});*/

		//window.screen.orientation.lock('portrait');

		eventBus.on("openModal", () => {
      setIsModalOpen(true);
		});

		return () => {
			eventBus.remove("openModal");
		};
	}, []);

	if (loading){
		return <></>  //TODO: add reactloading
	}
  
  return (
		<ThemeProvider theme={ThemeHandler.theme}>
			<>
				<GlobalStyles />
				<BrowserRouter>
					<Route exact path="/">
						<Sudoku themeName={theme} toggleTheme={themeToggler} theme={ThemeHandler.theme}/>
					</Route>
					<Route exact path="/settings">
						<Settings themeName={theme} toggleTheme={themeToggler}/>
					</Route>
					<Modal
						isOpen={isModalOpen}
						onRequestClose={closeModal}
						style={customStyles}
						contentLabel="Example Modal"
					>
						<div style={{padding: 10, position: 'absolute', top: 0, left: 0}} onClick={closeModal}>
							<i className='fas fa-times' style={{fontSize: '30px', color: ThemeHandler.theme.navbarFontColor}}></i>
						</div>
						<Link to="/"><div onClick={closeModal} style={{color: ThemeHandler.theme.navbarFontColor, fontSize: '20px'}}>Sudoku</div></Link>
						<Link to="/settings"><div onClick={closeModal} style={{color: ThemeHandler.theme.navbarFontColor, fontSize: '20px'}}>Opciones</div></Link>
						<ThemeSwitch themeName={theme} toggleTheme={themeToggler} />
						<UserButton />
					</Modal>
				</BrowserRouter>
			</>
		</ThemeProvider>
  );
}

export default App;
