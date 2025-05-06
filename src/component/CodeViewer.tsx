import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { html } from '@codemirror/lang-html'

interface JsonCodeViewerProps {
    value: Record<string, any> | string;
    height?: string;
    isDark?: boolean;
    fontSize?: string;
    className?: string;
    readOnly?: boolean;
}

interface HtmlCodeViewerProps {
    value: string;
    height?: string;
    isDark?: boolean;
    fontSize?: string;
    className?: string;
    readOnly?: boolean;
}

export const JsonCodeViewer = (
    {value, height = '500px', isDark = false, fontSize = '14px', className = 'code-mirror scr-w2', readOnly = true}: JsonCodeViewerProps
) => {
    return (
        <CodeMirror
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            readOnly={readOnly}
            className={className}
            height={height}
            extensions={[json()]}
            theme={isDark ? 'dark' : 'light'}
            style={{fontSize}}
        />
    )
}

export const HtmlCodeViewer = (
    {value, height = '500px', isDark = false, fontSize = '14px', className = 'code-mirror scr-w2', readOnly = true}: HtmlCodeViewerProps
) => {
    return (
        <CodeMirror
            value={value}
            readOnly={readOnly}
            className={className}
            height={height}
            extensions={[html()]}
            theme={isDark ? 'dark' : 'light'}
            style={{fontSize}}
        />
    )
}
