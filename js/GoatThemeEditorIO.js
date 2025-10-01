/** Goat Theme Editor - File I/O
 * @file GoatThemeEditorIO.js
 * @description Manages file import/export logic, including parsing palettes
 * and theme files, and exporting the final XML.
 * @license MIT
 * @author Chase McGoat
 */

function parsePalette(xml) {
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    if (doc.documentElement.nodeName === 'parsererror') {
        console.error('Palette XML error:', doc.documentElement.textContent);
        alert('Error: Invalid Palette XML.');
        return [];
    }
    return Array.from(doc.getElementsByTagName('myColor')).map(e => {
        const name = e.getAttribute('name') || 'Unnamed';
        const colorStr = e.getAttribute('hexvalue') ||
            e.getAttribute('hslValue') ||
            e.getAttribute('rgbValue') ||
            e.getAttribute('oklchValue') ||
            e.getAttribute('value') ||
            '';
        return { name: name, hex: normalizeHex(colorStr) };
    });
}

function parseGenericThemeFile(xml) {
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
            if (textContent) {
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
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
}