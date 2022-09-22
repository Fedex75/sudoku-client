class SettingsHandler {
	constructor(){
		this.template = [
			{
				name: 'autoTheme',
				default: true
			},
			{
				name: 'checkMistakes',
				default: true
			},
			{
				name: 'advancedHighlight',
				default: false
			},
			{
				name: 'showPossibleValues',
				default: false
			},
			{
				name: 'autoRemoveCandidates',
				default: true
			},
			{
				name: 'clearColorOnInput',
				default: true
			},
			{
				name: 'autoChangeInputLock',
				default: false
			},
			{
				name: 'lockCellsWithColor',
				default: true
			},
			{
				name: 'autoSolveCellsWithColor',
				default: false
			},
			{
				name: 'autoSolveCellsFullNotation',
				default: false
			},
			{
				name: 'autoSolveOnlyInBox',
				default: false
			},
			{
				name: 'autoSolveNakedSingles',
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