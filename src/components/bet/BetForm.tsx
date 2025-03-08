// src/components/bet/BetForm.tsx
"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BetConfirmation } from "./BetConfirmation";
import { usePlaceBetMutation } from "@/hooks/queries/useBetQueries";
import { GameRound } from "@/types/database";
import { useAuth } from "@/hooks/useAuth";

const betFormSchema = z.object({
  chosenNumber: z.string().min(1, "Vui lòng chọn số"),
  amount: z
    .number({ required_error: "Vui lòng nhập số tiền" })
    .positive("Số tiền phải lớn hơn 0"),
});

type BetFormValues = z.infer<typeof betFormSchema>;

interface BetFormProps {
  gameRound: GameRound;
}

export function BetForm({ gameRound }: BetFormProps) {
  const router = useRouter();
  const { profile } = useAuth();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formValues, setFormValues] = useState<BetFormValues | null>(null);

  const placeBetMutation = usePlaceBetMutation();

  const form = useForm<BetFormValues>({
    resolver: zodResolver(betFormSchema),
    defaultValues: {
      chosenNumber: "",
      amount: 10000, // Số tiền cược mặc định
    },
  });

  // Danh sách các số có thể đặt cược
  const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  // Kiểm tra nếu trò chơi không còn active
  if (gameRound.status !== "active") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Đặt cược</CardTitle>
          <CardDescription>
            Lượt chơi này không còn nhận cược mới.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  function onSubmit(data: BetFormValues) {
    if (!profile) {
      toast.error("Vui lòng đăng nhập để đặt cược");
      return;
    }

    if (profile.balance < data.amount) {
      toast.error("Số dư không đủ để đặt cược");
      return;
    }

    setFormValues(data);
    setShowConfirmation(true);
  }

  async function handleConfirmBet() {
    if (!formValues) return;

    try {
      await placeBetMutation.mutateAsync({
        gameRoundId: gameRound.id,
        chosenNumber: formValues.chosenNumber,
        amount: formValues.amount,
      });

      // Reset form và đóng confirmation dialog
      form.reset();
      setShowConfirmation(false);

      // Refresh trang để hiển thị cược mới
      router.refresh();
    } catch (error) {
      console.error("Error placing bet:", error);
      // Giữ dialog mở nếu có lỗi để người dùng có thể thử lại
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Đặt cược</CardTitle>
          <CardDescription>
            Chọn số và nhập số tiền để đặt cược vào lượt chơi này
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="chosenNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chọn số</FormLabel>
                    <div className="grid grid-cols-5 gap-2">
                      {numbers.map((number) => (
                        <Button
                          key={number}
                          type="button"
                          variant={
                            field.value === number ? "default" : "outline"
                          }
                          className="h-12 text-lg font-bold"
                          onClick={() => field.onChange(number)}
                        >
                          {number}
                        </Button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số tiền cược (VND)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={10000}
                        step={10000}
                        placeholder="Nhập số tiền cược"
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

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Số dư hiện tại:{" "}
                  <span className="font-medium">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(profile?.balance || 0)}
                  </span>
                </div>
                <Button type="submit" disabled={placeBetMutation.isLoading}>
                  {placeBetMutation.isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Đặt cược"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {showConfirmation && formValues && (
        <BetConfirmation
          open={showConfirmation}
          onOpenChange={setShowConfirmation}
          gameRound={gameRound}
          chosenNumber={formValues.chosenNumber}
          amount={formValues.amount}
          onConfirm={handleConfirmBet}
          isLoading={placeBetMutation.isLoading}
        />
      )}
    </>
  );
}
