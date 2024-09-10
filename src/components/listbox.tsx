import React, * as react from "react";

export default function ListBox<T extends { toString(): string }>(props: { items: T[], onSelect?: (label: string, index: number) => void }) {
    const [state, setState] = React.useState({
        index: 0,
        refs: props.items.map(_ => React.createRef<HTMLDivElement>())
    });

    React.useEffect(() => {
        if (props.onSelect)
            props.onSelect(props.items[state.index]?.toString(), state.index)
    }, [state.index]);

    return <div 
        className="list-box" 
        tabIndex={0} 
        onKeyUp={e => ({
            "uparrow": e => setState(prev => ({ ...prev, index: (prev.index + props.items.length - 2) % props.items.length })),
            "downarrow": e => setState(prev => ({ ...prev, index: (prev.index + 1) % props.items.length }))
        })[e.key.toLowerCase()]?.(e) }>
        {props.items.map((item, a) => <div 
            className={`list-item${state.index == a ? " active" : ""}`}
            ref={state.refs[a] } 
            onClick={_ => setState(prev => ({ ...prev, index: a }))}>
                <label>{item.toString()}</label>
        </div>)}

    </div>
}
