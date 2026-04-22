import { NextResponse } from "next/server";

export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    { error: "Not implemented (Prompt 1 scaffold only)." },
    { status: 501 },
  );
}

