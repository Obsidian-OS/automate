import { Command, ItemView, Menu, TextComponent, ViewStateResult, WorkspaceLeaf, apiVersion } from "obsidian";
import pkg from '../package.json' assert { type: 'json' };
import oos from '../../manifest.json' assert { type: 'json' };
import { BrowserSettings } from "./main.js";

export const BROWSER_VIEW = "browser-view";

export interface BrowserViewState {
    url: string
}

export default class BrowserView extends ItemView implements BrowserViewState {
    url_bar: TextComponent = null as any;
    pretty: HTMLDivElement = null as any;
    webview: HTMLElement = null as any;

    constructor(leaf: WorkspaceLeaf, public url: string = '', private settings: BrowserSettings) {
        super(leaf)
    }

    getState(): BrowserViewState {
        return {
            url: this.url
        }
    }

    async setState(state: BrowserViewState, result: ViewStateResult) {
        Object.assign(this, state);
        return super.setState(state, result);
    }

    getViewType(): string {
        return BROWSER_VIEW;
    }

    getDisplayText(): string {
        return "Browser Tab";
    }
    
    public getUrl(): string {
        return this.url_bar?.getValue();
    }

    async onOpen() {
        this.contentEl.addClass("browser-tab-container");
        const container = this.containerEl.children[1];

        container.empty();

        const header = this.contentEl.parentElement?.querySelector(".view-header-title-container");
        if (header)
            this.buildHeader(header as HTMLElement);

        this.webview = container.createEl("webview" as any, {
            attr: {
                src: this.getState().url || this.settings.home,
                // useragent: `obsidian-os/${oos.version};obsidian/${apiVersion};obsidian-browser/${pkg.version}`
            },
            cls: ["browser-tab-webview"]
        });

        this.webview.addEventListener("did-navigate", e => this.didNavigate((e as any).url));
        this.webview.addEventListener("did-navigate-in-page", e => this.didNavigate((e as any).url));

        this.url_bar.inputEl.addEventListener("change", async e => await this.navigate((e.target as HTMLInputElement).value));
    }

    didNavigate(url: string) {
        this.url_bar.setValue(url);
        this.navigate(url, false);
        
        this.setState({ url }, { history: true });
    }

    buildHeader(container: HTMLElement) {
        const url_bar = document.createElement("div");
        url_bar.addClass("search-input-container");
        url_bar.addClass("url-bar");
        
        this.url_bar = new TextComponent(url_bar);
        this.url_bar.inputEl.type = "search";

        this.pretty = url_bar.createDiv({cls: "pretty-container"});

        this.url_bar.inputEl.addEventListener("focus", e => (e.target as HTMLInputElement).select());

        container.replaceWith(url_bar);
    }

    async navigate(search: string, updateUrl: boolean = true) {
        let url: URL;

        if (URL.canParse(search))
            url = new URL(search);
        
        else if (search.includes('.') && URL.canParse('http://' + search))
            url = new URL('http://' + search);
        
        else { // TODO: Move search engine to settings
            const searchEngine = this.settings.searchEngines[this.settings.defaultSearchEngine];
            url = new URL(searchEngine.href);
            url.searchParams.set(searchEngine.query, search);
        }
        
        this.url_bar.setValue(url.href);
        
        if (updateUrl)
            await (this.webview as any as { loadURL: (url: string, options?: {}) => Promise<void> }).loadURL(url.href);

        this.pretty.empty();

        this.pretty.createSpan({ text: url.protocol.slice(0, -1), cls: ['url-part', 'proto'] });
        this.pretty.createSpan({ text: url.host, cls: ['url-part', 'domain'] });
        this.pretty.createSpan({ text: url.pathname, cls: ['url-part', 'path'] });
        this.pretty.createSpan({ text: url.search.slice(1), cls: ['url-part', 'query'] });
        this.pretty.createSpan({ text: url.hash.slice(1), cls: ['url-part', 'hash'] });
    }

    onPaneMenu(menu: Menu, source: "more-options" | "tab-header" | string): void {
        super.onPaneMenu(menu, source);

        menu.addItem(item => item
            .setTitle("Duplicate Tab")
            .onClick(e => (this.app as any as {
                commands: {
                    executeCommandById: (command: string) => void
                }
            }).commands.executeCommandById('obsidian-os/browser:duplicate-browser-tab')));
    }
}