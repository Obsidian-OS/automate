import React from "react";
import * as obs from "obsidian";
import * as icons from 'lucide-react';

import ListBox, {Controls} from "./components/listbox.js";
import ShellTaskEditor from "./shell-editor.js";
import JavaScriptEditor from "./javascript-editor.js";
import ObsidianEditor from "./obsidian-editor.js";
import TimerEditor from "./timer-editor.js";
import ManualEditor from "./manual-editor.js";

export interface Task {
    label: string,
    before: Task[],
    after: Task[],
    triggers: Trigger[],
    steps: Step[]
}

export type Trigger = Timer | Manual;
export type Step = ObsidianCommand | ShellCommand | JavaScript;

export type Timer = {
    type: "timer",
    interval: number,
};

export type Manual = {
    type: "manual",
    command: string,
    name: string
}

export type ObsidianCommand = {
    type: "obsidian",
    command: string
};
export type ShellCommand = {
    type: "shell",
    command: string,
    env: Record<string, string>
};
export type JavaScript = {
    type: "javascript",
    command: string
}

export default function TaskSetting<Props extends { task: Task, taskList: Task[] }>(props: Props) {
    const [task, setTask] = React.useState(props.task);
    const [highlighted, setHighlighted] = React.useState({
        before: 0,
        trigger: 0,
        step: 0,
        after: 0
    });

    React.useEffect(() => void Object.assign(props.task, task), [task]);

    const controls: SetState = {setHighlighted, setTask, task, taskList: props.taskList};

    return <div className="task-settings list-box-viewport">
        <div className={"flex"}>
            <input className={"fill"}
                   type="text"
                   value={task.label}
                   onChange={e => setTask(prev => ({...prev, label: e.target.value}))}/>
        </div>

        <details className="run-before list-box-container">
            <summary><label>{"Run Before"}</label></summary>

            <ListBox controls={beforeEditor(controls)}>
                {task.before.map(i => '') ?? []}
            </ListBox>
        </details>

        <div className="triggers">
            <h1>{"Triggers"}</h1>
            <div className="list-box-container">
                <ListBox controls={triggerEditor(controls)}>
                    {task.triggers.map(i => ({
                        'timer': timer => <>{`Timer: ${timer.interval}s`}</>,
                        'manual': manual => <>{`Manual Trigger: ${manual.command}`}</>
                    } as { [Type in Trigger['type']]: (trigger: Trigger & { type: Type }) => React.ReactNode })[i.type](i as any))}
                </ListBox>
                {({
                    'timer': trigger => <TimerEditor trigger={trigger} key={`timer-editor-${highlighted.trigger}`}/>,
                    'manual': trigger => <ManualEditor trigger={trigger} key={`manual-editor-${highlighted.trigger}`}/>,
                } as {
                    [Type in Trigger['type']]: ((trigger: Trigger & {
                        type: Type
                    }) => React.ReactNode)
                })[task.triggers[highlighted.trigger]?.type]?.(task.triggers[highlighted.trigger] as any) ?? null}
            </div>
        </div>

        <div className="steps">
            <h1>{"Steps"}</h1>
            <div className="list-box-container">
                <ListBox controls={stepEditor(controls)}>
                    {task.steps.map((i, a) => i.command.length > 0 ? <div className={"step-label"}>
                        {{
                            shell: <icons.Hash size={14}/>,
                            javascript: <icons.Braces size={14}/>,
                            obsidian: <icons.ChevronRight size={14}/>
                        }[i.type]}
                        {`${i.command.slice(0, 25)}${i.command.length > 25 ? '\u2026' : ''}`}
                    </div> : <i key={`step-${a}`}>{'Empty'}</i>) ?? []}
                </ListBox>
                {({
                    'shell': step => <ShellTaskEditor step={step} key={`shell-editor-step-${highlighted.step}`}/>,
                    'obsidian': step => <ObsidianEditor step={step} key={`obsidian-editor-step-${highlighted.step}`}/>,
                    'javascript': step => <JavaScriptEditor step={step} key={`js-editor-step-${highlighted.step}`}/>,
                } as {
                    [Type in Step['type']]: ((step: Step & {
                        type: Type
                    }) => React.ReactNode)
                })[task.steps[highlighted.step]?.type]?.(task.steps[highlighted.step] as any) ?? null}
            </div>
        </div>

        <details className="run-after">
            <summary><label>{"Run After"}</label></summary>

            <ListBox controls={afterEditor(controls)}>
                {task.after.map(i => '') ?? []}
            </ListBox>
        </details>
    </div>;
}

