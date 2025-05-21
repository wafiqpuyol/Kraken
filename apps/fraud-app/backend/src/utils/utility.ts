export const asciiCodesToString = (codes: Uint32Array): string => {
    return String.fromCharCode(...codes);
}