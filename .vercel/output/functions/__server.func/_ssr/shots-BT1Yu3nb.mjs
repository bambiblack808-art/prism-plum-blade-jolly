import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { L as string, N as number, P as object } from "../_libs/@better-auth/core+[...].mjs";
import { n as FILTERS, r as authMiddleware } from "./filters-CHHjLANA.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shots-BT1Yu3nb.js
var MAX_IMAGE_CHARS = 18e5;
var MAX_SHOTS = 24;
var FILTER_IDS = new Set(FILTERS.map((f) => f.id));
function asIso(value) {
	if (typeof value === "string") return value;
	if (value instanceof Date) return value.toISOString();
	return (/* @__PURE__ */ new Date()).toISOString();
}
var listShots_createServerFn_handler = createServerRpc({
	id: "055e8c906866889262896113da5f2b9a35a1f70e17bb6794849d7d4e93480a83",
	name: "listShots",
	filename: "src/lib/shots.ts"
}, (opts) => listShots.__executeServer(opts));
var listShots = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listShots_createServerFn_handler, async ({ context }) => {
	const { getSql } = await import("./db-DkJiuik2.mjs").then((n) => n.t).then((n) => n.t);
	return (await (await getSql())`
      select id, filter_id, image_data, created_at
      from shots
      where user_id = ${context.userId}
      order by created_at desc, id desc
      limit ${MAX_SHOTS}
    `).map((row) => ({
		id: Number(row.id),
		filterId: row.filter_id,
		imageData: row.image_data,
		createdAt: asIso(row.created_at)
	}));
});
var saveShot_createServerFn_handler = createServerRpc({
	id: "67c03c63109ddf99fd5693d3d270e81cdf514ffe43a3c0d377cac373e03f5251",
	name: "saveShot",
	filename: "src/lib/shots.ts"
}, (opts) => saveShot.__executeServer(opts));
var saveShot = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	imageData: string().min(32).max(MAX_IMAGE_CHARS).refine((v) => v.startsWith("data:image/jpeg;base64,"), "Must be a JPEG data URL"),
	filterId: string().max(32)
})).handler(saveShot_createServerFn_handler, async ({ context, data }) => {
	const filterId = FILTER_IDS.has(data.filterId) ? data.filterId : "clear";
	const { getSql } = await import("./db-DkJiuik2.mjs").then((n) => n.t).then((n) => n.t);
	const sql = await getSql();
	const row = (await sql`
      insert into shots (user_id, image_data, filter_id)
      values (${context.userId}, ${data.imageData}, ${filterId})
      returning id, filter_id, image_data, created_at
    `)[0];
	if (!row) throw new Error("Could not save shot");
	await sql`
      delete from shots
      where user_id = ${context.userId}
        and id not in (
          select id from shots
          where user_id = ${context.userId}
          order by created_at desc, id desc
          limit ${MAX_SHOTS}
        )
    `;
	return {
		id: Number(row.id),
		filterId: row.filter_id,
		imageData: row.image_data,
		createdAt: asIso(row.created_at)
	};
});
var deleteShot_createServerFn_handler = createServerRpc({
	id: "a8bd0e2cdf4b5e717008bc5c023d7e5f135adbebdce687151463879d2316b3e7",
	name: "deleteShot",
	filename: "src/lib/shots.ts"
}, (opts) => deleteShot.__executeServer(opts));
var deleteShot = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ id: number().int().positive() })).handler(deleteShot_createServerFn_handler, async ({ context, data }) => {
	const { getSql } = await import("./db-DkJiuik2.mjs").then((n) => n.t).then((n) => n.t);
	await (await getSql())`
      delete from shots
      where id = ${data.id} and user_id = ${context.userId}
    `;
	return { ok: true };
});
//#endregion
export { deleteShot_createServerFn_handler, listShots_createServerFn_handler, saveShot_createServerFn_handler };
