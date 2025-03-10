// src/components/auth/RegisterForm.tsx
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
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  X,
  Shield,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-hot-toast";
import Link from "next/link";

const registerSchema = z
  .object({
    email: z.string().email("Email không hợp lệ"),
    password: z
      .string()
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
      .regex(/[A-Z]/, "Cần ít nhất 1 chữ hoa")
      .regex(/[0-9]/, "Cần ít nhất 1 số"),
    confirmPassword: z.string(),
    referralCode: z.string().optional(),
    agreeTerms: z.boolean().refine((value) => value === true, {
      message: "Bạn phải đồng ý với điều khoản sử dụng",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const { signUp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref") || "";

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      referralCode,
      agreeTerms: false,
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

  async function onSubmit(data: RegisterFormValues) {
    if (step === 1) {
      const emailResult = await form.trigger("email");
      if (emailResult) setStep(2);
      return;
    }

    if (step === 2) {
      const passwordResult = await form.trigger([
        "password",
        "confirmPassword",
      ]);
      if (passwordResult) setStep(3);
      return;
    }

    setIsLoading(true);
    try {
      await signUp({
        email: data.email,
        password: data.password,
        referralCode: data.referralCode,
      });
      // router.push("/login?registered=true");
      // toast.success(
      //   "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản."
      // );
    } catch (error: any) {
      toast.error(error.message || "Đăng ký thất bại");
    } finally {
      setIsLoading(false);
    }
  }

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // Render steps
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-base">Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="email@example.com"
                    type="email"
                    className="h-12 text-base"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Email này sẽ được sử dụng để đăng nhập và xác thực tài khoản
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      case 2:
        return (
          <>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base">Mật khẩu</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="••••••••"
                        type={showPassword ? "text" : "password"}
                        className="h-12 text-base pr-10"
                        {...field}
                        disabled={isLoading}
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
                <FormItem className="space-y-3">
                  <FormLabel className="text-base">Xác nhận mật khẩu</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="••••••••"
                        type={showConfirmPassword ? "text" : "password"}
                        className="h-12 text-base pr-10"
                        {...field}
                        disabled={isLoading}
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
          </>
        );
      case 3:
        return (
          <>
            <FormField
              control={form.control}
              name="referralCode"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base">
                    Mã giới thiệu (không bắt buộc)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập mã giới thiệu nếu có"
                      className="h-12 text-base"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Nhập mã giới thiệu để nhận ưu đãi đặc biệt khi đăng ký
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="agreeTerms"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex items-start space-x-3 pt-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                        className="mt-1"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal">
                        Tôi đồng ý với{" "}
                        <a
                          href="/terms"
                          className="text-primary hover:underline"
                        >
                          Điều khoản sử dụng
                        </a>{" "}
                        và{" "}
                        <a
                          href="/privacy"
                          className="text-primary hover:underline"
                        >
                          Chính sách bảo mật
                        </a>{" "}
                        của VinBet
                      </FormLabel>
                      <FormDescription className="text-xs">
                        Bạn có thể hủy đăng ký bất cứ lúc nào.
                      </FormDescription>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="w-full space-y-2">
          <div className="flex justify-between text-xs mb-1">
            <span>Email</span>
            <span>Mật khẩu</span>
            <span>Hoàn tất</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <Card className="border-muted">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">
            {step === 1 && "Thông tin tài khoản"}
            {step === 2 && "Tạo mật khẩu"}
            {step === 3 && "Hoàn tất đăng ký"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Nhập email để bắt đầu tạo tài khoản"}
            {step === 2 && "Tạo mật khẩu an toàn cho tài khoản của bạn"}
            {step === 3 && "Chỉ còn một bước cuối cùng"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {renderStep()}
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handlePrevStep}
            disabled={step === 1 || isLoading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Trở lại
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : step === 3 ? (
              <>
                Hoàn tất đăng ký
                <CheckCircle className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Tiếp tục
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
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
