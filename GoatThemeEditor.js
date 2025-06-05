/** Goat Theme Editor
 * @file GoatThemeEditor.js
 * @description Allows importing theme XML files and color palettes, editing
 * colors, and exporting the updated theme XML.
 * @requires GoatColorToolbox.js for color conversions.
 * @license MIT
 * @author Chase McGoat
 * @createdAt 2025-04-25
 * @lastModified 2025-05-22
 * @version 250522.02
 */


// --- State Variables ---
let palette = [];
let themeItems = [];
let filteredThemeItems = [];
let selectedPaletteColor = null;
let themeFileDoc = null;
let originalThemeFileName = "Theme";

// --- Editor UI Theme Management ---
const themeToggleBtn = document.getElementById('themeToggleBtn');

function applyTheme(themeName) {
    if (themeName === 'light') {
        document.body.classList.add('light-theme');
        localStorage.setItem('themeEditorTheme', 'light');
    } else {
        document.body.classList.remove('light-theme');
        localStorage.setItem('themeEditorTheme', 'dark');
    }
    // Re-render palette and theme items if they are already loaded to reflect theme changes
    if (typeof renderPalette === 'function' && (palette.length > 0 || document.getElementById('paletteColors').innerHTML.includes('palette-color'))) {
        renderPalette();
    }
    if (typeof renderThemeItems === 'function' && (filteredThemeItems.length > 0 || themeItems.length > 0)) {
        renderThemeItems();
    }
}

