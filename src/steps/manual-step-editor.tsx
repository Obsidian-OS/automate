import React from 'react';

import {ManualStep} from "../task.js";
import {Setting} from "../components/setting.js";
import Runner from "../main.js";

export default function ManualStepEditor(props: { step: ManualStep }) {
    const [trigger, setTrigger] = React.useState<ManualStep>(props.step);

    React.useEffect(() => void Object.assign(props.step, trigger), [trigger]);

    return <div className={"step-editor obsidian list-box-viewport"}>
        <h2>{"Manual Trigger"}</h2>
        <Setting title={"Trigger"}
                 description={"Which trigger to run"}
                 options={Object.fromEntries(Runner.instance().getManualTriggers().map(i => [i.name, i.name]))}
                 onChange={trigger => setTrigger(prev => ({...prev, command: trigger}))}/>
    </div>
}