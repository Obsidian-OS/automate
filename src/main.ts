import { App, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// import log from './log.js';
import BrowserView, { BROWSER_VIEW } from './browser.js';
import { Url } from 'node:url';

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

export interface BrowserSettings {
    searchEngines: { [name in string]: { href: string, query: string } },
    defaultSearchEngine: keyof BrowserSettings['searchEngines'],
    home: string
}
export const default_settings: BrowserSettings = {
    searchEngines: {
        Google: {
            href: 'https://www.google.com/search',
            query: 'q'
        },
    },
    defaultSearchEngine: 'Google',
    home: 'https://www.google.com/'
};

export default class Browser extends Plugin {
    settings: BrowserSettings = default_settings;

    next_url: string[] = [];

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new BrowserSettingsTab(this.app, this));
        this.registerView(BROWSER_VIEW, leaf => new BrowserView(leaf, this.next_url.pop(), this.settings));

        this.addCommand({
            id: "open-new-browser-tab",
            name: "New Browser Tab",
            callback: async () => await this.app.workspace.getLeaf(true).setViewState({ type: BROWSER_VIEW, active: true })
        });

        this.addCommand({
            id: "duplicate-browser-tab",
            name: "Duplicate Browser Tab",
            callback: async () => await this.openViewWithURL(this.app.workspace.getActiveViewOfType(BrowserView)?.getUrl()),
            // checkCallback: () => this.app.workspace.getActiveViewOfType(BrowserView) instanceof BrowserView
        })
    }

    async openViewWithURL(url?: string) {
        if (url)
            this.next_url.push(url);

        await this.app.workspace.getLeaf(true)
            .setViewState({ 
                type: BROWSER_VIEW, 
                active: true,
            });
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

        new Setting(this.containerEl)
            .setName("Home Page")
            .setDesc("Where should the browser start off")
            .addText(cb => cb
                .setValue(this.plugin.settings.home)
                .onChange(url => this.plugin.settings.home = url));

        new Setting(this.containerEl)
            .setName("Search Engine")
            .setDesc("Which search engine should be used as default")
            .addDropdown(dd => {
                Object.keys(this.plugin.settings.searchEngines).forEach(engine => dd.addOption(engine, engine));

                dd.setValue(this.plugin.settings.defaultSearchEngine);
                dd.addOption('', 'Add new search engine');

                dd.onChange(engine => {
                    console.log(engine, engine in this.plugin.settings.searchEngines);

                    if (engine in this.plugin.settings.searchEngines)
                        this.plugin.settings.defaultSearchEngine = engine;

                    else {
                        new PromptSearchEngineSettings(this.app, this.plugin).open();
                        this.display();
                    }
                });
            });
    }
}

export class PromptSearchEngineSettings extends Modal {
    private name: string = '';
    private href: string = '';
    private q: string = '';

    constructor(app: App, private plugin: Browser) {
        super(app);
    }

    onOpen(): void {
        new Setting(this.contentEl)
            .setName("Name")
            .setDesc("Give your search engine a name")
            .addText(text => text.onChange(name => this.name = name));

        new Setting(this.contentEl)
            .setName("HREF")
            .setDesc("The HTTP path that search queries should be sent to")
            .setTooltip("For example, google searches appear like this: 'https://www.google.com/search?q=search+query'. Only provide the path section here: 'http://www.google.com/search'")
            .addText(text => text.onChange(href => this.href = href));

        new Setting(this.contentEl)
            .setName("Query Parameter")
            .setDesc("The query parameter which will encode the search query")
            .setTooltip("For Google: 'https://www.google.com/search?q=search+query', provide 'q'")
            .addText(text => text.onChange(q => this.q = q));

        new Setting(this.contentEl)
            .addButton((btn) =>
              btn
                .setButtonText("Save")
                .setCta()
                .onClick(() => {
                    this.close();
                    this.plugin.settings.searchEngines[this.name] = { query: this.q, href: this.href };
                    this.plugin.settings.defaultSearchEngine = this.name;
                }));
    }
}