export function toCamel(str: string) {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]$/g, "")
        .replace(/[^a-z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
}

export function toCapCamel(str: string) {
    return toCamel(str).replace(/^[a-z]/g, (chr) => chr.toUpperCase());
}

export function toHyphenLower(str: string): string {
    return str
        .replace(/(?<!^)[A-Z]/g, (match) => "-" + match.toLowerCase())
        .replace(/^[A-Z]/, (match) => match.toLowerCase());
}
