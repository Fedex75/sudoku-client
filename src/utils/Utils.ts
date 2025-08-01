export function brightness(x: number, p: number, q: number, l: number) {
    let t = (-q - l) * p + l;
    const k = 0.2;
    return Math.max(0, k * (1 - Math.abs(2 / l * (x + t) - 1)));
}

export function packNotes(notes: Set<number>): number {
    let n = 0;
    for (const note of notes) {
        n = n | (1 << (note - 1));
    }
    return n;
}
