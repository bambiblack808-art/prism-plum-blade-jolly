import { n as createMiddleware } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/filters-CHHjLANA.js
/**
* Auth middleware for server functions — the standard way to get the caller's
* verified user id. When deployed the session cookie is same-origin and rides
* along automatically. In the live preview the client also forwards the bearer
* token (partitioned cookies) via the `.client` hook below — call sites do not
* thread it themselves.
*
*   import { createServerFn } from "@tanstack/react-start";
*   import { getSql } from "@/lib/db";
*   import { authMiddleware } from "@/lib/auth/middleware";
*
*   export const listTodos = createServerFn({ method: "GET" })
*     .middleware([authMiddleware])
*     .handler(async ({ context }) => {
*       const sql = await getSql();
*       return sql`select * from todos where user_id = ${context.userId}`;
*     });
*
* Signed out with auth on (live preview included) -> throws `UnauthorizedError`
* (see `verify.server.ts`). With auth disabled (`VITE_AUTH_ENABLED=false`, the
* shipped default) it resolves the shared dev user — but throws instead when a
* `DATABASE_URL` is also set, so an app without sign-in must not use this at
* all. On the auth-on path, use it on every server function that touches
* per-user data and scope every query by `context.userId`.
*/
var authMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
	const { getBearerToken } = await import("./client-CVqXY6bk.mjs").then((n) => n.n);
	return next({ sendContext: { bearerToken: getBearerToken() ?? void 0 } });
}).server(async ({ next, context }) => {
	const { assertSameSiteRequest } = await import("./isolation.server-CGNg1r0B.mjs");
	const { requireUserId } = await import("./verify.server-BxA1Y9kL.mjs");
	assertSameSiteRequest();
	return next({ context: { userId: await requireUserId(context.bearerToken) } });
});
var FILTERS = [
	{
		id: "clear",
		label: "Clear",
		css: "none"
	},
	{
		id: "noir",
		label: "Noir",
		css: "grayscale(1) contrast(1.28) brightness(0.96)"
	},
	{
		id: "honey",
		label: "Honey",
		css: "sepia(0.42) saturate(1.18) contrast(1.06)"
	},
	{
		id: "ice",
		label: "Ice",
		css: "hue-rotate(188deg) saturate(0.72) brightness(1.08) contrast(1.06)"
	},
	{
		id: "punch",
		label: "Punch",
		css: "contrast(1.26) saturate(1.38)"
	},
	{
		id: "halo",
		label: "Halo",
		css: "brightness(1.16) contrast(0.92) saturate(1.04) blur(0.55px)"
	},
	{
		id: "chrome",
		label: "Chrome",
		css: "grayscale(0.18) contrast(1.22) saturate(0.82) brightness(1.04)"
	},
	{
		id: "faded",
		label: "Faded",
		css: "contrast(0.88) saturate(0.68) brightness(1.08) sepia(0.14)"
	},
	{
		id: "pop",
		label: "Pop",
		css: "saturate(1.55) contrast(1.12) hue-rotate(6deg)"
	},
	{
		id: "mono",
		label: "Mono",
		css: "grayscale(1)"
	}
];
var DEFAULT_FILTER_ID = "clear";
function getFilter(id) {
	return FILTERS.find((f) => f.id === id) ?? FILTERS[0];
}
//#endregion
export { getFilter as i, FILTERS as n, authMiddleware as r, DEFAULT_FILTER_ID as t };
