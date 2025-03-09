import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { z } from "zod";

const createWithdrawalRequestSchema = z.object({
  amount: z.number().positive("Số tiền phải lớn hơn 0"),
  paymentMethod: z.string().min(1, "Phương thức thanh toán là bắt buộc"),
  paymentDetails: z.record(z.any()).optional(),
});

const getWithdrawalRequestsSchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "cancelled"]).optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
});

// POST: tạo yêu cầu rút tiền mới
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = sessionData.session.user.id;

    // Parse và validate body
    const body = await request.json();
    const validatedData = createWithdrawalRequestSchema.parse(body);

    // Kiểm tra số dư
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("balance")
      .eq("id", userId)
      .single();

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    if (userData.balance < validatedData.amount) {
      return NextResponse.json(
        { error: "Số dư không đủ để thực hiện yêu cầu rút tiền" },
        { status: 400 }
      );
    }

    // Gọi function để tạo payment request
    const { data: requestId, error } = await supabase.rpc(
      "create_payment_request",
      {
        p_profile_id: userId,
        p_amount: validatedData.amount,
        p_type: "withdrawal", // Đây là yêu cầu rút tiền
        p_payment_method: validatedData.paymentMethod,
        p_payment_details: validatedData.paymentDetails || null,
      }
    );

    if (error) {
      console.error("Error creating withdrawal request:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, requestId }, { status: 201 });
  } catch (error) {
    console.error("Withdrawal request error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Không thể tạo yêu cầu rút tiền" },
      { status: 500 }
    );
  }
}

// GET: lấy danh sách yêu cầu rút tiền của người dùng
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = sessionData.session.user.id;

    // Parse query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams);
    const validatedParams = getWithdrawalRequestsSchema.parse(queryParams);

    // Thiết lập các thông số cho query
    const page = Number(validatedParams.page) || 1;
    const pageSize = Number(validatedParams.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    // Build query
    let query = supabase
      .from("payment_requests")
      .select(
        "*, approved_by:profiles!payment_requests_approved_by_fkey(username, display_name)",
        {
          count: "exact",
        }
      )
      .eq("profile_id", userId)
      .eq("type", "withdrawal")
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    // Apply status filter if provided
    if (validatedParams.status) {
      query = query.eq("status", validatedParams.status);
    }

    // Execute query
    const { data: requests, error, count } = await query;

    if (error) {
      console.error("Error fetching withdrawal requests:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      paymentRequests: requests || [],
      pagination: {
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    });
  } catch (error) {
    console.error("Withdrawal requests fetch error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Không thể lấy danh sách yêu cầu rút tiền" },
      { status: 500 }
    );
  }
}
