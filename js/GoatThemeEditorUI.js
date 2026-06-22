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
    exportBtn.disabled = !(themeFileDoc || themeFileJson) || !hasColorItems;
    bulkAssignBtn.disabled = !(selectedPaletteColor && filteredThemeItems.some(it => it.isColor));
}

function renderPalette() {
    const div = document.getElementById('paletteColors');
    if (!div) { return; }
    div.innerHTML = '';
    const isEditorLightTheme = document.body.classList.contains('light-theme');

    const sorted = [...palette].sort((a, b) => {
        const ca = colordx('#' + a.hex);
        const cb = colordx('#' + b.hex);
        if (!ca.isValid()) return 1;
        if (!cb.isValid()) return -1;
        const ha = ca.toHsl();
        const hb = cb.toHsl();
        const ga = ha.s < 5 ? 1 : 0;
        const gb = hb.s < 5 ? 1 : 0;
        switch (paletteSortMode) {
            case 'L': return ha.l - hb.l;
            case 'C': return ha.s - hb.s;
            case 'H':
                if (ga !== gb) return ga - gb;
                if (ga) return ha.l - hb.l;
                return ha.h - hb.h;
            default: return 0;
        }
    });

    sorted.forEach(c => {
        const colorHexNoHash = c.hex;
        const wrapper = document.createElement('div');
        wrapper.className = 'palette-color-wrapper';

        const d = document.createElement('div');
        d.className = 'palette-color' + (selectedPaletteColor && selectedPaletteColor.hex === colorHexNoHash ? ' selected' : '');
        d.title = (c.name || 'Color') + ' #' + colorHexNoHash;
        d.style.background = '#' + colorHexNoHash;
        d.draggable = true;
        d.ondragstart = (e) => { e.dataTransfer.setData('text/plain', colorHexNoHash); };
        d.onclick = () => { selectedPaletteColor = { name: c.name, hex: colorHexNoHash }; window.selectedPaletteColor = selectedPaletteColor; renderPalette(); updateButtonStates(); };

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

    if (palette.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'palette-empty';
        empty.textContent = 'Import a theme to populate the palette.';
        div.appendChild(empty);
    }

    const addWrapper = document.createElement('div');
    addWrapper.className = 'palette-color-wrapper palette-add-wrapper';
    const addBtn = document.createElement('div');
    addBtn.className = 'palette-color palette-add-btn';
    addBtn.title = 'Add color';
    addBtn.textContent = '+';
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.style.position = 'absolute';
    colorInput.style.opacity = '0';
    colorInput.style.width = '0';
    colorInput.style.height = '0';
    colorInput.onchange = function () {
        const hex = this.value.substring(1).toUpperCase();
        const isDuplicate = palette.some(p => p.hex === hex);
        if (!isDuplicate) {
            palette.push({ name: this.value, hex });
            window.palette = palette;
            renderPalette();
        }
        this.value = '#000000';
    };
    addBtn.onclick = () => colorInput.click();
    addWrapper.appendChild(addBtn);
    addWrapper.appendChild(colorInput);
    div.appendChild(addWrapper);
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
    if (themeBgColor) themeColorsDiv.style.background = themeBgColor;

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

    const headerBg = document.createElement('span');
    headerBg.className = 'col-header-value col-header';
    headerBg.style.display = 'flex';
    headerBg.style.alignItems = 'center';
    headerBg.style.gap = '4px';
    headerBg.style.border = 'none';
    headerBg.style.padding = '0 8px';
    const bgLabel = document.createElement('span');
    bgLabel.textContent = 'Bg:';
    bgLabel.style.fontSize = '0.75rem';
    bgLabel.style.opacity = '0.7';
    const bgPicker = document.createElement('input');
    bgPicker.type = 'color';
    bgPicker.value = themeBgColor || '#1e1e1e';
    bgPicker.style.width = '24px';
    bgPicker.style.height = '24px';
    bgPicker.style.padding = '0';
    bgPicker.style.border = '1px solid var(--border-strong)';
    bgPicker.style.borderRadius = '3px';
    bgPicker.style.cursor = 'pointer';
    bgPicker.style.background = 'none';
    bgPicker.title = 'Pick a color';
    const bgText = document.createElement('input');
    bgText.type = 'text';
    bgText.style.width = '72px';
    bgText.style.height = '22px';
    bgText.style.padding = '1px 4px';
    bgText.style.border = '1px solid var(--border-strong)';
    bgText.style.borderRadius = '3px';
    bgText.style.fontSize = '0.75rem';
    bgText.style.fontFamily = '"Source Code Pro", monospace';
    bgText.style.background = 'var(--bg-input)';
    bgText.style.color = 'var(--text-input)';
    bgText.placeholder = '#1e1e1e';
    bgText.title = 'Any CSS color format';
    function applyBg(value) {
        const c = colordx(value);
        if (c.isValid()) {
            const hex = c.toHex();
            themeBgColor = hex;
            window.themeBgColor = themeBgColor;
            try { localStorage.setItem('themeEditorBg', themeBgColor); } catch (_) {}
            themeColorsDiv.style.background = hex;
            bgPicker.value = hex;
            bgText.value = value;
            return true;
        }
        return false;
    }
    bgPicker.onchange = function () { applyBg(this.value); };
    bgText.onchange = function () { applyBg(this.value); };
    bgText.onkeydown = function (e) { if (e.key === 'Enter') applyBg(this.value); };
    headerBg.appendChild(bgLabel);
    headerBg.appendChild(bgPicker);
    headerBg.appendChild(bgText);
    header.appendChild(headerBg);

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

window.applyTheme = applyTheme;
window.renderPalette = renderPalette;
window.updateThemeItemRow = updateThemeItemRow;
window.renderThemeItems = renderThemeItems;