interface SetState {
    setTask: React.Dispatch<React.SetStateAction<Task>>,
    setHighlighted: React.Dispatch<React.SetStateAction<{
        before: number,
        after: number,
        trigger: number,
        step: number
    }>>,
    task: Task,
    taskList: Task[]
}

const beforeEditor = ({setTask, task, taskList}: SetState): Controls => ({
    onSwap(i, j) {
        if (i != j && j >= 0 && i >= 0 && i < task.before.length && j < task.before.length) {
            task.before = task.before.with(i, task.before[j]).with(j, task.before[i]);
            return true;
        }
        return false;
    },
    onAdd(e: React.MouseEvent) {
        const menu = new obs.Menu();

        for (const i of taskList)
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
})
const triggerEditor = ({task, setTask, setHighlighted}: SetState): Controls => ({
    onSelect: i => setHighlighted(prev => ({...prev, trigger: i})),
    onDelete: i => setTask(prev => ({
        ...prev,
        triggers: [...prev.triggers.slice(0, i), ...prev.triggers.slice(i + 1)]
    })),
    onAdd(e) {
        const menu = new obs.Menu();

        menu.addItem(item => item
            .setTitle("Timer")
            .onClick(_ => setTask(prev => ({
                ...prev,
                triggers: [...prev.triggers, {
                    type: 'timer',
                    interval: 0
                }] // TODO: Select object
            }))));

        menu.addItem(item => item
            .setTitle("Manual")
            .onClick(_ => setTask(prev => ({
                ...prev,
                triggers: [...prev.triggers, {
                    type: 'manual',
                    command: '',
                    name: ''
                }] // TODO: Select object
            }))));

        menu.showAtMouseEvent(e.nativeEvent);
    },
    onSwap(i, j) {
        if (!(i != j && j >= 0 && i >= 0 && i < task.triggers.length && j < task.triggers.length)) return false;

        setTask(prev => ({
            ...prev,
            triggers: prev.triggers.with(i, prev.triggers[j]).with(j, prev.triggers[i])
        }));

        return true;
    }
})
const stepEditor = ({task, setTask, setHighlighted}: SetState): Controls => ({
    onSelect: i => setHighlighted(prev => ({...prev, step: i})),
    onDelete: i => setTask(prev => ({
        ...prev,
        steps: [...prev.steps.slice(0, i), ...prev.steps.slice(i + 1)]
    })),
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
            .onClick(_ => setTask(prev => ({
                ...prev,
                steps: [...prev.steps, {
                    type: 'shell',
                    command: "",
                    env: {}
                }]
            }))));

        menu.addItem(item => item
            .setTitle("JavaScript")
            .onClick(_ => setTask(prev => ({
                ...prev,
                steps: [...prev.steps, {
                    type: 'javascript',
                    command: "",
                }]
            }))));

        menu.showAtMouseEvent(e.nativeEvent);
    },
    onSwap(i, j) {
        if (!(i != j && j >= 0 && i >= 0 && i < task.steps.length && j < task.steps.length)) return false;

        setTask(prev => ({
            ...prev,
            steps: prev.steps.with(i, prev.steps[j]).with(j, prev.steps[i])
        }));

        return true;
    }
})
const afterEditor = ({setTask, task, taskList}: {
    setTask: React.Dispatch<React.SetStateAction<Task>>,
    task: Task,
    taskList: Task[]
}): Controls => ({
    onSwap(i, j) {
        if (i != j && j >= 0 && i >= 0 && i < task.after.length && j < task.after.length) {
            task.after = task.after.with(i, task.after[j]).with(j, task.after[i]);
            return true;
        }
        return false;
    },
    onAdd(e: React.MouseEvent) {
        const menu = new obs.Menu();

        for (const i of taskList)
            if (i != task)
                menu.addItem(item => item
                    .setTitle(i.label)
                    .onClick(_ => setTask(prev => ({
                        ...prev,
                        after: [...prev.after, i]
                    }))));

        menu.showAtMouseEvent(e.nativeEvent);
    },
    onDelete(i) {
        task.after.splice(i, 1);
    }
})

