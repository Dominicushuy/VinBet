// src/components/finance/DepositForm.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreatePaymentRequestMutation } from "@/hooks/queries/useFinanceQueries";
import { PaymentProofUpload } from "./PaymentProofUpload";

const depositFormSchema = z.object({
  amount: z
    .number({ required_error: "Vui lòng nhập số tiền" })
    .min(10000, "Số tiền tối thiểu là 10,000 VND")
    .max(100000000, "Số tiền tối đa là 100,000,000 VND"),
  paymentMethod: z.string().min(1, "Vui lòng chọn phương thức thanh toán"),
});

type DepositFormValues = z.infer<typeof depositFormSchema>;

export function DepositForm() {
  const [requestId, setRequestId] = useState<string | null>(null);
  const createPaymentRequestMutation = useCreatePaymentRequestMutation();

  const form = useForm<DepositFormValues>({
    resolver: zodResolver(depositFormSchema),
    defaultValues: {
      amount: 100000,
      paymentMethod: "",
    },
  });

  async function onSubmit(data: DepositFormValues) {
    try {
      const result = await createPaymentRequestMutation.mutateAsync({
        amount: data.amount,
        paymentMethod: data.paymentMethod,
      });

      if (result.requestId) {
        setRequestId(result.requestId);
      }
    } catch (error) {
      console.error("Error creating payment request:", error);
    }
  }

  // Các phương thức thanh toán
  const paymentMethods = [
    { value: "bank_transfer", label: "Chuyển khoản ngân hàng" },
    { value: "momo", label: "Ví MoMo" },
    { value: "zalopay", label: "ZaloPay" },
    { value: "card", label: "Thẻ tín dụng/ghi nợ" },
  ];

  // Hiển thị thông tin tài khoản dựa trên phương thức thanh toán
  const getPaymentInstructions = (method: string) => {
    switch (method) {
      case "bank_transfer":
        return (
          <div className="mt-4 p-4 bg-muted rounded-md">
            <h4 className="font-medium mb-2">Thông tin chuyển khoản:</h4>
            <p>Ngân hàng: Vietcombank</p>
            <p>Số tài khoản: 1234567890</p>
            <p>Chủ tài khoản: NGUYEN VAN A</p>
            <p>Nội dung: NAP {form.getValues("amount")} VB</p>
          </div>
        );
      case "momo":
        return (
          <div className="mt-4 p-4 bg-muted rounded-md">
            <h4 className="font-medium mb-2">Thông tin MoMo:</h4>
            <p>Số điện thoại: 0987654321</p>
            <p>Tên: NGUYEN VAN A</p>
            <p>Nội dung: NAP {form.getValues("amount")} VB</p>
          </div>
        );
      case "zalopay":
        return (
          <div className="mt-4 p-4 bg-muted rounded-md">
            <h4 className="font-medium mb-2">Thông tin ZaloPay:</h4>
            <p>Số điện thoại: 0987654321</p>
            <p>Tên: NGUYEN VAN A</p>
            <p>Nội dung: NAP {form.getValues("amount")} VB</p>
          </div>
        );
      case "card":
        return (
          <div className="mt-4 p-4 bg-muted rounded-md">
            <h4 className="font-medium mb-2">Thanh toán thẻ:</h4>
            <p>Chưa hỗ trợ thanh toán thẻ tín dụng/ghi nợ.</p>
            <p>Vui lòng chọn phương thức thanh toán khác.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nạp tiền</CardTitle>
      </CardHeader>
      <CardContent>
        {requestId ? (
          <div className="space-y-6">
            <div className="bg-primary/10 p-4 rounded-md">
              <p className="text-center font-medium">
                Yêu cầu nạp tiền đã được tạo. Vui lòng tải lên bằng chứng thanh
                toán.
              </p>
            </div>
            <PaymentProofUpload requestId={requestId} />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setRequestId(null)}
            >
              Tạo yêu cầu mới
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số tiền (VND)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="100,000"
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

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phương thức thanh toán</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn phương thức thanh toán" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Hiển thị thông tin thanh toán */}
              {getPaymentInstructions(form.watch("paymentMethod"))}

              <Button
                type="submit"
                className="w-full"
                disabled={createPaymentRequestMutation.isLoading}
              >
                {createPaymentRequestMutation.isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Tạo yêu cầu nạp tiền"
                )}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
