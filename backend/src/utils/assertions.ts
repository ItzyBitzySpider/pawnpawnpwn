/**
 * Throws an exception indicating that a code path is unreachable.
 * This is mainly used for TypeScript compiler checks.
 * @param {never} value - The value that should never be reached.
 * @returns {never}
 */
export function assertUnreachable(value) {
    throw new Error(`Unreachable code reached with value: ${value}`);
}

export function assertNever() {
    throw new Error(`Unreachable code reached`);
}