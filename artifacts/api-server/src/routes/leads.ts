import { Router, type IRouter } from "express";
import { db, leadsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

function sanitize(row: typeof leadsTable.$inferSelect) {
  return {
    ...row,
    phone: row.phone ?? "",
    whatsappNumber: row.whatsappNumber ?? "",
    interestedProperties: row.interestedProperties ?? [],
    property: row.property ?? "",
    budget: row.budget ?? "",
    source: row.source ?? "Website",
    assignedTo: row.assignedTo ?? "",
    lastContact: row.lastContact ?? "",
    avatar: row.avatar ?? "",
    notes: row.notes ?? [],
    timeline: (row.timeline as Array<{ id: string; title: string; time: string }>) ?? [],
    score: row.score ?? 50,
    urgencyScore: row.urgencyScore ?? 50,
    tags: row.tags ?? [],
    attachments: (row.attachments as Array<{ name: string; size: string; type: string }>) ?? [],
    suggestedActions: row.suggestedActions ?? [],
  };
}

router.get("/leads", requireAuth, async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(leadsTable)
      .orderBy(sql`${leadsTable.createdAt} DESC`);
    res.json(rows.map(sanitize));
  } catch {
    res.status(500).json({ error: "Failed to fetch leads" });
  }
});

router.get("/leads/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return void res.status(400).json({ error: "Invalid ID" });
  try {
    const [row] = await db.select().from(leadsTable).where(eq(leadsTable.id, id));
    if (!row) return void res.status(404).json({ error: "Lead not found" });
    res.json(sanitize(row));
  } catch {
    res.status(500).json({ error: "Failed to fetch lead" });
  }
});

router.post("/leads/bulk-delete", requireAuth, async (req, res) => {
  const { ids } = req.body as { ids: number[] };
  if (!Array.isArray(ids) || ids.length === 0) {
    return void res.status(400).json({ error: "ids array required" });
  }
  try {
    await db.delete(leadsTable).where(sql`${leadsTable.id} = ANY(ARRAY[${sql.join(ids.map((id) => sql`${id}`), sql`, `)}]::int[])`);
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Failed to bulk delete leads" });
  }
});

router.post("/leads", requireAuth, async (req, res) => {
  try {
    const { id: _id, createdAt: _c, updatedAt: _u, ...body } = req.body;
    const [row] = await db.insert(leadsTable).values(body).returning();
    res.status(201).json(sanitize(row));
  } catch (err) {
    console.error("Create lead error:", err);
    res.status(500).json({ error: "Failed to create lead" });
  }
});

router.put("/leads/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return void res.status(400).json({ error: "Invalid ID" });
  try {
    const { id: _id, createdAt: _c, updatedAt: _u, ...body } = req.body;
    const [row] = await db
      .update(leadsTable)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(leadsTable.id, id))
      .returning();
    if (!row) return void res.status(404).json({ error: "Lead not found" });
    res.json(sanitize(row));
  } catch {
    res.status(500).json({ error: "Failed to update lead" });
  }
});

router.patch("/leads/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return void res.status(400).json({ error: "Invalid ID" });
  try {
    const { id: _id, createdAt: _c, updatedAt: _u, ...body } = req.body;
    const [row] = await db
      .update(leadsTable)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(leadsTable.id, id))
      .returning();
    if (!row) return void res.status(404).json({ error: "Lead not found" });
    res.json(sanitize(row));
  } catch {
    res.status(500).json({ error: "Failed to patch lead" });
  }
});

router.delete("/leads/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return void res.status(400).json({ error: "Invalid ID" });
  try {
    await db.delete(leadsTable).where(eq(leadsTable.id, id));
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Failed to delete lead" });
  }
});

export default router;
