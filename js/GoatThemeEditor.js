/** Goat Theme Editor - Main
 * @file GoatThemeEditor.js
 * @description The main entry point for the application. It initializes the state,
 * contains the core logic, and sets up all event listeners.
 * @license MIT
 * @author Chase McGoat
 */

// --- State Variables ---
let palette = []; window.palette = palette;
let themeItems = []; window.themeItems = themeItems;
let filteredThemeItems = []; window.filteredThemeItems = filteredThemeItems;
let selectedPaletteColor = null; window.selectedPaletteColor = selectedPaletteColor;
let themeFileDoc = null; window.themeFileDoc = themeFileDoc;
let themeFileJson = null; window.themeFileJson = themeFileJson;
let originalThemeFileName = "Theme"; window.originalThemeFileName = originalThemeFileName;
const paletteReadId = { value: 0 };
const themeReadId = { value: 0 };
let paletteSortMode = 'L'; window.paletteSortMode = paletteSortMode;
let themeBgColor = localStorage.getItem('themeEditorBg') || ''; window.themeBgColor = themeBgColor;


// --- Core Logic Functions ---

function deleteColorFromPalette(hexToDelete) {
    palette = palette.filter(p => p.hex !== hexToDelete); window.palette = palette;
    if (selectedPaletteColor && selectedPaletteColor.hex === hexToDelete) {
        selectedPaletteColor = null; window.selectedPaletteColor = selectedPaletteColor;
    }
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
        }

        const formattedValue = formatColorForOutput(newColorInfo);
        newColorInfo.originalString = formattedValue;

        item.colorInfo = newColorInfo;
        item.currentColorHex = newColorInfo.hex;

        if (item.el) {
            if (item.attributeName) {
                item.el.setAttribute(item.attributeName, formattedValue);
            } else {
                item.el.textContent = formattedValue;
            }
        }

        updateThemeItemRow(item, row);
        return true;
    }
    return false;
}

function populatePaletteFromTheme() {
    const seen = new Set();
    const colors = [];
    themeItems.forEach(item => {
        if (item.isColor && item.currentColorHex && !seen.has(item.currentColorHex)) {
            seen.add(item.currentColorHex);
            colors.push({ name: item.name, hex: item.currentColorHex });
        }
    });
    palette = colors; window.palette = palette;
    selectedPaletteColor = null; window.selectedPaletteColor = selectedPaletteColor;
    paletteSortMode = 'H'; window.paletteSortMode = paletteSortMode;
    document.querySelectorAll('.sort-btn').forEach(b => b.classList.toggle('active', b.dataset.sort === 'H'));
    renderPalette();
    updateButtonStates();
}

function clearPalette() {
    palette = []; window.palette = palette;
    selectedPaletteColor = null; window.selectedPaletteColor = selectedPaletteColor;
    renderPalette();
    updateButtonStates();
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
    window.filteredThemeItems = filteredThemeItems;
    filteredThemeItems.sort((a, b) => a.name.localeCompare(b.name));
    renderThemeItems();
}


function readFileWithTracker(file, readId, onContent) {
    readId.value++;
    const thisReadId = readId.value;
    const reader = new FileReader();
    reader.onload = function (ev) {
        if (thisReadId !== readId.value) return;
        try {
            if (ev.target.result) {
                onContent(ev.target.result);
            } else {
                alert("Error: File content is empty or unreadable.");
            }
        } catch (error) {
            alert(`Error processing file: ${error.message}`);
        }
    };
    reader.onerror = function () {
        if (thisReadId !== readId.value) return;
        alert(`Error reading file: ${reader.error ? reader.error.message : 'Unknown error'}`);
    };
    try {
        reader.readAsText(file);
    } catch (readError) {
        alert(`Could not start reading file: ${readError.message}`);
    }
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
    const clearPaletteBtnElement = document.getElementById('clearPaletteBtn');

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
            readFileWithTracker(file, paletteReadId, content => {
                palette = parsePalette(content); window.palette = palette;
                renderPalette();
                updateButtonStates();
            });
        };
    }

    if (importThemeBtn && themeFileEl && themeFileNameEl) {
        importThemeBtn.onclick = () => { themeFileEl.value = null; themeFileEl.click(); };
        themeFileEl.onchange = function (e) {
            const file = e.target.files[0];
            if (!file) {
                themeFileNameEl.textContent = 'No theme file selected';
                originalThemeFileName = "Theme"; window.originalThemeFileName = originalThemeFileName;
                themeItems = []; window.themeItems = themeItems;
                themeFileDoc = null; window.themeFileDoc = themeFileDoc;
                themeFileJson = null; window.themeFileJson = themeFileJson;
                filterThemeItems();
                return;
            }
            themeFileNameEl.textContent = file.name;
            const nameParts = file.name.split('.');
            if (nameParts.length > 1) nameParts.pop();
            originalThemeFileName = nameParts.join('.') || file.name; window.originalThemeFileName = originalThemeFileName;
            readFileWithTracker(file, themeReadId, content => {
                const result = parseGenericThemeFile(content);
                themeFileDoc = result.doc; window.themeFileDoc = themeFileDoc;
                themeFileJson = result.data || null; window.themeFileJson = themeFileJson;
                themeItems = result.items; window.themeItems = themeItems;
                themeItems.sort((a, b) => a.name.localeCompare(b.name));
                populatePaletteFromTheme();
                filterThemeItems();
            });
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
        exportBtnElement.onclick = exportTheme;
    }

    if (clearPaletteBtnElement) {
        clearPaletteBtnElement.onclick = clearPalette;
    }

    document.querySelectorAll('.sort-btn').forEach(btn => {
        if (btn.dataset.sort === paletteSortMode) btn.classList.add('active');
        btn.onclick = () => {
            document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            paletteSortMode = btn.dataset.sort; window.paletteSortMode = paletteSortMode;
            renderPalette();
        };
    });

    // Initial Setup Calls
    const initialTheme = localStorage.getItem('themeEditorTheme') || 'dark';
    applyTheme(initialTheme);
    renderPalette();
    renderThemeItems();
});

window.updateItemColor = updateItemColor;
window.deleteColorFromPalette = deleteColorFromPalette;
window.filterThemeItems = filterThemeItems;
window.clearPalette = clearPalette;
