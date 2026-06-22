/** Goat Theme Editor - File I/O
 * @file GoatThemeEditorIO.js
 * @description Manages file import/export logic, including parsing palettes
 * and theme files, and exporting the final XML.
 * @license MIT
 * @author Chase McGoat
 */

function detectContentFormat(trimmed, parseCss, parseJson, parseXml, nonEmpty) {
    if (trimmed.includes('--')) {
        const result = parseCss(trimmed);
        if (nonEmpty(result)) return result;
    }
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        return parseJson(trimmed);
    }
    if (trimmed.includes('{') && trimmed.includes(';')) {
        const result = parseCss(trimmed);
        if (nonEmpty(result)) return result;
    }
    return parseXml(trimmed);
}

function parsePalette(content) {
    const trimmed = content.replace(/^\uFEFF/, '').trim();
    if (!trimmed) return [];
    return detectContentFormat(trimmed, parsePaletteCss, parsePaletteJson, parsePaletteXml, (r) => r.length > 0);
}

function parsePaletteXml(xml) {
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    if (doc.documentElement.nodeName === 'parsererror') {
        console.error('Palette XML error:', doc.documentElement.textContent);
        alert('Error: Invalid Palette XML.');
        return [];
    }
    return Array.from(doc.getElementsByTagName('myColor'))
        .map((e) => {
            const name = e.getAttribute('name') || 'Unnamed';
            const colorStr =
                e.getAttribute('hexvalue') ||
                e.getAttribute('hslValue') ||
                e.getAttribute('rgbValue') ||
                e.getAttribute('oklchValue') ||
                e.getAttribute('value') ||
                '';
            return { name, hex: normalizeHex(colorStr) };
        })
        .filter((e) => e.hex !== '000000');
}

function parsePaletteCss(css) {
    const palette = [];
    const seen = new Set();
    const re = /--([^:]+):\s*([^;]+?)\s*;/gi;
    let match;
    while ((match = re.exec(css)) !== null) {
        const name = match[1].trim();
        const colorStr = match[2].trim();
        const hex = normalizeHex(colorStr);
        if (hex !== '000000' && !seen.has(hex)) {
            seen.add(hex);
            palette.push({ name, hex });
        }
    }
    return palette;
}

function safeParseJson(json, errorMessage) {
    try {
        return JSON.parse(json);
    } catch (_e) {
        alert(errorMessage);
        return null;
    }
}

function walkJsonValues(data, onString, prefix) {
    if (Array.isArray(data)) {
        if (data.length >= 3 && data.length <= 4 && data.every((v) => typeof v === 'number')) {
            onString(prefix || '', `rgb(${Math.round(data[0])}, ${Math.round(data[1])}, ${Math.round(data[2])})`);
            return;
        }
        data.forEach((item, i) => {
            const key = prefix ? `${prefix}[${i}]` : `color-${i + 1}`;
            if (typeof item === 'string') {
                onString(key, item);
            } else if (item && typeof item === 'object') {
                walkJsonValues(item, onString, key);
            }
        });
    } else if (data && typeof data === 'object') {
        Object.entries(data).forEach(([key, value]) => {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            if (typeof value === 'string') {
                onString(fullKey, value);
            } else if (value && typeof value === 'object') {
                walkJsonValues(value, onString, fullKey);
            }
        });
    }
}

function parsePaletteJson(json) {
    const data = safeParseJson(json, 'Error: Invalid Palette JSON.');
    if (!data) return [];

    const seen = new Set();
    const palette = [];

    walkJsonValues(data, (name, value) => {
        const hex = normalizeHex(value);
        if (hex !== '000000' && !seen.has(hex)) {
            seen.add(hex);
            palette.push({ name: name || 'Unnamed', hex });
        }
    });

    return palette;
}

function parseGenericThemeFile(content) {
    const trimmed = content.replace(/^\uFEFF/, '').trim();
    if (!trimmed) return { doc: null, items: [] };
    return detectContentFormat(
        trimmed,
        parseGenericThemeCss,
        parseGenericThemeJson,
        parseGenericThemeXml,
        (r) => r.items.length > 0
    );
}