// --- Color Parsing and Formatting ---
function parseColorString(str) {
    if (typeof str !== 'string') return null;
    str = str.trim();
    let originalInputFormat = null;
    let originalPrefix = "";
    let originalUsesCommas = false;
    let originalHadExplicitAlpha = false;
    const lowerStr = str.toLowerCase();

    if (lowerStr.startsWith('#') || /^(0x)?[0-9a-f]+$/i.test(str)) {
        originalInputFormat = "hex";
        if (str.startsWith('#')) originalPrefix = "#";
        else if (lowerStr.startsWith('0x')) originalPrefix = str.substring(0, 2);
        const hexContent = str.replace(/^#|^0x/i, '');
        if (hexContent.length === 4 || hexContent.length === 8 || (hexContent.length === 10 && lowerStr.startsWith('0x'))) {
            originalHadExplicitAlpha = true;
        }
    } else if (lowerStr.startsWith("rgb")) {
        originalInputFormat = "rgb";
        originalPrefix = str.substring(0, lowerStr.indexOf('('));
        if (str.includes(',')) originalUsesCommas = true;
        if (str.includes('/') || (originalPrefix.toLowerCase() === 'rgba' && str.split(originalUsesCommas ? ',' : ' ').length > 3)) {
            originalHadExplicitAlpha = true;
        }
    } else if (lowerStr.startsWith("hsl")) {
        originalInputFormat = "hsl";
        originalPrefix = str.substring(0, lowerStr.indexOf('('));
        if (str.includes(',')) originalUsesCommas = true;
        if (str.includes('/') || (originalPrefix.toLowerCase() === 'hsla' && str.split(originalUsesCommas ? ',' : ' ').length > 3)) {
            originalHadExplicitAlpha = true;
        }
    } else if (lowerStr.startsWith("oklch")) {
        originalInputFormat = "oklch";
        originalPrefix = str.substring(0, lowerStr.indexOf('('));
        if (str.includes('/')) originalHadExplicitAlpha = true;
    }

    const gc = new GoatColor(str); // GoatColor should be globally available.
    if (gc.isValid()) {
        const rgb = gc.toRgb(); // { r, g, b }
        const rHex = Math.round(rgb.r).toString(16).padStart(2, '0');
        const gHex = Math.round(rgb.g).toString(16).padStart(2, '0');
        const bHex = Math.round(rgb.b).toString(16).padStart(2, '0');
        const internalHex = (rHex + gHex + bHex).toUpperCase();
        return {
            hex: internalHex, alpha: gc.a, // GoatColor instance has 'a' property
            goatColor: gc, // Store the GoatColor instance
            originalString: str,
            inputFormat: originalInputFormat || "unknown", // GoatColor doesn't expose _format
            originalPrefix: originalPrefix, originalUsesCommas: originalUsesCommas,
            originalHadExplicitAlpha: originalHadExplicitAlpha,
        };
    }
    return null;
}

function formatColorForOutput(colorInfo) {
    if (!colorInfo || !colorInfo.goatColor || !colorInfo.goatColor.isValid()) {
        return colorInfo && typeof colorInfo.originalString === 'string' ? colorInfo.originalString : "#000000";
    }
    const gc = colorInfo.goatColor;
    const inputFormat = colorInfo.inputFormat;
    const originalPrefix = colorInfo.originalPrefix || "";
    const usesCommas = colorInfo.originalUsesCommas; // This implies legacy format for RGB/HSL
    const outputAlpha = colorInfo.originalHadExplicitAlpha || gc.a < 1 ||
        (originalPrefix.toLowerCase().endsWith('a') && originalPrefix.length > 3);
    let outputString = "";

    switch (inputFormat) {
        case "hex":
            const originalHexContent = colorInfo.originalString.replace(/^#|^0x/i, '');
            const isShortHexLen = originalHexContent.length === 3 || originalHexContent.length === 4;
            if (outputAlpha) {
                const shortHexa = gc.toHexaShort();
                outputString = isShortHexLen && shortHexa ? shortHexa : gc.toHexa();
            } else {
                const shortHex = gc.toHexShort();
                outputString = isShortHexLen && shortHex ? shortHex : gc.toHex();
            }
            if (originalPrefix.toLowerCase() === "0x") {
                if (outputString.startsWith("#")) { // GoatColor hex output always starts with #
                    if (outputString.length === 9) { // #RRGGBBAA from GoatColor
                        outputString = originalPrefix + outputString.substring(7, 9) + outputString.substring(1, 7); // 0x + AA + RRGGBB
                    } else if (outputString.length === 5 && outputString.charAt(0) === '#') { // #RGBA from GoatColor
                        const r = outputString[1] + outputString[1]; const g = outputString[2] + outputString[2]; const b = outputString[3] + outputString[3]; const a_val = outputString[4] + outputString[4];
                        outputString = originalPrefix + a_val + r + g + b; // 0x + AA + RR + GG + BB
                    } else { // e.g. #RRGGBB
                        outputString = originalPrefix + outputString.substring(1); // 0xRRGGBB
                    }
                }
            } else if (originalPrefix === "" && outputString.startsWith("#")) {
                outputString = outputString.substring(1); // Remove # if original had no prefix
            } else if (originalPrefix === "#" && !outputString.startsWith("#")) {
                // This case should not be hit if outputString is from GoatColor hex methods
                outputString = "#" + outputString;
            }
            break;
        case "rgb":
            let rgbBaseString = outputAlpha ? gc.toRgbaString(usesCommas) : gc.toRgbString(usesCommas);
            if (originalPrefix && rgbBaseString.toLowerCase().startsWith(originalPrefix.toLowerCase())) {
                outputString = originalPrefix + rgbBaseString.substring(originalPrefix.length);
            } else if (originalPrefix && outputAlpha && originalPrefix.toLowerCase() === "rgb" && rgbBaseString.toLowerCase().startsWith("rgba")) {
                // Handle case where original was `rgb(...)` but alpha implies `rgba(...)`
                let newPrefixAttempt = originalPrefix + "a";
                if (rgbBaseString.toLowerCase().startsWith(newPrefixAttempt.toLowerCase())) {
                    outputString = newPrefixAttempt + rgbBaseString.substring(newPrefixAttempt.length);
                } else { outputString = rgbBaseString; } // Fallback if prefix logic is complex
            } else { outputString = rgbBaseString; }
            break;
        case "hsl":
            let hslBaseString = outputAlpha ? gc.toHslaString(usesCommas) : gc.toHslString(usesCommas);
            if (originalPrefix && hslBaseString.toLowerCase().startsWith(originalPrefix.toLowerCase())) {
                outputString = originalPrefix + hslBaseString.substring(originalPrefix.length);
            } else { outputString = hslBaseString; }
            break;
        case "oklch":
            outputString = outputAlpha ? gc.toOklchaString() : gc.toOklchString();
            break;
        default: // "unknown" or other formats
            outputString = gc.toString("auto"); // GoatColor's "auto" prefers short hex
            if (outputString.startsWith("#")) { // Apply 0x or no-prefix logic if needed
                if (originalPrefix.toLowerCase() === "0x") {
                    if (outputString.length === 9) { // #RRGGBBAA from GoatColor
                        outputString = originalPrefix + outputString.substring(7, 9) + outputString.substring(1, 7);
                    } else { outputString = originalPrefix + outputString.substring(1); }
                } else if (originalPrefix === "") {
                    outputString = outputString.substring(1);
                }
            }
            break;
    }
    return outputString;
}

function normalizeHex(hexInput) {
    const gc = new GoatColor(hexInput);
    return gc.isValid() ? gc.toHex().substring(1).toUpperCase() : '000000';
}

// --- Contrast Calculation Helpers ---
function getRelativeLuminance(colorString) {
    const color = new GoatColor(colorString);
    if (!color.isValid()) return 0;
    const rgb = color.toRgb(); // { r, g, b }
    const sRGB = [rgb.r, rgb.g, rgb.b].map(function (val) { const s = val / 255; return (s <= 0.03928) ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); });
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}
function calculateContrastRatio(color1String, color2String) { const l1 = getRelativeLuminance(color1String); const l2 = getRelativeLuminance(color2String); return (l1 > l2) ? (l1 + 0.05) / (l2 + 0.05) : (l2 + 0.05) / (l1 + 0.05); }

// --- UI Update Functions ---
function updateButtonStates() {
    const bulkAssignBtn = document.getElementById('bulkAssignBtn');
    const exportBtn = document.getElementById('exportBtn');
    if (!bulkAssignBtn || !exportBtn) {
        console.error("updateButtonStates: bulkAssignBtn or exportBtn not found.");
        return;
    }
    const hasColorItems = themeItems.some(it => it.isColor);
    exportBtn.disabled = !themeFileDoc || !hasColorItems;
    bulkAssignBtn.disabled = !(selectedPaletteColor && filteredThemeItems.some(it => it.isColor));
}

// --- Core Parsing Functions ---
function parsePalette(xml) {
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    if (doc.documentElement.nodeName === 'parsererror') { console.error('Palette XML error:', doc.documentElement.textContent); alert('Error: Invalid Palette XML.'); return []; }
    return Array.from(doc.getElementsByTagName('myColor')).map(e => ({ name: e.getAttribute('name') || 'Unnamed', hex: normalizeHex(e.getAttribute('hexvalue') || '') }));
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
                    items.push({ name: itemName, currentColorHex: parsedColor.hex, colorInfo: parsedColor, el: node, attributeName: attr.name, isColor: true });
                }
            }
        }
        let hasElementChildren = false;
        for (let k = 0; k < node.childNodes.length; k++) { if (node.childNodes[k].nodeType === Node.ELEMENT_NODE) { hasElementChildren = true; traverse(node.childNodes[k]); } }
        if (!hasElementChildren && node.textContent) {
            const textContent = node.textContent.trim();
            if (textContent) {
                const parsedColor = parseColorString(textContent);
                if (parsedColor) { items.push({ name: `${node.nodeName}[_text_]`, currentColorHex: parsedColor.hex, colorInfo: parsedColor, el: node, attributeName: null, isColor: true }); }
            }
        }
    }
    if (doc.documentElement) traverse(doc.documentElement);
    return { doc, items };
}

