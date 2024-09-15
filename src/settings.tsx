import React from "react";
import dom from "react-dom/client";
import * as obs from "obsidian";

import Runner from "./main.js";
import TaskSetting, {Task} from "./task.js";
import ListBox from "./components/listbox.js";
import {Setting} from "./components/setting.js";

export interface Settings {
    tasks: Task[]
}

export const default_settings: Settings = {
    tasks: []
};

export default class SettingsTab extends obs.PluginSettingTab {
    private root: dom.Root | null = null;

    constructor(readonly app: obs.App, readonly plugin: Runner) {
        super(app, plugin);
    }

    display() {
        this.containerEl.empty();

        (this.root = dom.createRoot(this.containerEl))
            .render(<Settings tab={this}/>);
    }

    hide() {
        this.root?.unmount();
    }
}

function Settings(props: { tab: SettingsTab }) {
    const [tasks, setTasks] = React.useState<Task[]>(props.tab.plugin.settings.tasks);
    const [highlighted, setHighlighted] = React.useState(0)

    React.useEffect(() => void Object.assign(props.tab.plugin.settings, {tasks}), [tasks]);

    const addTask = () => setTasks(prev => [...prev, {
        label: `New Task (${prev.length})`,
        before: [],
        after: [],
        triggers: [],
        steps: []
    }]);

    return <section>
        <h1>{"Tasks"}</h1>

        <div className="task-picker list-box-container task-runner-settings-container">
            <ListBox
                controls={{
                    onSelect: index => setHighlighted(index),
                    onAdd: _ => addTask(),
                    onDelete: i => setTasks(prev => [...prev.slice(0, i), ...prev.slice(i + 1)]),
                }}>
                {tasks.map(i => i.label)}
            </ListBox>
            {tasks[highlighted] ? <>
                <TaskSetting task={tasks[highlighted]} taskList={tasks} key={`task-${highlighted}`}/>
            </> : null}
        </div>
    </section>;
}