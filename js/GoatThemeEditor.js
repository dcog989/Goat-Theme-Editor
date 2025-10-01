/** Goat Theme Editor - Main
 * @file GoatThemeEditor.js
 * @description The main entry point for the application. It initializes the state,
 * contains the core logic, and sets up all event listeners.
 * @license MIT
 * @author Chase McGoat
 */

// --- State Variables ---
let palette = [];
let themeItems = [];
let filteredThemeItems = [];
let selectedPaletteColor = null;
let themeFileDoc = null;
let originalThemeFileName = "Theme";


// --- Core Logic Functions ---

function addCustomColor() {
    const input = document.getElementById('customColorInput');
    if (!input) return;
    const colorStr = input.value.trim();
    if (!colorStr) return;

    const newColor = new GoatColor(colorStr);
    if (newColor.isValid()) {
        const newHex = newColor.toHex().substring(1).toUpperCase();
        const isDuplicate = palette.some(p => p.hex === newHex);
        if (!isDuplicate) {
            palette.push({
                name: colorStr, // Store original input as name
                hex: newHex
            });
            renderPalette();
        }
        input.value = '';
    } else {
        alert(`'${colorStr}' is not a valid color.`);
    }
}

function deleteColorFromPalette(hexToDelete) {
    palette = palette.filter(p => p.hex !== hexToDelete);
    renderPalette();
}

// --- Centralized State Update Function ---
function updateItemColor(item, newColorString) {
    const row = document.getElementById(item.id);
    const newColorInfo = parseColorString(newColorString);

    if (newColorInfo) {
        if (!newColorString.trim().includes('(')) {
            newColorInfo.inputFormat = item.colorInfo.inputFormat;
            newColorInfo.originalPrefix = item.colorInfo.originalPrefix;
            newColorInfo.originalUsesCommas = item.colorInfo.originalUsesCommas;
            if (item.colorInfo.originalHadExplicitAlpha) {
                newColorInfo.goatColor.setAlpha(item.colorInfo.alpha);
                newColorInfo.alpha = item.colorInfo.alpha;
            }
        }

        const formattedValue = formatColorForOutput(newColorInfo);
        newColorInfo.originalString = formattedValue;

        item.colorInfo = newColorInfo;
        item.currentColorHex = newColorInfo.hex;

        if (item.attributeName) {
            item.el.setAttribute(item.attributeName, formattedValue);
        } else {
            item.el.textContent = formattedValue;
        }

        updateThemeItemRow(item, row);
        return true;
    }
    return false;
}

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


// --- Event Listener Setup ---
document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const importPaletteBtn = document.getElementById('importPaletteBtn');
    const paletteFileEl = document.getElementById('paletteFile');
    const paletteFileNameEl = document.getElementById('paletteFileName');
    const importThemeBtn = document.getElementById('importThemeBtn');
    const themeFileEl = document.getElementById('themeFile');
    const themeFileNameEl = document.getElementById('themeFileName');
    const filterInputElement = document.getElementById('filterInput');
    const bulkAssignBtnElement = document.getElementById('bulkAssignBtn');
    const exportBtnElement = document.getElementById('exportBtn');
    const customColorInputElement = document.getElementById('customColorInput');
    const addCustomColorBtnElement = document.getElementById('addCustomColorBtn');

    if (themeToggleBtn) {
        themeToggleBtn.onclick = () => {
            if (document.body.classList.contains('light-theme')) {
                applyTheme('dark');
            } else {
                applyTheme('light');
            }
        };
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
                        palette = parsePalette(ev.target.result);
                        renderPalette();
                        updateButtonStates();
                    } else { alert("Error: Palette file content is empty or unreadable."); }
                } catch (error) { alert(`Error processing palette file: ${error.message}`); }
            };
            reader.onerror = function () { alert(`Error reading palette file: ${reader.error ? reader.error.message : 'Unknown error'}`); };
            try { reader.readAsText(file); } catch (readError) { alert(`Could not start reading palette file: ${readError.message}`); }
        };
    }

    if (importThemeBtn && themeFileEl && themeFileNameEl) {
        importThemeBtn.onclick = () => { themeFileEl.value = null; themeFileEl.click(); };
        themeFileEl.onchange = function (e) {
            const file = e.target.files[0];
            if (!file) {
                themeFileNameEl.textContent = 'No theme file selected';
                originalThemeFileName = "Theme";
                themeItems = [];
                themeFileDoc = null;
                filterThemeItems();
                return;
            }
            themeFileNameEl.textContent = file.name;
            const nameParts = file.name.split('.');
            if (nameParts.length > 1) nameParts.pop();
            originalThemeFileName = nameParts.join('.') || file.name;
            const reader = new FileReader();
            reader.onload = function (ev) {
                try {
                    if (ev.target.result) {
                        const result = parseGenericThemeFile(ev.target.result);
                        themeFileDoc = result.doc;
                        themeItems = result.items;
                        themeItems.sort((a, b) => a.name.localeCompare(b.name));
                        filterThemeItems();
                    } else { alert("Error: Theme file content is empty or unreadable."); }
                } catch (error) { alert(`Error processing theme file: ${error.message}`); }
            };
            reader.onerror = function () { alert(`Error reading theme file: ${reader.error ? reader.error.message : 'Unknown error'}`); };
            try { reader.readAsText(file); } catch (readError) { alert(`Could not start reading theme file: ${readError.message}`); }
        };
    }

    if (filterInputElement) {
        filterInputElement.oninput = filterThemeItems;
    }

    if (bulkAssignBtnElement) {
        bulkAssignBtnElement.onclick = function () {
            if (!selectedPaletteColor || !selectedPaletteColor.hex || filteredThemeItems.length === 0) { return; }
            const newColorStr = '#' + selectedPaletteColor.hex;
            filteredThemeItems.forEach(item => {
                if (item.isColor) {
                    updateItemColor(item, newColorStr);
                }
            });
        };
    }

    if (exportBtnElement) {
        exportBtnElement.onclick = exportXml;
    }

    if (addCustomColorBtnElement && customColorInputElement) {
        addCustomColorBtnElement.onclick = addCustomColor;
        customColorInputElement.onkeydown = (e) => {
            if (e.key === 'Enter') {
                addCustomColor();
            }
        };
    }

    // Initial Setup Calls
    const initialTheme = localStorage.getItem('themeEditorTheme') || 'dark';
    applyTheme(initialTheme);
    updateButtonStates();
    renderPalette();
    renderThemeItems();
});