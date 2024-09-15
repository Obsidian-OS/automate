import React from 'react';
import * as obs from 'obsidian';
import * as icons from 'lucide-react';

import {Step} from "../task.js";
import Runner from "../main.js";

export default function ObsidianEditor(props: { step: Step }) {
    const [cmd, setCmd] = React.useState(props.step.command);

    const picker = new CommandPicker(Runner.app(), item => setCmd(item.id));

    React.useEffect(() => void (props.step.command = cmd), [cmd]);

    return <div className={"step-editor obsidian list-box-viewport"}>
        <h2>{"Obsidian Command"}</h2>

        <div className={"flex"}>
            <input className={"fill"}
                   type={"text"}
                   value={cmd}
                   onChange={e => setCmd(e.target.value)}/>
            <button onClick={() => picker.open()}>
                <icons.Search size={18}/>
            </button>
        </div>
    </div>;
}

export class CommandPicker extends obs.FuzzySuggestModal<obs.Command> {
    constructor(app: obs.App, private onSelect: (command: obs.Command) => void) {
        super(app);

        this.setPlaceholder("Select a command");
    }

    getItems(): obs.Command[] {
        return Object.values((this.app as any as { commands: { commands: Record<string, obs.Command> } }).commands.commands);
    }

    getItemText(item: obs.Command): string {
        return item.name;
    }

    onChooseItem(item: obs.Command, evt: MouseEvent | KeyboardEvent): void {
        this.onSelect(item);
    }
}