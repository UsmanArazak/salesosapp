import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Not implemented (Prompt 1 scaffold only)." },
    { status: 501 },
  );
}

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { ok: false, message: "Paystack webhook not implemented in Prompt 1" },
    { status: 501 },
  );
}

import { NextResponse } from "next/server";

export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    { error: "Not implemented (Prompt 1 scaffold only)." },
    { status: 501 }
  );
}

