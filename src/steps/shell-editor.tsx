import React from "react";

import {ShellCommand} from "../task.js";
import Setting from "../components/setting.js";

export default function ShellTaskEditor(props: { step: ShellCommand }) {
    const [step, setStep] = React.useState(props.step);

    React.useEffect(() => void Object.assign(props.step, step), [step]);

    return <div className={"step-editor shell list-box-viewport"}>
        <h2>{"Shell command"}</h2>

        <Setting title='Stop task on Non-zero exit code'
            description='Whether the task should stop if a non-zero exit codes is encountered' 
            checked={true} 
            onChange={checked => setStep(prev => ({
                ...prev,
                breakOnNonZero: checked
            }))} />

        <textarea
            className={"command-editor"}
            value={step.command}
            onChange={e => setStep(prev => ({...prev, command: e.target.value}))}
            placeholder={"Enter shell command here"}
        ></textarea>
    </div>;
}