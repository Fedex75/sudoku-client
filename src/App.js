import React, {useState, useEffect} from 'react';
import { Route } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import Auth from './Auth';
import Settings from './components/Settings';
import Sudoku from './components/Sudoku';

function App() {
  const [loading, setLoading] = useState(!Auth.isAuthenticated());

	useEffect(() => {
		Auth.checkSession().then(authenticated => {
			if (authenticated){
				setLoading(false);
			} else {
				//window.location.replace(Auth.authRedirect + '&continue=' + encodeURIComponent('https://sudoku.zaifo.com.ar/overview'))
        setLoading(false);
			}
		});
	}, []);

	if (loading){
		return <></>
	}
  
  return (
    <div className="App">
      <BrowserRouter>
        <Route exact path="/">
          <Sudoku/>
        </Route>
				<Route exact path="/settings">
					<Settings/>
				</Route>
      </BrowserRouter>
    </div>
  );
}

export default App;
