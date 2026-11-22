/**
 * Host half of the Nahida theme bundle.
 *
 * The theme is entirely a browser-side presentation concern: the Client half
 * (`lib/client.js`) registers theme-token overrides and slot occupants. The Host
 * row only exposes the bundle to the Loader, so this file deliberately has no
 * capability of its own.
 */
export function apply() {}
