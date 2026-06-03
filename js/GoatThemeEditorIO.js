/** Goat Theme Editor - File I/O
 * @file GoatThemeEditorIO.js
 * @description Manages file import/export logic, including parsing palettes
 * and theme files, and exporting the final XML.
 * @license MIT
 * @author Chase McGoat
 */

function parsePalette(content) {
    const trimmed = content.replace(/^\uFEFF/, '').trim();
    if (!trimmed) return [];
    if (trimmed.includes('--')) {
        const cssResult = parsePaletteCss(trimmed);
        if (cssResult.length > 0) return cssResult;
    }
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        return parsePaletteJson(trimmed);
    }
    if (trimmed.includes('{') && trimmed.includes(';')) {
        const cssResult = parsePaletteCss(trimmed);
        if (cssResult.length > 0) return cssResult;
    }
    return parsePaletteXml(trimmed);
}

function parsePaletteXml(xml) {
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    if (doc.documentElement.nodeName === 'parsererror') {
        console.error('Palette XML error:', doc.documentElement.textContent);
        alert('Error: Invalid Palette XML.');
        return [];
    }
    return Array.from(doc.getElementsByTagName('myColor'))
        .map(e => {
            const name = e.getAttribute('name') || 'Unnamed';
            const colorStr = e.getAttribute('hexvalue') ||
                e.getAttribute('hslValue') ||
                e.getAttribute('rgbValue') ||
                e.getAttribute('oklchValue') ||
                e.getAttribute('value') ||
                '';
            return { name, hex: normalizeHex(colorStr) };
        })
        .filter(e => e.hex !== '000000');
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

function parsePaletteJson(json) {
    let data;
    try {
        data = JSON.parse(json);
    } catch (e) {
        alert('Error: Invalid Palette JSON.');
        return [];
    }
    const palette = [];
    const seen = new Set();

    function tryAdd(name, value) {
        if (typeof value !== 'string') return;
        const hex = normalizeHex(value);
        if (hex !== '000000' && !seen.has(hex)) {
            seen.add(hex);
            palette.push({ name: name || 'Unnamed', hex });
        }
    }

    if (Array.isArray(data)) {
        data.forEach((item, i) => {
            if (typeof item === 'string') {
                tryAdd(`color-${i + 1}`, item);
            } else if (item && typeof item === 'object') {
                const name = item.name || item.label || item.key || `color-${i + 1}`;
                const value = item.hex || item.value || item.color || item.rgb || item.hsl || '';
                tryAdd(name, value);
            }
        });
    } else if (data && typeof data === 'object') {
        const arr = data.colors || data.palette || data.theme || null;
        if (Array.isArray(arr)) {
            arr.forEach((item, i) => {
                if (typeof item === 'string') {
                    tryAdd(`color-${i + 1}`, item);
                } else if (item && typeof item === 'object') {
                    const name = item.name || item.label || item.key || `color-${i + 1}`;
                    const value = item.hex || item.value || item.color || item.rgb || item.hsl || '';
                    tryAdd(name, value);
                }
            });
        } else {
            Object.entries(data).forEach(([key, value]) => {
                if (typeof value === 'string') {
                    tryAdd(key, value);
                }
            });
        }
    }
    return palette;
}

function parseGenericThemeFile(content) {
    const trimmed = content.replace(/^\uFEFF/, '').trim();
    if (!trimmed) return { doc: null, items: [] };
    if (trimmed.includes('--')) {
        const result = parseGenericThemeCss(trimmed);
        if (result.items.length > 0) return result;
    }
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        return parseGenericThemeJson(trimmed);
    }
    if (trimmed.includes('{') && trimmed.includes(';')) {
        const result = parseGenericThemeCss(trimmed);
        if (result.items.length > 0) return result;
    }
    return parseGenericThemeXml(trimmed);
}

function parseGenericThemeXml(xml) {
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    if (doc.documentElement.nodeName === 'parsererror') { console.error('Theme XML error:', doc.documentElement.textContent); alert('Error: Invalid Theme XML.'); return { doc: null, items: [] }; }
    const items = [];

    function traverse(node) {
        if (node.nodeType !== Node.ELEMENT_NODE) return;

        if (node.attributes) {
            for (let i = 0; i < node.attributes.length; i++) {
                const attr = node.attributes[i];
                const parsedColor = parseColorString(attr.value);
                if (parsedColor) {
                    const styleNameAttribute = node.getAttribute('name');
                    const itemName = styleNameAttribute ? `${styleNameAttribute}[${attr.name}]` : `${node.nodeName}[${attr.name}]_idx${items.length}`;
                    items.push({ id: `gte-item-${items.length}`, name: itemName, currentColorHex: parsedColor.hex, colorInfo: parsedColor, el: node, attributeName: attr.name, isColor: true });
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
                    items.push({ id: `gte-item-${items.length}`, name: `${node.nodeName}[_text_]`, currentColorHex: parsedColor.hex, colorInfo: parsedColor, el: node, attributeName: null, isColor: true });
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
    let data;
    try {
        data = JSON.parse(json);
    } catch (e) {
        alert('Error: Invalid Theme JSON.');
        return { doc: null, items: [] };
    }
    const items = [];

    function tryAdd(key, value) {
        if (typeof value !== 'string') return;
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
    }

    function traverse(obj, prefix) {
        if (Array.isArray(obj)) {
            obj.forEach((item, i) => {
                if (typeof item === 'string') {
                    tryAdd(prefix ? `${prefix}[${i}]` : `color-${i + 1}`, item);
                } else if (item && typeof item === 'object') {
                    traverse(item, prefix ? `${prefix}[${i}]` : `color-${i + 1}`);
                }
            });
        } else if (obj && typeof obj === 'object') {
            Object.entries(obj).forEach(([key, value]) => {
                const fullKey = prefix ? `${prefix}.${key}` : key;
                if (typeof value === 'string') {
                    tryAdd(fullKey, value);
                } else if (value && typeof value === 'object') {
                    traverse(value, fullKey);
                }
            });
        }
    }

    traverse(data, '');
    return { doc: null, items };
}

function exportXml() {
    if (!themeFileDoc) {
        console.warn("ExportXML called but no themeFileDoc loaded.");
        alert("No theme file loaded to export.");
        return;
    }

    const serializer = new XMLSerializer();
    const xmlString = serializer.serializeToString(themeFileDoc);

    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const y = now.getFullYear().toString().slice(-2);
    const m = pad(now.getMonth() + 1);
    const d = pad(now.getDate());
    const H = pad(now.getHours());
    const M = pad(now.getMinutes());
    const filename = `${originalThemeFileName}.${y}${m}${d}${H}${M}.xml`;

    const blob = new Blob([xmlString], { type: 'application/xml;charset=utf-8' });
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

window.parsePalette = parsePalette;
window.parseGenericThemeFile = parseGenericThemeFile;
window.exportXml = exportXml;