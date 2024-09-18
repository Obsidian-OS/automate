import React from "react";
import * as obs from "obsidian";
import * as icons from 'lucide-react';

import ShellTaskEditor from "./steps/shell-editor.js";
import JavaScriptEditor from "./steps/javascript-editor.js";
import ObsidianEditor from "./steps/obsidian-editor.js";
import TimerEditor from "./triggers/timer-editor.js";
import ManualEditor from "./triggers/manual-editor.js";
import ManualStepEditor from "./steps/manual-step-editor.js";
import EventEditor from "./triggers/event-editor.js";
import ListBox, { Controls } from "./components/listbox.js";

export interface Task {
    label: string,
    before: Task[],
    after: Task[],
    triggers: Trigger[],
    steps: Step[]
}

export type Trigger = Timer | VaultEvent | Manual;
export type Step = ObsidianCommand | ShellCommand | JavaScript | ManualStep;

export type Timer = {
    type: "timer",
    interval: number,
};

export type VaultEvent = {
    type: "event",
} & ({
    object: 'vault',
    event: 'create' | 'modify' | 'delete' | 'rename'
} | {
    object: 'workspace',
    event: 'quick-preview' | 'resize' | 'active-leaf-change' | 'file-open' | 'layout-change' | 'window-open' | 'window-close' | 'css-change' | 'file-menu' | 'files-menu' | 'url-menu' | 'editor-menu' | 'editor-change' | 'editor-paste' | 'editor-drop' | 'quit',
});

export type Manual = {
    type: "manual",
    name: string
}

