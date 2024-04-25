import { App, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// import log from './log.js';
import BrowserView, { BROWSER_VIEW } from './browser.js';

// type LogLevel = keyof typeof log;

// export const config: State<{ logLevel: LogLevel }> = new State({
//     logLevel: 'info' as LogLevel
// });

// export default async function main(argv: string[]): Promise<boolean> {
//     const logLevel = Format.oneOf(Object.keys(log) as LogLevel[], false);
    
//     for (const { current: i, skip: next } of iterSync.peekable(argv))
//         if (i == '--log-level')
//             config.setState({ logLevel: logLevel(next()) });

//     return true;
// }

export interface BrowserSettings {}
export const default_settings: BrowserSettings = {};

export default class Browser extends Plugin {
    settings: BrowserSettings = default_settings;

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new BrowserSettingsTab(this.app, this));
        this.registerView(BROWSER_VIEW, leaf => new BrowserView(leaf, leaf.getViewState().state.url));

        this.addCommand({
            id: "open-new-browser-tab",
            name: "New Browser Tab",
            callback: async () => await this.app.workspace.getLeaf(true).setViewState({ type: BROWSER_VIEW, active: true })
        });

        this.addCommand({
            id: "duplicate-browser-tab",
            name: "Duplicate Browser Tab",
            callback: async () => {
                const url = this.app.workspace.getActiveViewOfType(BrowserView)?.getUrl();
                await this.app.workspace.getLeaf(true)
                    .setViewState({ 
                        type: BROWSER_VIEW, 
                        active: true,
                        state: { url }
                    });
            }
        })
    }

    async loadSettings() {
		this.settings = Object.assign({}, default_settings, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

export class BrowserSettingsTab extends PluginSettingTab {
    constructor(app: App, private plugin: Browser) {
        super(app, plugin);
    }

    display() {
		this.containerEl.empty();
        new Setting(this.containerEl)
            .setName("Make default browser")
            .setDesc("Whether Obsidian Browser should be used as the system's default browser (All links will be opened in Obsidian)")
            .addButton(btn => btn
                .setButtonText("Make Default")
                .onClick(e => new Notice("Setting Default Browser")))
    }
}