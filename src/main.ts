import {App, Plugin, PluginManifest, Command} from 'obsidian';

import SettingsTab, {default_settings, Settings} from "./settings.js";

export let app: App;

export default class Runner extends Plugin {
    settingsTab: SettingsTab | null = null;
    settings: Settings = default_settings;

    static app: () => App;

    constructor(app: App, manifest: PluginManifest) {
        super(app, manifest);

        Runner.app = () => app;
    }

    async onload() {
        app = this.app;

        this.settings = await this.loadData() ?? default_settings;

        this.addSettingTab(this.settingsTab = new SettingsTab(this.app, this));
    }

    async onunload() {
        await this.saveData(this.settings);
    }
}


