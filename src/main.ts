import { App, Plugin, Setting, Notice, PluginSettingTab, SettingTab } from 'obsidian';

import SettingsTab, { Settings, default_settings } from "./settings.js";

export default class Runner extends Plugin {
    settings: SettingTab | null = null;

    async onload() {
        await this.loadSettings();
        this.addSettingTab(this.settings = new SettingsTab(this.app, this));
    }

    async loadSettings() {
		this.settings?.load(await this.loadData());
	}

	async saveSettings() {
        await this.saveData(this.settings?.get());
	}
}