function parseGenericThemeXml(xml) {
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    if (doc.documentElement.nodeName === 'parsererror') {
        console.error('Theme XML error:', doc.documentElement.textContent);
        alert('Error: Invalid Theme XML.');
        return { doc: null, items: [] };
    }
    const items = [];

    function traverse(node) {
        if (node.nodeType !== Node.ELEMENT_NODE) return;

        if (node.attributes) {
            for (let i = 0; i < node.attributes.length; i++) {
                const attr = node.attributes[i];
                const parsedColor = parseColorString(attr.value);
                if (parsedColor) {
                    const styleNameAttribute = node.getAttribute('name');
                    const itemName = styleNameAttribute
                        ? `${styleNameAttribute}[${attr.name}]`
                        : `${node.nodeName}[${attr.name}]_idx${items.length}`;
                    items.push({
                        id: `gte-item-${items.length}`,
                        name: itemName,
                        currentColorHex: parsedColor.hex,
                        colorInfo: parsedColor,
                        el: node,
                        attributeName: attr.name,
                        isColor: true
                    });
                }
            }
        }

        let hasElementChildren = false;
        for (let i = 0; i < node.childNodes.length; i++) {
            if (node.childNodes[i].nodeType === Node.ELEMENT_NODE) {
                hasElementChildren = true;
                break;
            }
        }

        if (hasElementChildren) {
            for (let i = 0; i < node.childNodes.length; i++) {
                traverse(node.childNodes[i]);
            }
        } else {
            const textContent = node.textContent.trim();
            if (textContent && /^#|^rgb|^hsl|^oklch|^[0-9a-fA-F]{3,}$/.test(textContent)) {
                const parsedColor = parseColorString(textContent);
                if (parsedColor) {
                    items.push({
                        id: `gte-item-${items.length}`,
                        name: `${node.nodeName}[_text_]`,
                        currentColorHex: parsedColor.hex,
                        colorInfo: parsedColor,
                        el: node,
                        attributeName: null,
                        isColor: true
                    });
                }
            }
        }
    }

    if (doc.documentElement) traverse(doc.documentElement);
    return { doc, items };
}

function parseGenericThemeCss(css) {
    const items = [];
    const re = /--([^:]+):\s*([^;]+?)\s*;/gi;
    let match;
    while ((match = re.exec(css)) !== null) {
        const name = match[1].trim();
        const colorStr = match[2].trim();
        const parsedColor = parseColorString(colorStr);
        if (parsedColor) {
            items.push({
                id: `gte-item-${items.length}`,
                name: name,
                currentColorHex: parsedColor.hex,
                colorInfo: parsedColor,
                el: null,
                attributeName: null,
                isColor: true
            });
        }
    }
    return { doc: null, items };
}

function parseGenericThemeJson(json) {
    const data = safeParseJson(json, 'Error: Invalid Theme JSON.');
    if (!data) return { doc: null, items: [], data: null };

    const items = [];

    walkJsonValues(data, (key, value) => {
        const parsedColor = parseColorString(value);
        if (parsedColor) {
            items.push({
                id: `gte-item-${items.length}`,
                name: key || 'Unnamed',
                currentColorHex: parsedColor.hex,
                colorInfo: parsedColor,
                el: null,
                attributeName: null,
                isColor: true
            });
        }
    });

    return { doc: null, items, data };
}

function setJsonValueByPath(obj, path, value) {
    const parts = path.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        const arrayMatch = part.match(/^(.+)\[(\d+)\]$/);
        if (arrayMatch) {
            current = current[arrayMatch[1]][parseInt(arrayMatch[2], 10)];
        } else {
            current = current[part];
        }
        if (current == null) return false;
    }
    const last = parts[parts.length - 1];
    const arrayMatch = last.match(/^(.+)\[(\d+)\]$/);
    if (arrayMatch) {
        if (!current[arrayMatch[1]]) return false;
        current[arrayMatch[1]][parseInt(arrayMatch[2], 10)] = value;
    } else {
        current[last] = value;
    }
    return true;
}

function downloadFile(content, mimeType, ext) {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const y = now.getFullYear().toString().slice(-2);
    const m = pad(now.getMonth() + 1);
    const d = pad(now.getDate());
    const H = pad(now.getHours());
    const M = pad(now.getMinutes());
    const filename = `${originalThemeFileName}.${y}${m}${d}${H}${M}${ext}`;
    const blob = new Blob([content], { type: mimeType });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    }, 100);
}

function exportTheme() {
    if (themeFileDoc) {
        const serializer = new XMLSerializer();
        const xmlString = serializer.serializeToString(themeFileDoc);
        downloadFile(xmlString, 'application/xml;charset=utf-8', '.xml');
    } else if (themeFileJson) {
        const modifiedData = JSON.parse(JSON.stringify(themeFileJson));
        themeItems.forEach((item) => {
            if (item.isColor && item.colorInfo) {
                setJsonValueByPath(modifiedData, item.name, item.colorInfo.originalString);
            }
        });
        downloadFile(JSON.stringify(modifiedData, null, '\t'), 'application/json;charset=utf-8', '.json');
    } else {
        alert('No theme file loaded to export.');
    }
}

window.parsePalette = parsePalette;
window.parseGenericThemeFile = parseGenericThemeFile;
window.exportTheme = exportTheme;
