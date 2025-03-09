"use client";

import {
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
import { UseFormReturn } from "react-hook-form";

interface WithdrawalMethodSelectProps {
  form: UseFormReturn<any>;
  disabled?: boolean;
}

export function WithdrawalMethodSelect({
  form,
  disabled = false,
}: WithdrawalMethodSelectProps) {
  // Danh sách các phương thức rút tiền
  const withdrawalMethods = [
    { value: "bank_transfer", label: "Chuyển khoản ngân hàng" },
    { value: "momo", label: "Ví MoMo" },
    { value: "zalopay", label: "ZaloPay" },
  ];

  return (
    <FormField
      control={form.control}
      name="paymentMethod"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Phương thức rút tiền</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Chọn phương thức rút tiền" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {withdrawalMethods.map((method) => (
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
  );
}
