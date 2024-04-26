import { Command, ItemView, Menu, TextComponent, ViewStateResult, WorkspaceLeaf, apiVersion } from "obsidian";
import type { WebviewTag } from 'electron';
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
    webview: WebviewTag = null as any;
    favicon: string[]= [];
    title: string = '';

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
        return 'New Browser Tab';
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

        this.webview.addEventListener("did-navigate", e => this.didNavigate(e.url));
        this.webview.addEventListener("did-navigate-in-page", e => this.didNavigate(e.url));
        this.webview.addEventListener("page-title-updated", e => {
            this.title = e.title;
            this.updateTab();
        });
        this.webview.addEventListener("page-favicon-updated", e => {
            this.favicon = e.favicons;
            this.updateTab();
        });

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

    updateTab() {
        // only update the tab title if we're the active tab
        if (!this.containerEl.closest('.workspace-leaf.mod-active'))
            return;

        const tab = this.containerEl.closest('.workspace-tabs')?.querySelector('.workspace-tab-header.is-active.mod-active')

        const icon = tab?.querySelector('.workspace-tab-header-inner-icon') as HTMLElement | null;
        const title = tab?.querySelector('.workspace-tab-header-inner-title') as HTMLElement | null;
        
        if (this.favicon[0]) {
            const img = document.createElement('img');
            img.classList.add('favicon');
            img.setAttr('src', this.favicon[0]);
            icon?.replaceChildren(img);
        } else {
            const img = document.createElement('svg');
            img.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-file"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>'
            icon?.replaceChildren(img);
        }

        if (title)
            title.innerText = this.title;
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
            await this.webview.loadURL(url.href);

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

        menu.addSeparator();

        menu.addItem(item => item
            .setTitle("Zoom In")
            .onClick(_ => this.webview.setZoomLevel(this.webview.getZoomLevel() + 0.2)));

        menu.addItem(item => item
            .setTitle("Reset Zoom")
            .onClick(_ => this.webview.setZoomLevel(0)));

        menu.addItem(item => item
            .setTitle("Zoom Out")
            .onClick(_ => this.webview.setZoomLevel(this.webview.getZoomLevel() - 0.2)));
    }
}