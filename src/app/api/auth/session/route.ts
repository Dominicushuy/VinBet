// src/app/api/auth/session/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(_request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  const { data } = await supabase.auth.getSession();

  return NextResponse.json(
    {
      user: data.session?.user || null,
    },
    { status: 200 }
  );
}
