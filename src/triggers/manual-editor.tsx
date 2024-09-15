import React from 'react';

import {Manual} from "../task.js";
import {Setting} from "../components/setting.js";

export default function TimerEditor(props: { trigger: Manual }) {
    const [trigger, setTrigger] = React.useState<Manual>(props.trigger);

    React.useEffect(() => void Object.assign(props.trigger, trigger), [trigger]);

    return <section className={"step-editor javascript list-box-viewport"}>
        <h2>{"Manual Trigger"}</h2>
        <Setting title={"Name"}
                 description={"Triggers which have the same, case-insensitive names are considered equal, and triggering one, triggers all others by the same name."}
                 lineFormat={/^.*$/}
                 value={trigger.name}
                 onChange={value => value.length > 0 && setTrigger(prev => ({...prev, name: value}))}/>
    </section>;
}