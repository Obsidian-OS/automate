import React from 'react';
import { basicSetup } from "codemirror";
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';

import { JavaScript } from "../task.js";
import Setting from '../components/setting.js';

export default function JavaScriptEditor(props: { step: JavaScript }) {
    const editor = React.createRef<HTMLDivElement>();
    const [step, setStep] = React.useState(props.step);

    React.useEffect(() => {
        if (!editor.current)
            return;

        const ed = new EditorView({
            parent: editor.current,
            state: EditorState.create({
                doc: step.command,
                extensions: [basicSetup, javascript()],
            })
        })

        return () => {
            props.step.command = ed.state.doc.toString();
            ed.destroy();
        };
    }, []);
    React.useEffect(() => void Object.assign(props.step, step), [step]);

    return <section className={"step-editor javascript list-box-viewport"}>
        {/*<button onClick={() => popOut()}></button>*/}
        <h2>{"Javascript Fragment"}</h2>
        <Setting title='Stop task on Error'
            description='Whether the task should stop if an error is encountered' 
            checked={true} 
            onChange={checked => setStep(prev => ({
                ...prev,
                breakOnError: checked
            }))} />
        <div ref={editor} />
    </section>
}

