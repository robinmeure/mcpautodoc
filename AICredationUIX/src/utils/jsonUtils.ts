/**
 * Checks if a string is valid JSON
 */
export const isJSON = (text: string): boolean => {
    if (!text) return false;
    text = text.trim();
    
    // First, do a quick check of starting/ending characters
    if (!(text.startsWith('{') && text.endsWith('}')) && 
        !(text.startsWith('[') && text.endsWith(']'))) {
        return false;
    }
    
    // Make sure the content looks like real JSON, not just some text in curly braces
    // Look for common JSON patterns like key-value pairs with quotes
    const hasKeyValuePattern = /"[^"]+"\s*:/i.test(text);
    
    if (!hasKeyValuePattern && text.startsWith('{')) {
        return false;
    }
    
    try {
        JSON.parse(text);
        
        // Additional check - if the parsed result is an array or object with at least one property
        // and has a reasonable size, it's likely a JSON that we want to format
        const parsed = JSON.parse(text);
        const isObject = typeof parsed === 'object' && parsed !== null;
        const hasProperties = isObject && Object.keys(parsed).length > 0;
        const isReasonableSize = text.length > 10 && text.length < 100000; // Avoid formatting tiny or huge JSON
        
        return isObject && hasProperties && isReasonableSize;
    } catch {
        return false;
    }
};

/**
 * Format JSON with syntax highlighting using HTML
 */
export const syntaxHighlightJSON = (json: string): string => {
    if (!json) return '';
    
    try {
        // Parse and re-stringify for consistent formatting
        const obj = JSON.parse(json);
        const formattedJson = JSON.stringify(obj, null, 2);
        
        // Replace JSON syntax with styled spans
        const highlighted = formattedJson
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
                (match) => {
                    if (/^"/.test(match)) {
                        if (/:$/.test(match)) {
                            return `<span style="color: #0f6cbd; font-weight: 600;">${match}</span>`;
                        } else {
                            return `<span style="color: #008000;">${match}</span>`;
                        }
                    } else if (/true|false/.test(match)) {
                        return `<span style="color: #0000ff; font-weight: 600;">${match}</span>`;
                    } else if (/null/.test(match)) {
                        return `<span style="color: #800080; font-weight: 600;">${match}</span>`;
                    } else {
                        // It's a number
                        return `<span style="color: #d83b01;">${match}</span>`;
                    }
                }
            );

        return `<div>${highlighted}</div>`;
    } catch {
        // If there's an error, return the original JSON as plaintext
        return "<pre>" + json + "   </pre>";
    }
};

/**
 * Safely parse JSON content from a message
 */
export const parseMessageJSON = (content: string): object | null => {
    try {
        return JSON.parse(content);
    } catch {
        return null;
    }
};

/**
 * Format JSON for copying to clipboard
 */
export const formatJSONForClipboard = (content: string | object): string => {
    try {
        if (typeof content === 'string') {
            const parsed = JSON.parse(content);
            return JSON.stringify(parsed, null, 2);
        } else {
            return JSON.stringify(content, null, 2);
        }
    } catch {
        return typeof content === 'string' ? content : JSON.stringify(content);
    }
};
