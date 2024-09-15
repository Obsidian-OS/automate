import React from 'react';
import {basicSetup} from "codemirror";
import {EditorView} from '@codemirror/view';
import {EditorState} from '@codemirror/state';
import {javascript} from '@codemirror/lang-javascript';
import {JavaScript} from "./task.js";

export default function JavaScriptEditor(props: { step: JavaScript }) {
    const editor = React.createRef<HTMLDivElement>();
    const [state, setState] = React.useState({
        js: props.step.command
    });

    React.useEffect(() => {
        if (!editor.current)
            return;

        const ed = new EditorView({
            parent: editor.current,
            state: EditorState.create({
                doc: state.js,
                extensions: [basicSetup, javascript()],
            })
        })

        return () => {
            props.step.command = ed.state.doc.toString();
            ed.destroy();
        };
    }, []);
    React.useEffect(() => void (props.step.command = state.js), [state.js]);

    return <section className={"step-editor javascript list-box-viewport"}>
        {/*<button onClick={() => popOut()}></button>*/}
        <h2>{"Javascript Fragment"}</h2>
        <div ref={editor}/>
    </section>
}

