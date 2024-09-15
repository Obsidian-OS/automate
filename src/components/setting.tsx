import React from "react";
import * as obs from "obsidian";

type types = Button | Line;

type Button = { buttonText: string, onClick: () => void };
type Line = {
    onChange: (value: string) => void,
    lineFormat: RegExp,
    value: string,
    placeholder?: string
};

export function Setting(props: { title: string, description?: string } & types) {
    const ref = React.createRef<HTMLDivElement>();

    React.useEffect(() => {
        const setting = new obs.Setting(ref.current!)
            .setName(props.title)
            .setDesc(props.description ?? '');

        if ("buttonText" in props)
            setting
                .addButton(btn => btn
                    .setButtonText(props.buttonText)
                    .onClick(props.onClick))

        else if ("lineFormat" in props)
            setting
                .addText(cb => {
                    cb.inputEl.pattern = props.lineFormat.source;
                    return cb
                        .setValue(props.value)
                        .setPlaceholder(props.placeholder ?? '')
                        .onChange(value => {
                            if (cb.inputEl.validity.valid)
                                props.onChange(value);
                        });
                })
    }, []);

    return <div ref={ref}></div>;
}
