import Auth from "./Auth"

class SettingsHandler {
	constructor(){
		this.template = [
			{
				name: 'autoTheme',
				translation: 'Aspecto automático',
				type: 'boolean',
				default: true
			},
			{
				name: 'checkMistakes',
				translation: 'Mostrar errores',
				type: 'boolean',
				default: true
			},
			{
				name: 'advancedHighlight',
				translation: 'Señalamiento completo',
				type: 'boolean',
				default: true
			},
			{
				name: 'showPossibleValues',
				translation: 'Mostrar solo candidatos posibles',
				type: 'boolean',
				default: true
			},
			{
				name: 'autoRemoveCandidates',
				translation: 'Remover candidatos automáticamente',
				type: 'boolean',
				default: true
			},
			{
				name: 'clearColorOnInput',
				translation: 'Eliminar color al ingresar una solución',
				type: 'boolean',
				default: true
			},
			{
				name: 'autoChangeInputLock',
				translation: 'Cambiar bloqueo de entrada automáticamente',
				type: 'boolean',
				default: true
			},
			{
				name: 'lockCellsWithColor',
				translation: 'Bloquear celdas con color',
				type: 'boolean',
				default: true
			},
			{
				name: 'autoSolveCellsWithColor',
				translation: 'Solucionar celdas con color automáticamente si tienen solo un candidato',
				type: 'boolean',
				default: true
			},
			{
				name: 'autoSolveCellsFullNotation',
				translation: 'Solucionar celdas automáticamente si la notación está completa',
				type: 'boolean',
				default: true
			},
			/*{
				name: 'autoDetectPairs',
				translation: 'Detectar pares automáticamente',
				type: 'boolean',
				default: true
			}*/
		]

		this.settings = {}
		let data = null

		if (Auth.authenticated){
			//GET user settings and store in data variable
		} else {
			let cookie = document.cookie.split('; ').find(row => row.startsWith('user-settings='))
			if (cookie){
				data = JSON.parse(cookie.split('=')[1])
			}

			if (data){
				//Add valid entries to settings
				Object.entries(data).forEach(v => {
					if (this.template.map(x => x.name).includes(v[0]) && typeof v[1] === this.template.find(x => x.name === v[0]).type) this.settings[v[0]] = v[1]
				})
				//Add missing entries
				this.template.map(x => x.name).filter(x => !(Object.entries(this.settings).map(x => x[0]).includes(x))).forEach(k => {
					this.settings[k] = this.template.find(x => x.name === k).default
				})
			} else {
				for (const t of this.template) this.settings[t.name] = t.default
			}
			this.saveSettings()
		}
	}

	setSetting(name, value){
		this.settings[name] = value
		this.saveSettings()
	}

	saveSettings(){
		if (Auth.authenticated){
			//POST settings data
		} else {
			document.cookie = `user-settings=${JSON.stringify(this.settings)}; expires=Fri, 31 Dec 9999 23:59:59 GMT; SameSite=Lax; Secure`
		}
	}
}

export default new SettingsHandler()