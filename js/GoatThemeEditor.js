/** Goat Theme Editor - Main
 * @file GoatThemeEditor.js
 * @description The main entry point for the application. It initializes the state,
 * contains the core logic, and sets up all event listeners.
 * @license MIT
 * @author Chase McGoat
 */

// --- State Variables ---
window.appState = {
    palette: [],
    themeItems: [],
    filteredThemeItems: [],
    selectedPaletteColor: null,
    themeFileDoc: null,
    themeFileJson: null,
    originalThemeFileName: 'Theme',
    paletteSortMode: 'L',
    themeBgColor: localStorage.getItem('themeEditorBg') || ''
};
const paletteReadId = { value: 0 };
const themeReadId = { value: 0 };

// --- Core Logic Functions ---

function deleteColorFromPalette(hexToDelete) {
    appState.palette = appState.palette.filter((p) => p.hex !== hexToDelete);
    if (appState.selectedPaletteColor && appState.selectedPaletteColor.hex === hexToDelete) {
        appState.selectedPaletteColor = null;
    }
    renderPalette();
}

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
    appState.themeItems.forEach((item) => {
        if (item.isColor && item.currentColorHex && !seen.has(item.currentColorHex)) {
            seen.add(item.currentColorHex);
            colors.push({ name: item.name, hex: item.currentColorHex });
        }
    });
    appState.palette = colors;
    appState.selectedPaletteColor = null;
    appState.paletteSortMode = 'H';
    document.querySelectorAll('.sort-btn').forEach((b) => {
        b.classList.toggle('active', b.dataset.sort === 'H');
    });
    renderPalette();
    updateButtonStates();
}

function clearPalette() {
    appState.palette = [];
    appState.selectedPaletteColor = null;
    renderPalette();
    updateButtonStates();
}

function filterThemeItems() {
    const filterInput = document.getElementById('filterInput');
    if (!filterInput) {
        console.error('filterThemeItems: filterInput not found.');
        return;
    }
    const filterText = filterInput.value.trim().toLowerCase();

    if (filterText) {
        appState.filteredThemeItems = appState.themeItems.filter(
            (item) => item.isColor && item.name.toLowerCase().includes(filterText)
        );
    } else {
        appState.filteredThemeItems = appState.themeItems.filter((item) => item.isColor);
    }
    appState.filteredThemeItems.sort((a, b) => a.name.localeCompare(b.name));
    renderThemeItems();
}

function readFileWithTracker(file, readId, onContent) {
    readId.value++;
    const thisReadId = readId.value;
    const reader = new FileReader();
    reader.onload = (ev) => {
        if (thisReadId !== readId.value) return;
        try {
            if (ev.target.result) {
                onContent(ev.target.result);
            } else {
                alert('Error: File content is empty or unreadable.');
            }
        } catch (error) {
            alert(`Error processing file: ${error.message}`);
        }
    };
    reader.onerror = () => {
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
            renderPalette();
            renderThemeItems();
        };
    }

    if (importPaletteBtn && paletteFileEl && paletteFileNameEl) {
        importPaletteBtn.onclick = () => {
            paletteFileEl.value = null;
            paletteFileEl.click();
        };
        paletteFileEl.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) {
                paletteFileNameEl.textContent = 'No palette file selected';
                return;
            }
            paletteFileNameEl.textContent = file.name;
            readFileWithTracker(file, paletteReadId, (content) => {
                appState.palette = parsePalette(content);
                renderPalette();
                updateButtonStates();
            });
        };
    }

    if (importThemeBtn && themeFileEl && themeFileNameEl) {
        importThemeBtn.onclick = () => {
            themeFileEl.value = null;
            themeFileEl.click();
        };
        themeFileEl.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) {
                themeFileNameEl.textContent = 'No theme file selected';
                appState.originalThemeFileName = 'Theme';
                appState.themeItems = [];
                appState.themeFileDoc = null;
                appState.themeFileJson = null;
                filterThemeItems();
                return;
            }
            themeFileNameEl.textContent = file.name;
            const nameParts = file.name.split('.');
            if (nameParts.length > 1) nameParts.pop();
            appState.originalThemeFileName = nameParts.join('.') || file.name;
            readFileWithTracker(file, themeReadId, (content) => {
                const result = parseGenericThemeFile(content);
                appState.themeFileDoc = result.doc;
                appState.themeFileJson = result.data || null;
                appState.themeItems = result.items;
                appState.themeItems.sort((a, b) => a.name.localeCompare(b.name));
                populatePaletteFromTheme();
                filterThemeItems();
            });
        };
    }

    if (filterInputElement) {
        filterInputElement.oninput = filterThemeItems;
    }

    if (bulkAssignBtnElement) {
        bulkAssignBtnElement.onclick = () => {
            if (!appState.selectedPaletteColor?.hex || appState.filteredThemeItems.length === 0) {
                return;
            }
            const newColorStr = `#${appState.selectedPaletteColor.hex}`;
            appState.filteredThemeItems.forEach((item) => {
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

    document.querySelectorAll('.sort-btn').forEach((btn) => {
        if (btn.dataset.sort === appState.paletteSortMode) btn.classList.add('active');
        btn.onclick = () => {
            document.querySelectorAll('.sort-btn').forEach((b) => {
                b.classList.remove('active');
            });
            btn.classList.add('active');
            appState.paletteSortMode = btn.dataset.sort;
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
