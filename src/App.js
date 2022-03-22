import React, {useState, useEffect} from 'react';
import { Route } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import Auth from './utils/Auth';
import Settings from './components/Settings';
import Sudoku from './components/Sudoku';
import './utils/SettingsHandler';
import UserButton from './components/UserButton';
import Modal from 'react-modal/lib/components/Modal';
import { Link } from 'react-router-dom';
import eventBus from "./components/EventBus";

const customStyles = {
  overlay: {
		position: 'fixed',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: '#171719'
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
		backgroundColor: '#171719',
		border: 'none'
	}
};

function App() {
  const [loading, setLoading] = useState(!Auth.isAuthenticated());
	const [isModalOpen, setIsModalOpen] = useState(false);

  function closeModal() {
    setIsModalOpen(false);
  }

	useEffect(() => {
		Auth.checkSession().then(authenticated => {
			if (authenticated){
				setLoading(false);
			} else {
				//window.location.replace(Auth.authRedirect + '&continue=' + encodeURIComponent('https://sudoku.zaifo.com.ar/overview'))
        setLoading(false);
			}
		});
		eventBus.on("openModal", () => {
      setIsModalOpen(true);
		});

		return () => {
			eventBus.remove("openModal");
		};
	}, []);

	if (loading){
		return <></>
	}
  
  return (
		<div className='app'>
			<BrowserRouter>
				<Route exact path="/">
					<Sudoku/>
				</Route>
				<Route exact path="/settings">
					<Settings/>
				</Route>
				<Modal
					isOpen={isModalOpen}
					onRequestClose={closeModal}
					style={customStyles}
					contentLabel="Example Modal"
				>
					<div style={{padding: 10, position: 'absolute', top: 0, left: 0}} onClick={closeModal}>
						<i className='fas fa-times' style={{fontSize: '30px', color: 'white'}}></i>
					</div>
					<Link to="/"><div onClick={closeModal} style={{color: 'white', fontSize: '20px'}}>Sudoku</div></Link>
					<Link to="/settings"><div onClick={closeModal} style={{color: 'white', fontSize: '20px'}}>Opciones</div></Link>
					<UserButton />
				</Modal>
			</BrowserRouter>
		</div>
  );
}

export default App;
