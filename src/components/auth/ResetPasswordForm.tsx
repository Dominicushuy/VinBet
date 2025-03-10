// src/components/auth/ResetPasswordForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertCircle,
  Shield,
  Lock,
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
} from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-hot-toast";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
      .regex(/[A-Z]/, "Cần ít nhất 1 chữ hoa")
      .regex(/[0-9]/, "Cần ít nhất 1 số"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isPasswordResetSession } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [sessionChecked, setSessionChecked] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const checkSession = async () => {
      if (!isPasswordResetSession() && !searchParams.get("type")) {
        toast.error("Phiên làm việc không hợp lệ. Vui lòng thử lại.");
        router.push("/forgot-password");
      } else {
        setSessionChecked(true);
      }
    };

    checkSession();
  }, []);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Calculate password strength
  useEffect(() => {
    const password = form.watch("password");
    let strength = 0;

    if (password.length >= 6) strength += 20;
    if (password.length >= 10) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;

    setPasswordStrength(strength);
  }, [form.watch("password")]);

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 20) return "Rất yếu";
    if (passwordStrength <= 40) return "Yếu";
    if (passwordStrength <= 60) return "Trung bình";
    if (passwordStrength <= 80) return "Mạnh";
    return "Rất mạnh";
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 20) return "bg-destructive";
    if (passwordStrength <= 40) return "bg-amber-500";
    if (passwordStrength <= 60) return "bg-amber-400";
    if (passwordStrength <= 80) return "bg-green-500";
    return "bg-green-600";
  };

  async function onSubmit(data: ResetPasswordFormValues) {
    setIsLoading(true);
    setIsError(false);

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login?reset=success");
      }, 3000);
    } catch (error: any) {
      setIsError(true);
      setErrorMessage(error.message || "Đặt lại mật khẩu thất bại");
      toast.error(error.message || "Đặt lại mật khẩu thất bại");
    } finally {
      setIsLoading(false);
    }
  }

  if (!sessionChecked) {
    return (
      <Card className="border-primary/20">
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <p className="text-center mt-4">Đang kiểm tra phiên làm việc...</p>
        </CardContent>
      </Card>
    );
  }

  if (isSuccess) {
    return (
      <Card className="border-success/20 bg-success/5">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <CardTitle className="text-success">Thành công!</CardTitle>
              <CardDescription>Mật khẩu đã được đặt lại</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            Mật khẩu của bạn đã được đặt lại thành công. Bạn có thể đăng nhập
            bằng mật khẩu mới.
          </p>
          <Alert className="bg-success/10 border-success/30">
            <AlertDescription>
              Bạn sẽ được chuyển hướng đến trang đăng nhập trong vài giây...
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4">
          <Button asChild>
            <Link href="/login">Đăng nhập ngay</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-destructive">Đã xảy ra lỗi</CardTitle>
              <CardDescription>Không thể đặt lại mật khẩu</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-4">
          <Button variant="outline" asChild>
            <Link href="/forgot-password">Thử lại</Link>
          </Button>
          <Button variant="default" asChild>
            <Link href="/login">Quay lại đăng nhập</Link>
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
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Đặt lại mật khẩu</CardTitle>
            <CardDescription>
              Tạo mật khẩu mới cho tài khoản của bạn
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Mật khẩu mới</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="••••••••"
                        type={showPassword ? "text" : "password"}
                        className="h-11 pr-10"
                        disabled={isLoading}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 text-muted-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>

                  {/* Password strength indicator */}
                  {field.value && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs">
                          Độ mạnh: {getPasswordStrengthText()}
                        </span>
                        <span className="text-xs">{passwordStrength}%</span>
                      </div>
                      <Progress
                        value={passwordStrength}
                        className="h-1.5"
                        indicatorClassName={getPasswordStrengthColor()}
                      />
                      <div className="flex flex-wrap gap-1 mt-2">
                        <PasswordRequirement
                          text="6 ký tự"
                          satisfied={field.value.length >= 6}
                        />
                        <PasswordRequirement
                          text="Chữ hoa"
                          satisfied={/[A-Z]/.test(field.value)}
                        />
                        <PasswordRequirement
                          text="Số"
                          satisfied={/[0-9]/.test(field.value)}
                        />
                      </div>
                    </div>
                  )}

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="••••••••"
                        type={showConfirmPassword ? "text" : "password"}
                        className="h-11 pr-10"
                        disabled={isLoading}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 text-muted-foreground"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                <>
                  Đặt lại mật khẩu
                  <Shield className="ml-2 h-4 w-4" />
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

// Password requirement component
function PasswordRequirement({
  text,
  satisfied,
}: {
  text: string;
  satisfied: boolean;
}) {
  return (
    <div
      className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
        satisfied
          ? "bg-success/20 text-success"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {satisfied ? (
        <CheckCircle className="h-3 w-3" />
      ) : (
        <Shield className="h-3 w-3" />
      )}
      {text}
    </div>
  );
}