// --- Rendering Functions ---
function renderPalette() {
    const div = document.getElementById('paletteColors');
    if (!div) { console.error("renderPalette: paletteColors element not found."); return; }
    div.innerHTML = '';
    const isEditorLightTheme = document.body.classList.contains('light-theme');

    palette.forEach(c => {
        const colorHexNoHash = c.hex;
        const d = document.createElement('div');
        d.className = 'palette-color' + (selectedPaletteColor && selectedPaletteColor.hex === colorHexNoHash ? ' selected' : '');
        d.title = (c.name || 'Color') + ' #' + colorHexNoHash;
        d.style.background = '#' + colorHexNoHash;
        d.draggable = true;
        d.ondragstart = (e) => { e.dataTransfer.setData('text/plain', colorHexNoHash); };
        d.onclick = () => { selectedPaletteColor = { name: c.name, hex: colorHexNoHash }; renderPalette(); updateButtonStates(); };
        const label = document.createElement('div');
        label.textContent = '#' + colorHexNoHash;
        label.style.fontSize = '10px'; label.style.textAlign = 'center';
        label.style.color = '#' + colorHexNoHash;
        label.style.marginTop = '2px';
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex'; wrapper.style.flexDirection = 'column'; wrapper.style.alignItems = 'center';
        wrapper.appendChild(d); wrapper.appendChild(label);
        div.appendChild(wrapper);
    });
    const br = document.createElement('div');
    br.style.width = '100%'; br.style.height = '8px';
    div.appendChild(br);
    const grayHexesWithHash = ['#FFFFFF', '#EEEEEE', '#DDDDDD', '#CCCCCC', '#BBBBBB', '#AAAAAA', '#999999', '#888888', '#777777', '#666666', '#555555', '#444444', '#333333', '#222222', '#111111', '#000000'];
    grayHexesWithHash.forEach(grayHexWithHash => {
        const grayHexNoHash = grayHexWithHash.replace('#', '');
        const d = document.createElement('div');
        d.className = 'palette-color' + (selectedPaletteColor && selectedPaletteColor.hex === grayHexNoHash ? ' selected' : '');
        d.title = grayHexWithHash; d.style.background = grayHexWithHash; d.draggable = true;
        d.ondragstart = (e) => { e.dataTransfer.setData('text/plain', grayHexNoHash); };
        d.onclick = () => { selectedPaletteColor = { name: grayHexWithHash, hex: grayHexNoHash }; renderPalette(); updateButtonStates(); };
        const label = document.createElement('div');
        label.textContent = grayHexWithHash; label.style.fontSize = '10px'; label.style.textAlign = 'center';
        const labelTextColor = isEditorLightTheme ? '#000000' : '#FFFFFF';
        label.style.color = labelTextColor; label.style.marginTop = '2px';
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex'; wrapper.style.flexDirection = 'column'; wrapper.style.alignItems = 'center';
        wrapper.appendChild(d); wrapper.appendChild(label);
        div.appendChild(wrapper);
    });
}

