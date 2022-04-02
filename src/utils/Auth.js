import axios from 'axios';

class Auth {
	constructor(){
		this.authenticated = false;
		this.guest = false;
		this.host = 'https://sudoku.zaifo.com.ar/';
		this.authRedirect = 'https://accounts.zaifo.com.ar/signin?service=sudoku'
	}

	checkSession(){
		return new Promise((resolve, reject) => {
			try {
				axios.get(this.host + 'api/auth/session', {withCredentials: true}).then(res => {
					this.authenticated = res.data.signedIn;
					this.user = res.data.user;
					resolve(this.authenticated);
				}, {withCredentials: true});
			} catch (e){
				this.authenticated = false;
				reject();
			}
		});
	}

	isAuthenticated(){
		return this.authenticated;
	}

	setGuest(){
		this.guest = true;
	}
}

export default new Auth();
