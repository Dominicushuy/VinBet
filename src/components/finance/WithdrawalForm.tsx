"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { WithdrawalMethodSelect } from "./WithdrawalMethodSelect";
import { useCreateWithdrawalMutation } from "@/hooks/queries/useFinanceQueries";
import { useAuth } from "@/hooks/useAuth";

const withdrawalFormSchema = z.object({
  amount: z
    .number({ required_error: "Vui lòng nhập số tiền" })
    .min(50000, "Số tiền tối thiểu là 50,000 VND")
    .max(100000000, "Số tiền tối đa là 100,000,000 VND"),
  paymentMethod: z.string().min(1, "Vui lòng chọn phương thức rút tiền"),
  accountNumber: z.string().min(1, "Số tài khoản/Số điện thoại là bắt buộc"),
  accountName: z.string().min(1, "Tên chủ tài khoản là bắt buộc"),
  bankName: z.string().optional(),
  notes: z.string().optional(),
});

type WithdrawalFormValues = z.infer<typeof withdrawalFormSchema>;

export function WithdrawalForm() {
  const { profile } = useAuth();
  const createWithdrawalMutation = useCreateWithdrawalMutation();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<WithdrawalFormValues>({
    resolver: zodResolver(withdrawalFormSchema),
    defaultValues: {
      amount: 50000,
      paymentMethod: "",
      accountNumber: "",
      accountName: profile?.display_name || "",
      bankName: "",
      notes: "",
    },
  });

  const currentBalance = profile?.balance || 0;
  const selectedMethod = form.watch("paymentMethod");

  async function onSubmit(data: WithdrawalFormValues) {
    if (currentBalance < data.amount) {
      form.setError("amount", {
        type: "manual",
        message: "Số dư không đủ để thực hiện yêu cầu này",
      });
      return;
    }

    // Chuẩn bị dữ liệu chi tiết thanh toán
    const paymentDetails = {
      accountNumber: data.accountNumber,
      accountName: data.accountName,
      bankName: data.bankName,
      notes: data.notes,
    };

    try {
      await createWithdrawalMutation.mutateAsync({
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        paymentDetails,
      });

      setSubmitted(true);
    } catch (error) {
      console.error("Error creating withdrawal request:", error);
    }
  }

  if (submitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rút tiền</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-primary/10 p-4 rounded-md">
            <p className="text-center font-medium mb-4">
              Yêu cầu rút tiền đã được tạo thành công!
            </p>
            <p className="text-center text-muted-foreground">
              Yêu cầu của bạn đang được xử lý. Vui lòng kiểm tra trạng thái
              trong lịch sử rút tiền.
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => {
              setSubmitted(false);
              form.reset();
            }}
          >
            Tạo yêu cầu mới
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rút tiền</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center justify-between bg-muted/50 p-3 rounded-md">
              <span>Số dư có thể rút:</span>
              <span className="font-semibold">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(currentBalance)}
              </span>
            </div>

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số tiền rút (VND)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="50,000"
                      {...field}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        field.onChange(isNaN(value) ? 0 : value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <WithdrawalMethodSelect
              form={form}
              disabled={createWithdrawalMutation.isLoading}
            />

            {selectedMethod && (
              <>
                {selectedMethod === "bank_transfer" && (
                  <FormField
                    control={form.control}
                    name="bankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên ngân hàng</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Tên ngân hàng"
                            {...field}
                            disabled={createWithdrawalMutation.isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {selectedMethod === "bank_transfer"
                          ? "Số tài khoản"
                          : "Số điện thoại"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            selectedMethod === "bank_transfer"
                              ? "Nhập số tài khoản"
                              : "Nhập số điện thoại"
                          }
                          {...field}
                          disabled={createWithdrawalMutation.isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accountName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên chủ tài khoản</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập tên chủ tài khoản"
                          {...field}
                          disabled={createWithdrawalMutation.isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ghi chú (không bắt buộc)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Nhập ghi chú nếu cần"
                          {...field}
                          disabled={createWithdrawalMutation.isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={createWithdrawalMutation.isLoading}
            >
              {createWithdrawalMutation.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Tạo yêu cầu rút tiền"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
