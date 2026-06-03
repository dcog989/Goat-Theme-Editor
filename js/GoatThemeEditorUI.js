/** Goat Theme Editor - UI
 * @file GoatThemeEditorUI.js
 * @description Handles all DOM manipulation and rendering for the application,
 * such as displaying the color palette and the theme item list.
 * @license MIT
 * @author Chase McGoat
 */

function applyTheme(themeName) {
    if (themeName === 'light') {
        document.body.classList.add('light-theme');
        localStorage.setItem('themeEditorTheme', 'light');
    } else {
        document.body.classList.remove('light-theme');
        localStorage.setItem('themeEditorTheme', 'dark');
    }
    const paletteColorsEl = document.getElementById('paletteColors');
    if (typeof renderPalette === 'function' && (palette.length > 0 || (paletteColorsEl && paletteColorsEl.innerHTML.includes('palette-color')))) {
        renderPalette();
    }
    if (typeof renderThemeItems === 'function' && (filteredThemeItems.length > 0 || themeItems.length > 0)) {
        renderThemeItems();
    }
}

function updateButtonStates() {
    const bulkAssignBtn = document.getElementById('bulkAssignBtn');
    const exportBtn = document.getElementById('exportBtn');
    if (!bulkAssignBtn || !exportBtn) { return; }

    const hasColorItems = themeItems.some(it => it.isColor);
    exportBtn.disabled = !themeFileDoc || !hasColorItems;
    bulkAssignBtn.disabled = !(selectedPaletteColor && filteredThemeItems.some(it => it.isColor));
}

function renderPalette() {
    const div = document.getElementById('paletteColors');
    if (!div) { return; }
    div.innerHTML = '';
    const isEditorLightTheme = document.body.classList.contains('light-theme');

    palette.forEach(c => {
        const colorHexNoHash = c.hex;
        const wrapper = document.createElement('div');
        wrapper.className = 'palette-color-wrapper';

        const d = document.createElement('div');
        d.className = 'palette-color' + (selectedPaletteColor && selectedPaletteColor.hex === colorHexNoHash ? ' selected' : '');
        d.title = (c.name || 'Color') + ' #' + colorHexNoHash;
        d.style.background = '#' + colorHexNoHash;
        d.draggable = true;
        d.ondragstart = (e) => { e.dataTransfer.setData('text/plain', colorHexNoHash); };
        d.onclick = () => { window.selectedPaletteColor = { name: c.name, hex: colorHexNoHash }; renderPalette(); updateButtonStates(); };

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'palette-color-delete-btn';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.title = 'Delete color';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteColorFromPalette(colorHexNoHash);
        };

        const label = document.createElement('div');
        label.textContent = '#' + colorHexNoHash;
        label.style.fontSize = '10px';
        label.style.textAlign = 'center';
        label.style.color = isEditorLightTheme ? '#000000' : '#FFFFFF';
        label.style.marginTop = '2px';

        wrapper.appendChild(d);
        wrapper.appendChild(label);
        wrapper.appendChild(deleteBtn);
        div.appendChild(wrapper);
    });

    const br = document.createElement('div');
    br.style.width = '100%';
    br.style.height = '8px';
    div.appendChild(br);

    const grayHexesWithHash = ['#FFFFFF', '#EEEEEE', '#DDDDDD', '#CCCCCC', '#BBBBBB', '#AAAAAA', '#999999', '#888888', '#777777', '#666666', '#555555', '#444444', '#333333', '#222222', '#111111', '#000000'];
    grayHexesWithHash.forEach(grayHexWithHash => {
        const grayHexNoHash = grayHexWithHash.replace('#', '');
        const d = document.createElement('div');
        d.className = 'palette-color' + (selectedPaletteColor && selectedPaletteColor.hex === grayHexNoHash ? ' selected' : '');
        d.title = grayHexWithHash;
        d.style.background = grayHexWithHash;
        d.draggable = true;
        d.ondragstart = (e) => { e.dataTransfer.setData('text/plain', grayHexNoHash); };
        d.onclick = () => { window.selectedPaletteColor = { name: grayHexWithHash, hex: grayHexNoHash }; renderPalette(); updateButtonStates(); };

        const label = document.createElement('div');
        label.textContent = grayHexWithHash;
        label.style.fontSize = '10px';
        label.style.textAlign = 'center';
        const labelTextColor = isEditorLightTheme ? '#000000' : '#FFFFFF';
        label.style.color = labelTextColor;
        label.style.marginTop = '2px';

        const wrapper = document.createElement('div');
        wrapper.className = 'palette-color-wrapper';
        wrapper.appendChild(d);
        wrapper.appendChild(label);
        div.appendChild(wrapper);
    });
}

function updateThemeItemRow(item, row) {
    if (!row) return;

    const swatchDiv = row.querySelector('.color-sample');
    if (swatchDiv) {
        swatchDiv.style.backgroundColor = '#' + item.currentColorHex;
        const colorInput = swatchDiv.querySelector('input[type="color"]');
        if (colorInput) {
            colorInput.value = '#' + item.currentColorHex;
        }
    }

    const valueInput = row.querySelector('.color-value-input');
    const sampleText = row.querySelector('.color-sample-text');
    const fullHex = '#' + item.currentColorHex;

    if (valueInput) {
        valueInput.value = item.colorInfo.originalString;
        valueInput.style.color = getContrastingBackground(fullHex);
        valueInput.style.backgroundColor = fullHex;
    }
    if (sampleText) {
        sampleText.style.color = fullHex;
    }
}

