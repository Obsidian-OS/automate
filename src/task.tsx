import React from "react";
import dom from "react-dom/client";
import * as obs from "obsidian";

import ListBox from "./components/listbox.js";
import { app } from "./main.js";

export interface Task {
    label: string,
    before: Task[],
    after: Task[],
    triggers: Trigger[],
    steps: Step[]
}

interface Trigger {

}

type Step = ObsidianCommand | ShellCommand;

type ObsidianCommand = {
    type: "obsidian",
    command: string
};
type ShellCommand = {
    type: "shell",
    command: string,
    env: Record<string, string>
}

export default function TaskSetting<Props extends { task: Task, taskList: Task[] }>(props: Props) {

    const [task, setTask] = React.useState(props.task);

    React.useEffect(() => void Object.assign(props.task, task), [task]);

    return <div className="task-settings">
        <input value={task.label}/>

        <details className="run-before">
            <summary><label>{"Run Before"}</label></summary>
            
            <ListBox items={task.before ?? []} controls={{
                onSwap(i, j) {
                    if (i != j && j >= 0 && i >= 0 && i < task.before.length && j < task.before.length) {
                        task.before = task.before.with(i, task.before[j]).with(j, task.before[i]);
                        return true;
                    }
                    return false;
                },
                onAdd(e: React.MouseEvent) {
                    const menu = new obs.Menu();

                    for (const i of props.taskList)
                        if (i != task)
                            menu.addItem(item => item
                                .setTitle(i.label)
                                .onClick(_ => setTask(prev => ({
                                    ...prev,
                                    before: [...prev.before, i]
                                }))));

                    menu.showAtMouseEvent(e.nativeEvent);
                },
                onDelete(i) {
                    task.before.splice(i, 1);
                }
            }} />
        </details>

        <div className="triggers">
            <ListBox items={task.triggers ?? []} />
        </div>

        <div className="steps">
            <h1>{"Steps"}</h1>
            <ListBox items={task.steps.map(i => i.type) ?? []} controls={{
                onAdd(e) {
                    const menu = new obs.Menu();

                    menu.addItem(item => item
                        .setTitle("Obsidian Command")
                        .onClick(_ => setTask(prev => ({ 
                            ...prev,
                            steps: [...prev.steps, {
                                type: "obsidian",
                                command: ""
                            }]
                        }))));

                    menu.addItem(item => item
                        .setTitle("Shell Command")
                        .onClick(_ => new ShellCommandModal(command => setTask(prev => ({ 
                            ...prev,
                            steps: [...prev.steps, command]
                        }))).open()));

                    menu.showAtMouseEvent(e.nativeEvent);
                },
                onDelete(i) {
            
                },
                onSwap(i, j) {
                    return false;
                }
            }} />
        </div>

        <details className="run-after">
            <summary><label>{"Run After"}</label></summary>

            <ListBox items={task.after ?? []} />
        </details>
    </div>;
}

class ShellCommandModal extends obs.Modal {
    root: dom.Root | null = null;

    constructor(private onSelect: (cmd: ShellCommand) => void) {
        super(app);
    }

    onOpen() {
        function Settings(props: {}) {
            const [shell, setShell] = React.useState<ShellCommand>({
                type: "shell",
                command: "",
                env: {}
            });

            return <div>
                <textarea value={shell.command} onChange={e => setShell(prev => ({ ...prev, command: e.target.value }))} />
                
            </div>;
        }

        this.contentEl.empty();

        (this.root = dom.createRoot(this.contentEl))
            .render(<Settings />);
    }

    onClose() {
        this.root?.unmount();
    }
}
