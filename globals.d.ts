// Globals shared between the classic scripts in this app (assignments in one
// file are read by another), plus the vendor bundle excluded from checking.

interface AppState {
    palette: Array<{ name: string; hex: string }>;
    themeItems: any[];
    filteredThemeItems: any[];
    selectedPaletteColor: { name: string; hex: string } | null;
    themeFileDoc: XMLDocument | null;
    themeFileJson: unknown;
    originalThemeFileName: string;
    paletteSortMode: string;
    themeBgColor: string;
}

declare const appState: AppState;
declare const colordx: any;

interface Window {
    appState: AppState;
}

declare function setSelectedPaletteColor(color: { name: string; hex: string }): void;
declare function addPaletteColor(name: string, hex: string): void;
declare function setThemeBgColor(hex: string): void;