function renderThemeItems() {
    const themeColorsDiv = document.getElementById('themeColors');
    if (!themeColorsDiv) { return; }
    themeColorsDiv.innerHTML = '';

    // Build header row
    const header = document.createElement('div');
    header.className = 'color-row color-row-header';

    const headerSwatch = document.createElement('div');
    headerSwatch.className = 'color-sample col-header';
    header.appendChild(headerSwatch);

    const headerName = document.createElement('span');
    headerName.className = 'style-name col-header';
    headerName.textContent = 'Theme Class';
    header.appendChild(headerName);

    header.appendChild(createResizeHandle('--col-name-width'));

    const headerValue = document.createElement('span');
    headerValue.className = 'col-header-value col-header';
    headerValue.textContent = 'Value';
    header.appendChild(headerValue);

    header.appendChild(createResizeHandle('--col-value-width'));

    const headerPreview = document.createElement('span');
    headerPreview.className = 'color-sample-text col-header';
    headerPreview.textContent = 'Preview';
    header.appendChild(headerPreview);

    themeColorsDiv.appendChild(header);

    // Data rows
    filteredThemeItems.forEach((item) => {
        if (!item.isColor) return;

        const row = document.createElement('div');
        row.className = 'color-row';
        row.id = item.id;

        row.ondragover = (e) => { e.preventDefault(); };
        row.ondrop = (e) => {
            e.preventDefault();
            const droppedHexNoHash = e.dataTransfer.getData('text/plain');
            if (/^[0-9A-F]{6}$/i.test(droppedHexNoHash)) {
                updateItemColor(item, '#' + droppedHexNoHash);
                updateButtonStates();
            }
        };

        const swatchDiv = document.createElement('div');
        swatchDiv.className = 'color-sample';
        swatchDiv.style.position = 'relative';

        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.style.opacity = 0;
        colorInput.style.position = 'absolute';
        colorInput.style.left = '0';
        colorInput.style.top = '0';
        colorInput.style.width = '100%';
        colorInput.style.height = '100%';
        colorInput.style.cursor = 'pointer';
        colorInput.oninput = (e) => {
            updateItemColor(item, e.target.value);
        };
        swatchDiv.appendChild(colorInput);
        swatchDiv.onclick = () => colorInput.click();
        row.appendChild(swatchDiv);

        let styleName = item.name;
        const match = item.name.match(/^(.*?)\[(.*?)\](?:_idx\d+)?$/);
        if (match) {
            styleName = match[1].trim() + ' [' + match[2] + ']';
        } else {
            styleName = item.name.replace(/_idx\d+$/, "");
        }

        const styleNameSpan = document.createElement('span');
        styleNameSpan.className = 'style-name';
        styleNameSpan.textContent = styleName.trim();
        styleNameSpan.title = styleName.trim();
        row.appendChild(styleNameSpan);

        const valueInput = document.createElement('input');
        valueInput.type = 'text';
        valueInput.className = 'color-value-input';
        valueInput.onchange = (e) => {
            if (!updateItemColor(item, e.target.value)) {
                e.target.value = item.colorInfo.originalString;
            }
        };
        row.appendChild(valueInput);

        const sampleText = document.createElement('span');
        sampleText.className = 'color-sample-text';
        sampleText.textContent = 'How quickly the cunning brown foxes vexed the daft jumping zebras. 1 2 3 4 5 6 7 8 9 0 ! $ % & @ / #';
        row.appendChild(sampleText);

        themeColorsDiv.appendChild(row);
        updateThemeItemRow(item, row);
    });
    updateButtonStates();
}

function createResizeHandle(cssProp) {
    const handle = document.createElement('div');
    handle.className = 'resize-handle';

    handle.addEventListener('mousedown', function (e) {
        e.preventDefault();
        const container = document.getElementById('themeColors');
        const prev = handle.previousElementSibling;
        if (!container || !prev) return;

        const startX = e.clientX;
        const startWidth = prev.getBoundingClientRect().width;

        function onMouseMove(ev) {
            const diff = ev.clientX - startX;
            const newWidth = Math.max(60, startWidth + diff);
            container.style.setProperty(cssProp, newWidth + 'px');
            columnWidths[cssProp] = Math.round(newWidth);
        }

        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
            try { localStorage.setItem('themeEditorColWidths', JSON.stringify(columnWidths)); } catch (_) {}
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'col-resize';
    });

    return handle;
}

const columnWidths = (() => {
    try { return JSON.parse(localStorage.getItem('themeEditorColWidths')) || {}; } catch (_) { return {}; }
})();

(function applySavedColumnWidths() {
    const container = document.getElementById('themeColors');
    if (!container) { return; }
    ['--col-name-width', '--col-value-width'].forEach(function (prop) {
        if (columnWidths[prop]) {
            container.style.setProperty(prop, columnWidths[prop] + 'px');
        }
    });
})();

window.applyTheme = applyTheme;
window.updateButtonStates = updateButtonStates;
window.renderPalette = renderPalette;
window.renderThemeItems = renderThemeItems;
window.updateThemeItemRow = updateThemeItemRow;