import React from 'react';

import {VaultEvent} from "../task.js";
import {Setting} from "../components/setting.js";

export default function VaultEventEditor(props: { trigger: VaultEvent }) {
    const [trigger, setTrigger] = React.useState<VaultEvent>(props.trigger);

    React.useEffect(() => void Object.assign(props.trigger, trigger), [trigger]);

    return <section className={"step-editor javascript vault-event-viewport"}>
        <h2>{"Vault Event"}</h2>
        <Setting title={"Event"}
                 description={"Which event should be caught"}
                 options={{
                     'create': 'Note Created',
                     'modify': 'Note Modified',
                     'delete': 'Note Delete',
                     'rename': 'Note Renamed',
                     'closed': 'Editor Closed'
                 }}
                 onChange={event => setTrigger(prev => ({...prev, event: event as VaultEvent['event']}))}/>
    </section>;
}