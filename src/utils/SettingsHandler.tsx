type SettingsTemplateItem = {
	name: string,
	type: string,
	default: any
}

class SettingsHandler {
	template: SettingsTemplateItem[];
	settings: any;

	constructor(){
		this.template = [
			{
				name: 'autoTheme',
				type: 'boolean',
				default: true
			},
			{
				name: 'checkMistakes',
				type: 'boolean',
				default: true
			},
			{
				name: 'advancedHighlight',
				type: 'boolean',
				default: false
			},
			{
				name: 'showPossibleValues',
				type: 'boolean',
				default: false
			},
			{
				name: 'autoRemoveCandidates',
				type: 'boolean',
				default: true
			},
			{
				name: 'clearColorOnInput',
				type: 'boolean',
				default: true
			},
			{
				name: 'autoChangeInputLock',
				type: 'boolean',
				default: false
			},
			{
				name: 'lockCellsWithColor',
				type: 'boolean',
				default: true
			},
			{
				name: 'autoSolveCellsWithColor',
				type: 'boolean',
				default: false
			},
			{
				name: 'autoSolveCellsFullNotation',
				type: 'boolean',
				default: false
			},
			{
				name: 'autoSolveOnlyInBox',
				type: 'boolean',
				default: false
			},
			{
				name: 'autoSolveNakedSingles',
				type: 'boolean',
				default: false
			},
			{
				name: 'killerAutoSolveLastInCage',
				type: 'boolean',
				default: false
			},
			{
				name: 'clearColorFullNotation',
				type: 'boolean',
				default: false
			},
			{
				name: 'highlightCandidatesWithColor',
				type: 'boolean',
				default: false
			},
			{
				name: 'highContrastGrid',
				type: 'boolean',
				default: true
			}
		]

		this.settings = {}
		let data = localStorage.getItem('settings')
		data = data ? JSON.parse(data) : null

		if (data){
			//Add valid entries to settings
			Object.entries(data).forEach(v => {
				if (this.template.map(x => x.name).includes(v[0]) && typeof v[1] === this.template.find(x => x.name === v[0])?.type){
					this.settings[v[0]] = v[1]
				}
			})
			//Add missing entries
			this.template.map(x => x.name).filter(x => !(Object.entries(this.settings).map(x => x[0]).includes(x))).forEach(k => {
				this.settings[k] = this.template.find(x => x.name === k)?.default
			})
		} else {
			for (const t of this.template) this.settings[t.name] = t.default
		}
		this.saveSettings()
	}

	setSetting(name: string, value: any){
		this.settings[name] = value
		this.saveSettings()
	}

	saveSettings(){
		localStorage.setItem('settings', JSON.stringify(this.settings))
	}
}

export default new SettingsHandler()
