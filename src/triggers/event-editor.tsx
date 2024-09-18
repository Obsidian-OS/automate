import React from 'react';

import { VaultEvent } from "../task.js";
import Setting from '../components/setting.js';

export default function EventEditor(props: { trigger: VaultEvent }) {
    const [trigger, setTrigger] = React.useState<VaultEvent>(props.trigger);

    React.useEffect(() => void Object.assign(props.trigger, trigger), [trigger]);

    return <section className={"step-editor javascript vault-event-viewport"}>
        <h2>{"Event"}</h2>

        <Setting title={"Event"}
            description={"Which event should be caught"}
            options={Object.fromEntries(Object.entries(events).map(([a, i]) => [a, i.name]))}
            value={Object.entries(events).find(([a, i]) => i.event == trigger.event && i.object == trigger.object)?.[0] ?? ''}
            onChange={event => setTrigger(prev => ({
                ...prev,
                ...getEvent(event) as any
            }))} />
    </section>;
}

const events: Record<string, {
    object: string,
    event: string,
    name: string
}> = {
    'vault::create': { object: 'vault', event: 'create', name: 'Note created' },
    'vault::modify': { object: 'vault', event: 'modify', name: 'Note modified' },
    'vault::delete': { object: 'vault', event: 'delete', name: 'Note deleted' },
    'vault::rename': { object: 'vault', event: 'rename', name: 'Note renamed' },
    'vault::closed': { object: 'vault', event: 'closed', name: 'Editor closed' },

    'workspace::quick-preview': { object: 'workspace', event: 'quick-preview', name: 'Quick Preview' },
    'workspace::resize': { object: 'workspace', event: 'resize', name: 'Workspace Resized' },
    'workspace::active-leaf-change': { object: 'workspace', event: 'active-leaf-change', name: 'Active Leaf Changed' },
    'workspace::file-open': { object: 'workspace', event: 'file-open', name: 'File Opened' },
    'workspace::layout-change': { object: 'workspace', event: 'layout-change', name: 'Layout Changed' },
    'workspace::window-open': { object: 'workspace', event: 'window-open', name: 'Window Opened' },
    'workspace::window-close': { object: 'workspace', event: 'window-close', name: 'Window Closed' },
    'workspace::css-change': { object: 'workspace', event: 'css-change', name: 'CSS Changed' },
    'workspace::file-menu': { object: 'workspace', event: 'file-menu', name: 'File menu opened (single file)' },
    'workspace::files-menu': { object: 'workspace', event: 'files-menu', name: 'File menu opened (multiple files)' },
    'workspace::url-menu': { object: 'workspace', event: 'url-menu', name: 'URL Menu opened' },
    'workspace::editor-menu': { object: 'workspace', event: 'editor-menu', name: 'Editor Menu opened' },
    'workspace::editor-change': { object: 'workspace', event: 'editor-change', name: 'Editor changed' },
    'workspace::editor-paste': { object: 'workspace', event: 'editor-paste', name: 'Editor received Paste' },
    'workspace::editor-drop': { object: 'workspace', event: 'editor-drop', name: 'Editor received Drop' },
    'workspace::quit': { object: 'workspace', event: 'quit', name: 'Quit' },
};

export function getEvent(event: string): { object: string, event: string } {
    return events[event];
}