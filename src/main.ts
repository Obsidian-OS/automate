import * as vm from 'node:vm';
import * as cp from 'node:child_process';
import { iter } from '@j-cake/jcake-utils/iter';
import { App, FuzzySuggestModal, Notice, Plugin, PluginManifest } from 'obsidian';

import SettingsTab, { default_settings, Settings } from "./settings.js";
import { JavaScript, Manual, ShellCommand, Step, Task, Trigger, VaultEvent } from "./task.js";
import { clearInterval } from 'node:timers';

export let app: App;

export default class Runner extends Plugin {
    settingsTab: SettingsTab | null = null;
    settings: Settings = default_settings;

    private listeners: (() => void)[] = [];
    private timers: (() => void)[] = [];

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
            callback: () => new TaskList(app, this, trigger => this.activateManualTrigger(trigger)).open()
        })

        this.addSettingTab(this.settingsTab = new SettingsTab(this.app, this));

        this.updateListeners();
    }

    activateTrigger<Params extends any[]>(trigger: Trigger, params: Params) {
        for (const task of this.settings.tasks)
            if (task.triggers.includes(trigger))
                this.runTask(task);
    }

    activateManualTrigger(name: string) {
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
                manual: async step => this.activateManualTrigger(step.command),
                javascript: async step => this.runJavascriptFragment(step),
                shell: async step => this.runShell(step)
            } as { [Type in Step['type']]: (step: Step & { type: Type }) => Promise<void> })[step.type](step as any);

        for (const before of task.before)
            await this.runTask(before);
    }

    async onunload() {
        await this.saveData(this.settings);
    }

    public getTriggersOfType<Type extends Trigger['type'], R extends Trigger & { type: Type }>(type: Type): R[] {
        return this
            .settings
            .tasks
            .map(i => i.triggers)
            .flat()
            .filter(i => i.type == type) as R[];
    }

    public getManualTriggers(): Manual[] {
        const triggers: Manual[] = [];

        for (const trigger of this.getTriggersOfType('manual'))
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

    async runShell(step: ShellCommand) {
        const proc = cp.spawn(step.command, {
            shell: true,
            stdio: ['pipe', 'pipe', 'inherit'],
            windowsHide: true
        });

        const stdout = iter.collect(proc.stdout);
        return await new Promise((ok, err) => proc.on('exit', async code => code == 0 ? ok(await stdout) : err));
    }

    updateListeners() {
        for (const unbind of this.listeners.splice(0, this.listeners.length))
            unbind();

        for (const timer of this.timers.splice(0, this.timers.length))
            timer();

        for (const trigger of this.getTriggersOfType('event')) {
            const callback = (...params: any[]) => this.activateTrigger(trigger, params);
            const object: {
                on(event: string, callback: (...args: any[]) => void): void,
                off(event: string, callback: (...args: any[]) => void): void,
            } = {
                vault: this.app.vault,
                workspace: this.app.workspace
            }[trigger.object];

            object.on(trigger.event, callback);
            this.listeners.push(() => object.off(trigger.event, callback));
        }

        for (const timer of this.getTriggersOfType("timer")) {
            const interval = setInterval(() => this.activateTrigger(timer, []), timer.interval * 1000);
            this.timers.push(() => clearInterval(interval));
        }
    }
}

export class TaskList extends FuzzySuggestModal<Manual> {
    constructor(app: App, private plugin: Runner, private onTrigger: (trigger: string) => void) {
        super(app);

        this.setPlaceholder("Trigger Task");
    }

    getItems(): Manual[] {
        return this.plugin.getManualTriggers();
    }

    getItemText(item: Manual): string {
        return item.name;
    }

    onChooseItem(item: Manual, evt: MouseEvent | KeyboardEvent): void {
        this.onTrigger(item.name);
    }
}