// --- Filter and Render Theme Items ---
function renderThemeItems() {
    const themeColorsDiv = document.getElementById('themeColors');
    if (!themeColorsDiv) { console.error("renderThemeItems: themeColors element not found."); return; }
    themeColorsDiv.innerHTML = '';

    filteredThemeItems.forEach((item) => {
        if (!item.isColor) return;

        const row = document.createElement('div');
        row.className = 'color-row';

        row.ondragover = (e) => {
            e.preventDefault();
        };
        row.ondrop = (e) => {
            e.preventDefault();
            const droppedHexNoHash = e.dataTransfer.getData('text/plain');

            if (!/^[0-9A-F]{6}$/i.test(droppedHexNoHash)) {
                console.error("Invalid data dropped:", droppedHexNoHash);
                return;
            }

            const newGc = new GoatColor('#' + droppedHexNoHash);
            if (!newGc.isValid() || !item.colorInfo) {
                console.error("Dropped color is invalid or item.colorInfo is missing.");
                return;
            }

            item.currentColorHex = droppedHexNoHash.toUpperCase();
            item.colorInfo.goatColor = newGc; // Assign GoatColor instance
            item.colorInfo.hex = item.currentColorHex;
            item.colorInfo.alpha = newGc.a; // Update alpha from GoatColor instance

            const formattedValue = formatColorForOutput(item.colorInfo);
            if (item.attributeName) {
                item.el.setAttribute(item.attributeName, formattedValue);
            } else {
                item.el.textContent = formattedValue;
            }
            renderThemeItems();
            updateButtonStates();
        };

        const swatchDiv = document.createElement('div');
        swatchDiv.className = 'color-sample';
        swatchDiv.style.backgroundColor = '#' + item.currentColorHex;
        swatchDiv.style.position = 'relative';

        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = '#' + item.currentColorHex;
        colorInput.style.opacity = 0;
        colorInput.style.position = 'absolute';
        colorInput.style.left = '0'; colorInput.style.top = '0';
        colorInput.style.width = '100%'; colorInput.style.height = '100%';
        colorInput.style.cursor = 'pointer';
        colorInput.oninput = (e) => {
            const newHexFromPicker = e.target.value; // This is #RRGGBB
            const newGcFromPicker = new GoatColor(newHexFromPicker);
            if (newGcFromPicker.isValid() && item.colorInfo) {
                const newHexRRGGBB = newGcFromPicker.toHex().substring(1).toUpperCase();
                item.currentColorHex = newHexRRGGBB;
                item.colorInfo.goatColor = newGcFromPicker; // Assign GoatColor instance
                item.colorInfo.hex = newHexRRGGBB;
                item.colorInfo.alpha = newGcFromPicker.a; // Update alpha
            }
            const formattedValue = formatColorForOutput(item.colorInfo);
            if (item.attributeName) {
                item.el.setAttribute(item.attributeName, formattedValue);
            } else {
                item.el.textContent = formattedValue;
            }
            renderThemeItems();
        };
        swatchDiv.appendChild(colorInput);
        swatchDiv.onclick = () => colorInput.click();
        row.appendChild(swatchDiv);

        let styleName = "";
        let attrKey = "";
        const match = item.name.match(/^(.*?)\[(.*?)\](?:_idx\d+)?$/);
        if (match) {
            styleName = match[1]; attrKey = match[2];
            if (attrKey === "_text_") { attrKey = ""; }
        } else {
            styleName = item.name.replace(/_idx\d+$/, "");
            if (item.attributeName) { attrKey = item.attributeName; }
        }

        const styleNameSpan = document.createElement('span');
        styleNameSpan.textContent = styleName.trim();
        styleNameSpan.title = styleName.trim();
        styleNameSpan.style.color = 'var(--text-body)';
        row.appendChild(styleNameSpan);

        const colorAttrKeySpan = document.createElement('span');
        colorAttrKeySpan.textContent = attrKey;
        colorAttrKeySpan.style.color = 'var(--text-body)';
        row.appendChild(colorAttrKeySpan);

        const valueDetailsSpan = document.createElement('span');
        const originalValueText = formatColorForOutput(item.colorInfo);
        const hexValueText = `#${item.currentColorHex}`;
        let displayText = `${originalValueText} (hex: ${hexValueText}`;
        if (item.colorInfo && item.colorInfo.alpha < 1) { displayText += ` A:${item.colorInfo.alpha.toFixed(2)}`; }
        displayText += `)`;
        valueDetailsSpan.textContent = displayText;
        valueDetailsSpan.style.color = '#' + item.currentColorHex;

        const rowEffectiveBgColor = getComputedStyle(row).backgroundColor;
        const contrastWithRowBg = calculateContrastRatio('#' + item.currentColorHex, rowEffectiveBgColor);
        if (contrastWithRowBg < 3) {
            if (getRelativeLuminance('#' + item.currentColorHex) > 0.5) { valueDetailsSpan.style.backgroundColor = 'rgba(75, 75, 75, 0.67)'; }
            else { valueDetailsSpan.style.backgroundColor = 'rgba(220, 220, 220, 0.67)'; }
        } else { valueDetailsSpan.style.backgroundColor = 'transparent'; }

        valueDetailsSpan.style.padding = '2px 6px';
        valueDetailsSpan.style.borderRadius = '3px';
        row.appendChild(valueDetailsSpan);

        themeColorsDiv.appendChild(row);
    });
    updateButtonStates();
}


