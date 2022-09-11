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
			{
				name: 'autoSolveOnlyInQuadrant',
				translation: 'Solucionar celda si es el único candidato en el cuadrante',
				type: 'boolean',
				default: false
			},
			{
				name: 'autoSolveNakedSingles',
				translation: "Solucionar celda si es un 'Naked Single'",
				type: 'boolean',
				default: false
			},
		]

		this.settings = {}
		let data = localStorage.getItem('settings')
		data = data ? JSON.parse(data) : null

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

	setSetting(name, value){
		this.settings[name] = value
		this.saveSettings()
	}

	saveSettings(){
		localStorage.setItem('settings', JSON.stringify(this.settings))
	}
}

export default new SettingsHandler()