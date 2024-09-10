import React from "react";
import dom from "react-dom/client";
import * as obs from "obsidian";

import Runner from "./main.js";
import TaskSetting, { Task } from "./task.js";
import ListBox from "./components/listbox.js";

export interface Settings {
    tasks: Task[]
}

export const default_settings: Settings = {
    tasks: []
};

export default class SettingsTab extends obs.SettingTab {
    private root: dom.Root | null = null;
    settings: Settings = default_settings;

    constructor(readonly app: obs.App, private plugin: Runner) {
        super();
    }

    load(settings: Partial<Settings>) {

    }

    get(): Settings {
        return Object.freeze({ ...this.settings });
    }

    display() {
        this.containerEl.empty();

        (this.root = dom.createRoot(this.containerEl))
            .render(<Settings tab={this} />);
    }

    hide() {
        this.root?.unmount();
    }
}

function Settings(props: { tab: SettingsTab }) {
    const [tasks, setTasks] = React.useState<Task[]>([]);
    const [state, setState] = React.useState({
        selectedTask: 0
    })

    React.useEffect(() => { props.tab.settings.tasks = tasks }, [tasks]);

    return <div>
        <h1>{"Tasks"}</h1>

        <Setting title="Add new Task" buttonText="Add" onClick={() => setTasks(prev => [...prev, { label: `New Task (${prev.length})` }])} />

        <div className="task-picker">
            <ListBox items={tasks.map(i => i.label)} onSelect={(label: string, index: number) => setState({ selectedTask: index }) }/>
            {tasks[state.selectedTask] ? <TaskSetting task={tasks[state.selectedTask]} /> : null }
        </div>
    </div>;
}

type types = { buttonText: string, onClick: () => void }

export function Setting(props: { title: string, description?: string } & types) {
    const ref = React.createRef<HTMLDivElement>();

    React.useEffect(() => { 
        const setting = new obs.Setting(ref.current!)
            .setName(props.title);

        if ("buttonText" in props)
            setting
                .addButton(btn => btn
                    .setButtonText(props.buttonText)
                    .onClick(props.onClick))
    }, []);

    return <div ref={ref}></div>;
}