// --- Filtering ---
function filterThemeItems() {
    const filterInput = document.getElementById('filterInput');
    if (!filterInput) { console.error("filterThemeItems: filterInput not found."); return; }
    const filterText = filterInput.value.trim().toLowerCase();

    if (filterText) {
        filteredThemeItems = themeItems.filter(item =>
            item.isColor && item.name.toLowerCase().includes(filterText)
        );
    } else {
        filteredThemeItems = themeItems.filter(item => item.isColor);
    }
    filteredThemeItems.sort((a, b) => a.name.localeCompare(b.name));
    renderThemeItems();
}

// --- EXPORT FUNCTION DEFINITION ---
function exportXml() {
    console.log("exportXml function called.");
    if (!themeFileDoc) {
        console.warn("ExportXML called but no themeFileDoc loaded.");
        alert("No theme file loaded to export.");
        return;
    }

    function escapeXml(unsafeStr) {
        const str = String(unsafeStr); // Ensure it's a string
        // The order of replacements is important: & must be done first.
        return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    function formatNode(node, indentLevel) {
        let xml = '';
        const indentStr = '    ';
        const currentIndent = indentStr.repeat(indentLevel);

        switch (node.nodeType) {
            case Node.ELEMENT_NODE:
                xml += '\r\n' + currentIndent + '<' + node.nodeName;
                for (let i = 0; i < node.attributes.length; i++) {
                    const attr = node.attributes[i];
                    xml += ` ${attr.name}="${escapeXml(attr.value)}"`;
                }

                if (node.childNodes.length === 0) {
                    // Truly empty element: <Tag></Tag>
                    xml += `></${node.nodeName}>`;
                } else {
                    // Element has children, determine formatting style
                    let useMultilineFormat = false;
                    for (let i = 0; i < node.childNodes.length; i++) {
                        const childType = node.childNodes[i].nodeType;
                        if (childType === Node.ELEMENT_NODE || childType === Node.COMMENT_NODE) {
                            useMultilineFormat = true;
                            break;
                        }
                    }

                    if (useMultilineFormat) {
                        // Contains nested elements or comments: use multi-line indented format
                        xml += `>`;
                        for (let i = 0; i < node.childNodes.length; i++) {
                            // Recursive call will handle indentation and newlines for children
                            xml += formatNode(node.childNodes[i], indentLevel + 1);
                        }
                        xml += '\r\n' + currentIndent + `</${node.nodeName}>`;
                    } else {
                        // Only contains TEXT_NODE and/or CDATA_SECTION_NODE children: use single-line format
                        xml += `>`;
                        let simpleContent = '';
                        for (let i = 0; i < node.childNodes.length; i++) {
                            const child = node.childNodes[i];
                            if (child.nodeType === Node.TEXT_NODE) {
                                simpleContent += escapeXml(child.nodeValue); // Get raw text value
                            } else if (child.nodeType === Node.CDATA_SECTION_NODE) {
                                simpleContent += `<![CDATA[${child.nodeValue}]]>`;
                            }
                            // Other node types (like PIs) inside such a "simple content" block are rare for UDL
                            // and this logic assumes they are not present or don't affect this formatting choice.
                        }
                        xml += simpleContent;
                        xml += `</${node.nodeName}>`; // Closing tag on the same line
                    }
                }
                break; // End of case Node.ELEMENT_NODE
            case Node.TEXT_NODE:
                if (node.nodeValue.trim() !== '') { xml += escapeXml(node.nodeValue); }
                break;
            case Node.COMMENT_NODE:
                xml += '\r\n' + currentIndent + `<!--${node.nodeValue}-->`;
                break;
            case Node.DOCUMENT_TYPE_NODE:
                let dtString = '<!DOCTYPE ' + node.name;
                if (node.publicId) dtString += ` PUBLIC "${node.publicId}"`;
                if (!node.publicId && node.systemId) dtString += ' SYSTEM';
                if (node.systemId) dtString += ` "${node.systemId}"`;
                dtString += '>';
                xml += '\r\n' + (indentLevel > 0 ? currentIndent : '') + dtString;
                break;
            case Node.PROCESSING_INSTRUCTION_NODE:
                if (node.target.toLowerCase() !== "xml") { xml += '\r\n' + (indentLevel > 0 ? currentIndent : '') + `<?${node.target} ${node.data}?>`; }
                break;
            case Node.CDATA_SECTION_NODE:
                xml += `<![CDATA[${node.nodeValue}]]>`;
                break;
        }
        return xml;
    }

    let xmlDeclaration = '<?xml version="1.0" encoding="UTF-8"?>';
    let leadingContent = '';
    for (let i = 0; i < themeFileDoc.childNodes.length; i++) {
        const child = themeFileDoc.childNodes[i];
        if (child.nodeType === Node.PROCESSING_INSTRUCTION_NODE && child.target.toLowerCase() === "xml") { xmlDeclaration = `<?${child.target} ${child.data}?>`; }
        else if (child !== themeFileDoc.documentElement) { leadingContent += formatNode(child, 0); }
    }
    let formattedRoot = formatNode(themeFileDoc.documentElement, 0);
    if (formattedRoot.startsWith('\r\n')) { formattedRoot = formattedRoot.substring(2); }
    let prettyXml = xmlDeclaration + (leadingContent ? leadingContent + '\r\n' : '\r\n') + formattedRoot;

    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const y = now.getFullYear().toString().slice(-2);
    const m = pad(now.getMonth() + 1);
    const d = pad(now.getDate());
    const H = pad(now.getHours());
    const M = pad(now.getMinutes());
    const filename = `${originalThemeFileName}.${y}${m}${d}${H}${M}.xml`;

    const blob = new Blob([prettyXml], { type: 'application/xml;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
}

// --- Event Listener Setup (Enhanced with Logging and Error Handling) ---
const importPaletteBtn = document.getElementById('importPaletteBtn');
const paletteFileEl = document.getElementById('paletteFile');
const paletteFileNameEl = document.getElementById('paletteFileName');
const importThemeBtn = document.getElementById('importThemeBtn');
const themeFileEl = document.getElementById('themeFile');
const themeFileNameEl = document.getElementById('themeFileName');
const filterInputElement = document.getElementById('filterInput');
const bulkAssignBtnElement = document.getElementById('bulkAssignBtn');
const exportBtnElement = document.getElementById('exportBtn');

if (themeToggleBtn) {
    themeToggleBtn.onclick = () => {
        if (document.body.classList.contains('light-theme')) {
            applyTheme('dark');
        } else {
            applyTheme('light');
        }
    };
} else {
    console.error("Theme toggle button not found!");
}

if (importPaletteBtn && paletteFileEl && paletteFileNameEl) {
    importPaletteBtn.onclick = () => { paletteFileEl.value = null; paletteFileEl.click(); };
    paletteFileEl.onchange = function (e) {
        const file = e.target.files[0];
        if (!file) { paletteFileNameEl.textContent = 'No palette file selected'; return; }
        paletteFileNameEl.textContent = file.name;
        const reader = new FileReader();
        reader.onload = function (ev) {
            try {
                if (ev.target.result) {
                    palette = parsePalette(ev.target.result); renderPalette(); updateButtonStates();
                } else { alert("Error: Palette file content is empty or unreadable."); }
            } catch (error) { alert(`Error processing palette file: ${error.message}`); }
        };
        reader.onerror = function () { alert(`Error reading palette file: ${reader.error ? reader.error.message : 'Unknown error'}`); };
        try {
            reader.readAsText(file);
        } catch (readError) { alert(`Could not start reading palette file: ${readError.message}`); }
    };
} else { console.error("Could not find all required DOM elements for palette import!"); }

if (importThemeBtn && themeFileEl && themeFileNameEl) {
    importThemeBtn.onclick = () => { themeFileEl.value = null; themeFileEl.click(); };
    themeFileEl.onchange = function (e) {
        const file = e.target.files[0];
        if (!file) { themeFileNameEl.textContent = 'No theme file selected'; originalThemeFileName = "Theme"; themeItems = []; themeFileDoc = null; filterThemeItems(); return; }
        themeFileNameEl.textContent = file.name;
        const nameParts = file.name.split('.'); if (nameParts.length > 1) nameParts.pop(); originalThemeFileName = nameParts.join('.') || file.name;
        const reader = new FileReader();
        reader.onload = function (ev) {
            try {
                if (ev.target.result) {
                    const result = parseGenericThemeFile(ev.target.result); themeFileDoc = result.doc; themeItems = result.items;
                    themeItems.sort((a, b) => a.name.localeCompare(b.name));
                    filterThemeItems();
                } else { alert("Error: Theme file content is empty or unreadable."); }
            } catch (error) { alert(`Error processing theme file: ${error.message}`); }
        };
        reader.onerror = function () { alert(`Error reading theme file: ${reader.error ? reader.error.message : 'Unknown error'}`); };
        try {
            reader.readAsText(file);
        } catch (readError) { alert(`Could not start reading theme file: ${readError.message}`); }
    };
} else { console.error("Could not find all required DOM elements for theme import!"); }

if (filterInputElement) {
    filterInputElement.oninput = filterThemeItems;
} else { console.error("Filter input element not found!"); }

if (bulkAssignBtnElement) {
    bulkAssignBtnElement.onclick = function () {
        if (!selectedPaletteColor || !selectedPaletteColor.hex || filteredThemeItems.length === 0) { return; }
        const newHexColorRRGGBB = selectedPaletteColor.hex;
        const newGcBase = new GoatColor('#' + newHexColorRRGGBB); // Base GoatColor for properties
        if (!newGcBase.isValid()) { console.error("Selected palette color for bulk assign is invalid:", newHexColorRRGGBB); return; }

        filteredThemeItems.forEach(item => {
            if (!item.isColor || !item.colorInfo) return;
            item.currentColorHex = newHexColorRRGGBB;
            item.colorInfo.goatColor = new GoatColor('#' + newHexColorRRGGBB); // New instance for each item
            item.colorInfo.hex = newHexColorRRGGBB;
            item.colorInfo.alpha = item.colorInfo.goatColor.a; // Alpha from the new color instance

            const formattedValue = formatColorForOutput(item.colorInfo);
            if (item.attributeName) { item.el.setAttribute(item.attributeName, formattedValue); } else { item.el.textContent = formattedValue; }
        });
        renderThemeItems();
    };
} else { console.error("Bulk Assign button element not found!"); }

if (exportBtnElement) {
    exportBtnElement.onclick = exportXml;
} else { console.error("Export button element not found!"); }

// Initial Setup Calls
const initialTheme = localStorage.getItem('themeEditorTheme') || 'dark';
applyTheme(initialTheme);
updateButtonStates();
renderPalette(); // Render default palette (grays) even if no file loaded
renderThemeItems();