import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { FILTERS } from "@/lib/filters";

const MAX_IMAGE_CHARS = 1_800_000;
const MAX_SHOTS = 24;
const FILTER_IDS = new Set(FILTERS.map((f) => f.id));

export type Shot = {
  id: number;
  filterId: string;
  imageData: string;
  createdAt: string;
};

function asIso(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  return new Date().toISOString();
}

export const listShots = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Shot[]> => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{
      id: number;
      filter_id: string;
      image_data: string;
      created_at: string | Date;
    }>`
      select id, filter_id, image_data, created_at
      from shots
      where user_id = ${context.userId}
      order by created_at desc, id desc
      limit ${MAX_SHOTS}
    `;
    return rows.map((row) => ({
      id: Number(row.id),
      filterId: row.filter_id,
      imageData: row.image_data,
      createdAt: asIso(row.created_at),
    }));
  });

export const saveShot = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      imageData: z
        .string()
        .min(32)
        .max(MAX_IMAGE_CHARS)
        .refine((v) => v.startsWith("data:image/jpeg;base64,"), "Must be a JPEG data URL"),
      filterId: z.string().max(32),
    }),
  )
  .handler(async ({ context, data }): Promise<Shot> => {
    const filterId = FILTER_IDS.has(data.filterId) ? data.filterId : "clear";
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const inserted = await sql<{
      id: number;
      filter_id: string;
      image_data: string;
      created_at: string | Date;
    }>`
      insert into shots (user_id, image_data, filter_id)
      values (${context.userId}, ${data.imageData}, ${filterId})
      returning id, filter_id, image_data, created_at
    `;
    const row = inserted[0];
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
      createdAt: asIso(row.created_at),
    };
  });

export const deleteShot = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.number().int().positive() }))
  .handler(async ({ context, data }): Promise<{ ok: true }> => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`
      delete from shots
      where id = ${data.id} and user_id = ${context.userId}
    `;
    return { ok: true };
  });
