// src/app/api/referrals/route.ts
import { NextRequest, NextResponse } from "next/server";

// Base route - used for documenting API namespace
export async function GET(request: NextRequest) {
  return NextResponse.json({
    endpoints: [
      "/api/referrals/code - Get user referral code",
      "/api/referrals/stats - Get referral statistics",
      "/api/referrals/list - Get list of referrals",
    ],
    message: "VinBet Referrals API",
  });
}
