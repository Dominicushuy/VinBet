// src/components/auth/ForgotPasswordForm.tsx
"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Loader2,
  ArrowRight,
  Mail,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

const forgotPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ForgotPasswordFormValues) {
    setIsLoading(true);
    setError(null);
    try {
      await resetPassword(data.email);
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
    } catch (error: any) {
      setError(
        error.message ||
          "Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau."
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <Card className="border-success/20 bg-success/5">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center">
              <Mail className="h-5 w-5 text-success" />
            </div>
            <div>
              <CardTitle className="text-success">Email đã được gửi</CardTitle>
              <CardDescription>Kiểm tra hộp thư của bạn</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến{" "}
            <span className="font-medium">{submittedEmail}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Nếu bạn không nhận được email trong vòng vài phút, vui lòng kiểm tra
            thư mục spam hoặc thử lại.
          </p>

          <div className="bg-background rounded-lg p-4 border border-border">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full flex items-center justify-center bg-success/20">
                <CheckCircle className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium">Bước tiếp theo</p>
                <p className="text-xs text-muted-foreground">
                  Nhấp vào liên kết trong email để đặt lại mật khẩu
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Quay lại đăng nhập</Link>
          </Button>
          <Button
            onClick={() => {
              setIsSubmitted(false);
              form.reset();
            }}
            size="sm"
          >
            Thử email khác
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Đặt lại mật khẩu</CardTitle>
            <CardDescription>
              Nhập email của bạn để nhận hướng dẫn
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="email@example.com"
                      type="email"
                      className="h-11"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Chúng tôi sẽ gửi link đặt lại mật khẩu đến email này
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  Gửi hướng dẫn đặt lại
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center border-t p-4">
        <Button variant="link" asChild>
          <Link href="/login">Quay lại đăng nhập</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
