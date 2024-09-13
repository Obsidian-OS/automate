import React, * as react from "react";
import * as lucide from "lucide-react";

interface Controls {
    onAdd?: (e: React.MouseEvent) => void,
    onDelete?: (item: number) => void,
    onSwap?: (item: number, item2: number) => boolean 
}

export default function ListBox<T extends { toString(): string }>(props: { 
    items: T[], 
    onSelect?: (label: string, index: number) => void,
    controls?: Controls
}) {
    const [state, setState] = React.useState({
        index: 0,
        refs: props.items?.map(_ => React.createRef<HTMLDivElement>()) ?? []
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
        } as Record<string, (e: React.KeyboardEvent) => void>)[e.key.toLowerCase() as string]?.(e) }>

        {props.controls ? <div className={"list-box-controls"}>
            {props.controls.onSwap ? <>
                <button className="icon-button" onClick={e => {
                    props.controls?.onAdd!(e);
                }}>
                    <lucide.Plus size={14}/> 
                </button>
                <button className="icon-button" onClick={() => {
                    props.controls?.onDelete!(state.index);
                }}>
                    <lucide.Minus size={14} />
                </button>

                <button className="icon-button" onClick={() => {
                    if (props.controls?.onSwap!(state.index, state.index - 1))
                        setState(prev => ({ ...prev, index: state.index - 1 }));
                }}>
                    <lucide.ChevronUp size={14} /> 
                </button>
                <button className="icon-button" onClick={() => {
                    if (props.controls?.onSwap!(state.index, state.index + 1))
                        setState(prev => ({ ...prev, index: prev.index + 1 }));
                }}>
                    <lucide.ChevronDown size={14} />
                </button>
            </> : null}
        </div> : null}

        {props.items.map((item, a) => <div 
            className={`list-item${state.index == a ? " active" : ""}`}
            ref={state.refs[a] } 
            onClick={_ => setState(prev => ({ ...prev, index: a }))}>
                <label>{item.toString()}</label>
        </div>)}

    </div>
}
