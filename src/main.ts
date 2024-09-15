import * as vm from 'node:vm';
import {App, FuzzySuggestModal, Notice, Plugin, PluginManifest} from 'obsidian';

import SettingsTab, {default_settings, Settings} from "./settings.js";
import {JavaScript, Manual, Step, Task} from "./task.js";

export let app: App;

export default class Runner extends Plugin {
    settingsTab: SettingsTab | null = null;
    settings: Settings = default_settings;

    static app: () => App;
    static instance: () => Runner;

    constructor(app: App, manifest: PluginManifest) {
        super(app, manifest);

        Runner.app = () => app;
        Runner.instance = () => this;
    }

    async onload() {
        app = this.app;

        this.settings = await this.loadData() ?? default_settings;

        this.addCommand({
            name: "Trigger Task",
            id: "triggerTask",
            callback: () => new TaskList(app, this, trigger => this.trigger(trigger)).open()
        })

        this.addSettingTab(this.settingsTab = new SettingsTab(this.app, this));
    }

    trigger(name: string) {
        for (const task of this.settings.tasks)
            if (task.triggers.some(i => i.type == "manual" && i.name.toLowerCase() == name.toLowerCase()))
                this.runTask(task);
    }

    async runTask(task: Task) {
        for (const before of task.before)
            await this.runTask(before);

        for (const step of task.steps)
            await ({
                obsidian: async step => (this.app as any as { commands: { executeCommandById(id: string): void } }).commands.executeCommandById(step.command),
                manual: async step => this.trigger(step.command),
                javascript: async step => this.runJavascriptFragment(step),
                shell: async step => void new Notice("Shell steps not implemented yet")
            } as { [Type in Step['type']]: (step: Step & { type: Type }) => Promise<void> })[step.type](step as any);

        for (const before of task.before)
            await this.runTask(before);
    }

    async onunload() {
        await this.saveData(this.settings);
    }

    public getTriggers(): Manual[] {
        const triggers: Manual[] = [];

        for (const trigger of this.settings.tasks
            .map(i => i.triggers)
            .flat()
            .filter(i => i.type == "manual") as Manual[])

            if (!triggers.some(i => i.name.toLowerCase() == trigger.name.toLowerCase()))
                triggers.push(trigger);

        return triggers;
    }

    async runJavascriptFragment(step: JavaScript) {
        if (vm.SourceTextModule) {
            const module = new vm.SourceTextModule(step.command);

            await module.link(async spec => await import(spec));
            await module.evaluate({
                breakOnSigint: true
            });
        } else
            new Function('require', step.command)(require);
    }
}

export class TaskList extends FuzzySuggestModal<Manual> {
    constructor(app: App, private plugin: Runner, private onTrigger: (trigger: string) => void) {
        super(app);

        this.setPlaceholder("Trigger Task");
    }

    getItems(): Manual[] {
        return this.plugin.getTriggers();
    }

    getItemText(item: Manual): string {
        return item.name;
    }

    onChooseItem(item: Manual, evt: MouseEvent | KeyboardEvent): void {
        this.onTrigger(item.name);
    }
}