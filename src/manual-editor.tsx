import React from 'react';

import {Manual, Timer} from "./task.js";
import {Setting} from "./components/setting.js";

export default function TimerEditor(props: {trigger: Manual}) {
    const [trigger, setTrigger] = React.useState<Manual>(props.trigger);

    React.useEffect(() => void Object.assign(props.trigger, trigger), [trigger]);

    return <section className={"step-editor javascript list-box-viewport"}>
        <h2>{"Manual Trigger"}</h2>
        <Setting title={"Command ID"}
                 description={"The ID of the command to register into Obsidian"}
                 lineFormat={/^.*$/}
                 value={trigger.command}
                 onChange={value => value.length > 0 && setTrigger(prev => ({ ...prev, command: value }))} />
        <Setting title={"Command Name"}
                 description={"How the command should appear in the command search"}
                 lineFormat={/^.*$/}
                 value={trigger.name}
                 onChange={value => value.length > 0 && setTrigger(prev => ({ ...prev, name: value }))} />
    </section>;
}