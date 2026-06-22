function toHexByte(value) {
    return Math.round(Math.min(Math.max(value, 0), 255))
        .toString(16)
        .padStart(2, '0');
}

function formatAlpha(a) {
    if (Math.abs(a - 1) < 0.0001) return '1';
    return parseFloat(a.toFixed(8)).toString();
}

function hexToShort(hex) {
    if (hex.length !== 7) return null;
    if (hex[1] === hex[2] && hex[3] === hex[4] && hex[5] === hex[6]) {
        return `#${hex[1]}${hex[3]}${hex[5]}`;
    }
    return null;
}

function parseColorString(str) {
    if (typeof str !== 'string') return null;
    str = str.trim();
    let originalInputFormat = null;
    let originalPrefix = '';
    let originalUsesCommas = false;
    let originalHadExplicitAlpha = false;
    const lowerStr = str.toLowerCase();

    if (lowerStr.startsWith('#') || /^(0x)?[0-9a-f]+$/i.test(str)) {
        originalInputFormat = 'hex';
        if (str.startsWith('#')) originalPrefix = '#';
        else if (lowerStr.startsWith('0x')) originalPrefix = str.substring(0, 2);
        const hexContent = str.replace(/^#|^0x/i, '');
        if (
            hexContent.length === 4 ||
            hexContent.length === 8 ||
            (hexContent.length === 10 && lowerStr.startsWith('0x'))
        ) {
            originalHadExplicitAlpha = true;
        }
    } else if (lowerStr.startsWith('rgb')) {
        originalInputFormat = 'rgb';
        originalPrefix = str.substring(0, lowerStr.indexOf('('));
        if (str.includes(',')) originalUsesCommas = true;
        if (
            str.includes('/') ||
            (originalPrefix.toLowerCase() === 'rgba' && str.split(originalUsesCommas ? ',' : ' ').length > 3)
        ) {
            originalHadExplicitAlpha = true;
        }
    } else if (lowerStr.startsWith('hsl')) {
        originalInputFormat = 'hsl';
        originalPrefix = str.substring(0, lowerStr.indexOf('('));
        if (str.includes(',')) originalUsesCommas = true;
        if (
            str.includes('/') ||
            (originalPrefix.toLowerCase() === 'hsla' && str.split(originalUsesCommas ? ',' : ' ').length > 3)
        ) {
            originalHadExplicitAlpha = true;
        }
    } else if (lowerStr.startsWith('oklch')) {
        originalInputFormat = 'oklch';
        originalPrefix = str.substring(0, lowerStr.indexOf('('));
        if (str.includes('/')) originalHadExplicitAlpha = true;
    }

    const colorParseInput = originalInputFormat === 'hex' && !str.startsWith('#') ? `#${str.replace(/^0x/i, '')}` : str;
    const c = colordx(colorParseInput);
    if (c.isValid()) {
        const rgb = c.toRgb();
        const rHex = Math.round(rgb.r).toString(16).padStart(2, '0');
        const gHex = Math.round(rgb.g).toString(16).padStart(2, '0');
        const bHex = Math.round(rgb.b).toString(16).padStart(2, '0');
        const internalHex = (rHex + gHex + bHex).toUpperCase();
        return {
            hex: internalHex,
            alpha: c.alpha(),
            instance: c,
            originalString: str,
            inputFormat: originalInputFormat || 'unknown',
            originalPrefix: originalPrefix,
            originalUsesCommas: originalUsesCommas,
            originalHadExplicitAlpha: originalHadExplicitAlpha
        };
    }
    return null;
}

function formatHex(colorInfo, c, originalPrefix, outputAlpha) {
    const originalHexContent = colorInfo.originalString.replace(/^#|^0x/i, '');
    const isShortHexLen = originalHexContent.length === 3 || originalHexContent.length === 4;
    const hex = c.toHex();
    let output;
    if (outputAlpha) {
        const hexa = hex.length === 7 ? hex + toHexByte(c.alpha() * 255) : hex;
        output = isShortHexLen ? hexToShort(hexa) || hexa : hexa;
    } else {
        const hexNoAlpha = hex.length > 7 ? hex.substring(0, 7) : hex;
        output = isShortHexLen ? hexToShort(hexNoAlpha) || hexNoAlpha : hexNoAlpha;
    }
    if (originalPrefix.toLowerCase() === '0x') {
        if (output.startsWith('#')) {
            if (output.length === 9) {
                output = originalPrefix + output.substring(7, 9) + output.substring(1, 7);
            } else if (output.length === 5 && output.charAt(0) === '#') {
                const r = output[1] + output[1];
                const g = output[2] + output[2];
                const b = output[3] + output[3];
                const a_val = output[4] + output[4];
                output = originalPrefix + a_val + r + g + b;
            } else {
                output = originalPrefix + output.substring(1);
            }
        }
    } else if (originalPrefix === '' && output.startsWith('#')) {
        output = output.substring(1);
    }
    return output;
}

function formatRgb(c, originalPrefix, usesCommas, outputAlpha) {
    const rgb = c.toRgb();
    const r = Math.round(rgb.r);
    const g = Math.round(rgb.g);
    const b = Math.round(rgb.b);
    const a = rgb.alpha;
    let output;
    if (usesCommas) {
        output = outputAlpha ? `rgba(${r}, ${g}, ${b}, ${formatAlpha(a)})` : `rgb(${r}, ${g}, ${b})`;
    } else {
        output = outputAlpha ? `rgb(${r} ${g} ${b} / ${formatAlpha(a)})` : `rgb(${r} ${g} ${b})`;
    }
    if (originalPrefix) {
        const funcName = output.substring(0, output.indexOf('('));
        if (funcName.toLowerCase() !== originalPrefix.toLowerCase()) {
            output = originalPrefix + output.substring(funcName.length);
        }
    }
    return output;
}

function formatHsl(c, originalPrefix, usesCommas, outputAlpha) {
    const hsl = c.toHsl();
    const h = Math.round(hsl.h);
    const s = Math.round(hsl.s);
    const l = Math.round(hsl.l);
    const a = hsl.alpha;
    let output;
    if (usesCommas) {
        output = outputAlpha ? `hsla(${h}, ${s}%, ${l}%, ${formatAlpha(a)})` : `hsl(${h}, ${s}%, ${l}%)`;
    } else {
        output = outputAlpha ? `hsl(${h} ${s}% ${l}% / ${formatAlpha(a)})` : `hsl(${h} ${s}% ${l}%)`;
    }
    if (originalPrefix) {
        const funcName = output.substring(0, output.indexOf('('));
        if (funcName.toLowerCase() !== originalPrefix.toLowerCase()) {
            output = originalPrefix + output.substring(funcName.length);
        }
    }
    return output;
}

function formatOklch(c) {
    return c.toOklchString();
}

function formatDefault(c, originalPrefix, outputAlpha) {
    let output = c.toHex();
    if (outputAlpha) {
        output += toHexByte(c.alpha() * 255).toUpperCase();
    }
    if (output.startsWith('#')) {
        if (originalPrefix.toLowerCase() === '0x') {
            if (outputAlpha) {
                output = originalPrefix + output.substring(7, 9) + output.substring(1, 7);
            } else {
                output = originalPrefix + output.substring(1);
            }
        } else if (originalPrefix === '') {
            output = output.substring(1);
        }
    }
    return output;
}

function formatColorForOutput(colorInfo) {
    if (!colorInfo?.instance?.isValid()) {
        return colorInfo && typeof colorInfo.originalString === 'string' ? colorInfo.originalString : '#000000';
    }
    const c = colorInfo.instance;
    const originalPrefix = colorInfo.originalPrefix || '';
    const usesCommas = colorInfo.originalUsesCommas;
    const outputAlpha =
        colorInfo.originalHadExplicitAlpha ||
        c.alpha() < 1 ||
        (originalPrefix.toLowerCase().endsWith('a') && originalPrefix.length > 3);

    switch (colorInfo.inputFormat) {
        case 'hex':
            return formatHex(colorInfo, c, originalPrefix, outputAlpha);
        case 'rgb':
            return formatRgb(c, originalPrefix, usesCommas, outputAlpha);
        case 'hsl':
            return formatHsl(c, originalPrefix, usesCommas, outputAlpha);
        case 'oklch':
            return formatOklch(c);
        default:
            return formatDefault(c, originalPrefix, outputAlpha);
    }
}

function normalizeHex(hexInput) {
    const normalized =
        typeof hexInput === 'string' && !hexInput.startsWith('#') ? `#${hexInput.replace(/^0x/i, '')}` : hexInput;
    const c = colordx(normalized);
    return c.isValid() ? c.toHex().substring(1, 7).toUpperCase() : '000000';
}

function getContrastingBackground(textColorHex) {
    const textColor = colordx(textColorHex);
    const lightCandidate = '#FFFFFF';
    const darkCandidate = '#282828';
    const contrastWithLight = textColor.contrast(colordx(lightCandidate));
    if (contrastWithLight >= 4.5) {
        return lightCandidate;
    }
    const contrastWithDark = textColor.contrast(colordx(darkCandidate));
    if (contrastWithDark >= 4.5) {
        return darkCandidate;
    }
    return contrastWithLight > contrastWithDark ? lightCandidate : darkCandidate;
}

window.parseColorString = parseColorString;
window.formatColorForOutput = formatColorForOutput;
window.normalizeHex = normalizeHex;
window.getContrastingBackground = getContrastingBackground;
