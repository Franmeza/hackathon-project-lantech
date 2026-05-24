import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth-session";
import type { ColId } from "@/types";

const VALID_COLS: ColId[] = ["action", "overdue", "invoice", "sub", "other"];

type BulkFilter = {
  cols?: ColId[];
  archived?: boolean;
};

type BulkUpdates = {
  archived?: boolean;
  col?: ColId;
};

type BulkPatchBody = {
  ids?: string[];
  filter?: BulkFilter;
  updates?: BulkUpdates;
};

function isNonEmptyStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.length > 0 && value.every((v) => typeof v === "string");
}

function isValidCol(value: unknown): value is ColId {
  return typeof value === "string" && (VALID_COLS as string[]).includes(value);
}

function isValidColArray(value: unknown): value is ColId[] {
  return Array.isArray(value) && value.length > 0 && value.every(isValidCol);
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: BulkPatchBody;
  try {
    body = (await req.json()) as BulkPatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const updates = body.updates ?? {};
  const hasAnyUpdate = updates.archived !== undefined || updates.col !== undefined;
  if (!hasAnyUpdate) {
    return NextResponse.json({ error: "Missing updates" }, { status: 400 });
  }

  if (updates.col !== undefined && !isValidCol(updates.col)) {
    return NextResponse.json({ error: "Invalid col" }, { status: 400 });
  }

  const ids = body.ids;
  const filter = body.filter;
  const hasIds = isNonEmptyStringArray(ids);
  const hasFilterCols = filter?.cols !== undefined ? isValidColArray(filter.cols) : false;
  const hasFilterArchived = filter?.archived !== undefined ? typeof filter.archived === "boolean" : false;
  const hasAnyFilter = Boolean(hasFilterCols || hasFilterArchived);

  if (!hasIds && !hasAnyFilter) {
    return NextResponse.json({ error: "Missing ids or filter" }, { status: 400 });
  }

  const where: {
    userId: string;
    id?: { in: string[] };
    col?: { in: ColId[] };
    archived?: boolean;
  } = { userId: session.user.id };

  if (hasIds) {
    where.id = { in: ids };
  }

  if (hasFilterCols) {
    where.col = { in: filter!.cols! };
  }

  if (hasFilterArchived) {
    where.archived = filter!.archived!;
  }

  const result = await prisma.card.updateMany({
    where,
    data: {
      ...(updates.archived !== undefined && { archived: updates.archived }),
      ...(updates.col !== undefined && { col: updates.col }),
    },
  });

  return NextResponse.json({ updated: result.count });
}

