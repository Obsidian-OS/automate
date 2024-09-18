import React from 'react';

import {Timer} from "../task.js";
import Setting from '../components/setting.js';

export default function TimerEditor(props: {trigger: Timer}) {
    const [trigger, setTrigger] = React.useState<Timer>(props.trigger);

    React.useEffect(() => void Object.assign(props.trigger, trigger), [trigger]);

    return <section className={"step-editor javascript list-box-viewport"}>
        <h2>{"Timer"}</h2>
        <Setting title={"Interval"}
                 description={"How often the trigger should fire (seconds)"}
                 lineFormat={/^\d+$/}
                 value={trigger.interval.toString()}
                 onChange={value => value.length > 0 && setTrigger(prev => ({ ...prev, interval: Number(value) }))} />
    </section>;
}
