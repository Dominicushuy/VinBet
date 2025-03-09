// src/components/notifications/TelegramConnect.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Link as LinkIcon, Check, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const telegramFormSchema = z.object({
  telegram_id: z.string().min(1, "Telegram ID không được để trống"),
});

type TelegramFormValues = z.infer<typeof telegramFormSchema>;

export function TelegramConnect() {
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [telegramId, setTelegramId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TelegramFormValues>({
    resolver: zodResolver(telegramFormSchema),
    defaultValues: {
      telegram_id: "",
    },
  });

  // Lấy thông tin kết nối Telegram
  useEffect(() => {
    const fetchTelegramStatus = async () => {
      try {
        const response = await fetch("/api/notifications/telegram");
        if (!response.ok) {
          throw new Error("Failed to fetch Telegram status");
        }
        const data = await response.json();
        setIsConnected(data.connected);
        setTelegramId(data.telegram_id);

        if (data.telegram_id) {
          form.setValue("telegram_id", data.telegram_id);
        }
      } catch (error) {
        console.error("Error fetching Telegram status:", error);
        toast.error("Không thể kiểm tra trạng thái Telegram");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTelegramStatus();
  }, [form]);

  // Kết nối Telegram
  const handleConnect = async (data: TelegramFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/notifications/telegram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          telegram_id: data.telegram_id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to connect Telegram");
      }

      const result = await response.json();
      setIsConnected(true);
      setTelegramId(result.telegram_id);
      toast.success("Kết nối Telegram thành công");
    } catch (error) {
      console.error("Error connecting Telegram:", error);
      toast.error("Không thể kết nối với Telegram");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ngắt kết nối Telegram
  const handleDisconnect = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/notifications/telegram", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to disconnect Telegram");
      }

      setIsConnected(false);
      setTelegramId(null);
      form.setValue("telegram_id", "");
      toast.success("Đã ngắt kết nối Telegram");
    } catch (error) {
      console.error("Error disconnecting Telegram:", error);
      toast.error("Không thể ngắt kết nối Telegram");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kết nối Telegram</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kết nối Telegram</CardTitle>
        <CardDescription>
          Kết nối tài khoản Telegram của bạn để nhận thông báo quan trọng
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md">
              <Check size={16} />
              <span>Đã kết nối với Telegram</span>
            </div>

            <div className="p-3 border rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Telegram ID</p>
                  <p className="text-sm text-muted-foreground">{telegramId}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleDisconnect}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4 mr-1" />
                  )}
                  Ngắt kết nối
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm">
                Kết nối với Telegram để nhận thông báo tức thì về các sự kiện
                quan trọng như kết quả trò chơi, giao dịch và cập nhật hệ thống.
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleConnect)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="telegram_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telegram ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập Telegram ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <a
                      href="https://telegram.org/dl"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary flex items-center gap-1 hover:underline"
                    >
                      <LinkIcon size={14} />
                      Tải ứng dụng Telegram
                    </a>

                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang kết nối...
                        </>
                      ) : (
                        "Kết nối"
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