export type ObsidianCommand = {
    type: "obsidian",
    command: string
};
export type ShellCommand = {
    type: "shell",
    command: string,
    env: Record<string, string>,
    breakOnNonZero: boolean
};
export type JavaScript = {
    type: "javascript",
    command: string,
    breakOnError: boolean
}
export type ManualStep = {
    type: "manual",
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
        <div className={"flex task-name"}>
            <input className={"fill"}
                   type="text"
                   value={task.label}
                   onChange={e => setTask(prev => ({...prev, label: e.target.value}))}/>
        </div>

        <div className="before">
            <h5>{"Run Before"}</h5>

            <ListBox controls={beforeEditor(controls)}>
                {task.before.map(i => <label>{i.label}</label>)}
            </ListBox>
        </div>

        <div className="triggers">
            <div className={"description"}>
                <h5>{"Triggers"}</h5>
                <p className={"setting-item-description"}>{`How are tasks run. A task is run if any trigger fires.`}</p>
            </div>

            <ListBox controls={triggerEditor(controls)}>
                {task.triggers.map((i, a) => ({
                    'timer': timer => <div className="step-label" key={`trigger-${a}`}>
                        <icons.Timer size={14}/>
                        {`${timer.interval}s`}
                    </div>,
                    'event': event => <div className="step-label"key={`trigger-${a}`}>
                        <icons.Info size={14}/>
                        {event.event}
                    </div>,
                    'manual': manual => <div className="step-label"key={`trigger-${a}`}>
                        <icons.Play size={14}/>
                        {manual.name}
                    </div>
                } as {
                    [Type in Trigger['type']]: (trigger: Trigger & {
                        type: Type
                    }) => React.ReactNode
                })[i.type](i as any))}
            </ListBox>

            {({
                'timer': trigger => <TimerEditor trigger={trigger} key={`timer-editor-${highlighted.trigger}`}/>,
                'event': trigger => <EventEditor trigger={trigger} key={`event-editor-${highlighted.trigger}`}/>,
                'manual': trigger => <ManualEditor trigger={trigger} key={`manual-editor-${highlighted.trigger}`}/>,
            } as {
                [Type in Trigger['type']]: ((trigger: Trigger & {
                    type: Type
                }) => React.ReactNode)
            })[task.triggers[highlighted.trigger]?.type]?.(task.triggers[highlighted.trigger] as any) ?? null}
        </div>

        <div className="steps">
            <div className={"description"}>
                <h5>{"Steps"}</h5>
                <p className={"setting-item-description"}>{`The 'Steps' section configures what is done after a trigger launches a task. These are run in the order they are specified in.`}</p>
            </div>

            <ListBox controls={stepEditor(controls)}>
                {task.steps.map((i, a) => i.command.length > 0 ? <div className={"step-label"} key={`step-${a}`}>
                    {{
                        shell: <icons.Hash size={14}/>,
                        javascript: <icons.Braces size={14}/>,
                        obsidian: <icons.ChevronRight size={14}/>,
                        manual: <icons.Play size={14}/>,
                    }[i.type]}
                    {`${i.command.slice(0, 25)}${i.command.length > 25 ? '\u2026' : ''}`}
                </div> : <i key={`step-${a}`}>{'Empty'}</i>) ?? []}
            </ListBox>

            {({
                'shell': step => <ShellTaskEditor step={step} key={`shell-editor-step-${highlighted.step}`}/>,
                'obsidian': step => <ObsidianEditor step={step} key={`obsidian-editor-step-${highlighted.step}`}/>,
                'javascript': step => <JavaScriptEditor step={step} key={`js-editor-step-${highlighted.step}`}/>,
                'manual': step => <ManualStepEditor step={step} key={`manual-step-editor-step-${highlighted.step}`}/>,
            } as {
                [Type in Step['type']]: ((step: Step & {
                    type: Type
                }) => React.ReactNode)
            })[task.steps[highlighted.step]?.type]?.(task.steps[highlighted.step] as any) ?? null}
        </div>

        <div className="after">
            <h5>{"Run After"}</h5>

            <ListBox controls={afterEditor(controls)}>
                {task.after.map(i => <label>{i.label}</label>)}
            </ListBox>
        </div>
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
            .setIcon("timer")
            .onClick(_ => setTask(prev => ({
                ...prev,
                triggers: [...prev.triggers, {
                    type: 'timer',
                    interval: 0
                }] // TODO: Select object
            }))));

        menu.addItem(item => item
            .setTitle("Event")
            .setIcon("info")
            .onClick(_ => setTask(prev => ({
                ...prev,
                triggers: [...prev.triggers, {
                    type: 'event',
                    object: 'vault',
                    event: 'modify'
                }] // TODO: Select object
            }))));

        menu.addItem(item => item
            .setTitle("Manual")
            .setIcon("play")
            .onClick(_ => setTask(prev => ({
                ...prev,
                triggers: [...prev.triggers, {
                    type: 'manual',
                    name: ''
                }] // TODO: Select object
            }))));

        menu.showAtMouseEvent(e.nativeEvent);
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
            .setIcon("chevron-right")
            .onClick(_ => setTask(prev => ({
                ...prev,
                steps: [...prev.steps, {
                    type: "obsidian",
                    command: ""
                }]
            }))));

        menu.addItem(item => item
            .setTitle("Manual Trigger")
            .setIcon("play")
            .onClick(_ => setTask(prev => ({
                ...prev,
                steps: [...prev.steps, {
                    type: "manual",
                    command: ""
                }]
            }))));

        menu.addItem(item => item
            .setTitle("Shell Command")
            .setIcon("hash")
            .onClick(_ => setTask(prev => ({
                ...prev,
                steps: [...prev.steps, {
                    type: 'shell',
                    command: "",
                    env: {},
                    breakOnNonZero: true,
                }]
            }))));

        menu.addItem(item => item
            .setTitle("JavaScript")
            .setIcon("braces")
            .onClick(_ => setTask(prev => ({
                ...prev,
                steps: [...prev.steps, {
                    type: 'javascript',
                    command: "",
                    breakOnError: true
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
const afterEditor = ({setTask, task, taskList}: SetState): Controls => ({
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

