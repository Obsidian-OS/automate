import React from "react";
import * as obs from "obsidian";

import ListBox from "./components/listbox.js";

export interface Task {
    label: string,
    before: string[],
    after: string[],
    triggers: Trigger[],
    steps: Step[]
}

interface Trigger {

}

interface Step {

}

export default function TaskSetting<Props extends { task: Task }>({ task }: Props) {
    return <div className="task-settings">
        <input value={task.label}/>

        <details className="run-before">
            <summary><label>{"Run Before"}</label></summary>
            
            <ListBox items={task.before} />
        </details>

        <div className="triggers">
            <ListBox items={task.triggers} />
        </div>

        <div className="steps">
            <ListBox items={task.steps} />
        </div>

        <details className="run-after">
            <summary><label>{"Run After"}</label></summary>

            <ListBox items={task.after} />
        </details>
    </div>;
}
