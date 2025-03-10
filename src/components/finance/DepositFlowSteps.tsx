// src/components/finance/DepositFlowSteps.tsx
"use client";

import { useState, useRef } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  DollarSign,
  Upload,
  Wallet,
  Copy,
  QrCode,
  AlertCircle,
  FileCheck,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PaymentMethodCard } from "@/components/finance/PaymentMethodCard";
import { PaymentProofUpload } from "@/components/finance/PaymentProofUpload";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useCreatePaymentRequestMutation } from "@/hooks/queries/useFinanceQueries";

// Types for payment methods
interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  accounts: (BankAccount | EWalletAccount)[];
}

interface BankAccount {
  bank_name: string;
  account_number: string;
  account_name: string;
  branch?: string;
  swift_code?: string;
}

interface EWalletAccount {
  phone: string;
  name: string;
}

interface DepositConfig {
  min_deposit: number;
  max_deposit: number;
  payment_methods: PaymentMethod[];
}

interface DepositFlowStepsProps {
  initialConfig?: DepositConfig;
}

// Define form schema
const depositFormSchema = z.object({
  amount: z
    .number({
      required_error: "Vui lòng nhập số tiền",
      invalid_type_error: "Số tiền phải là số",
    })
    .int("Số tiền phải là số nguyên")
    .positive("Số tiền phải lớn hơn 0")
    .refine((val) => val >= 50000, {
      message: "Số tiền tối thiểu là 50,000 VND",
    })
    .refine((val) => val <= 100000000, {
      message: "Số tiền tối đa là 100,000,000 VND",
    }),
  paymentMethod: z.string({
    required_error: "Vui lòng chọn phương thức thanh toán",
  }),
});

type DepositFormValues = z.infer<typeof depositFormSchema>;

export function DepositFlowSteps({ initialConfig }: DepositFlowStepsProps) {
  const [step, setStep] = useState(1);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [selectedAccount, setSelectedAccount] = useState<number>(0);
  const [transferCode, setTransferCode] = useState<string>("");
  const router = useRouter();
  const createPaymentRequestMutation = useCreatePaymentRequestMutation();

  const config: DepositConfig = initialConfig || {
    min_deposit: 50000,
    max_deposit: 100000000,
    payment_methods: [
      {
        id: "bank_transfer",
        name: "Chuyển khoản ngân hàng",
        description: "Chuyển khoản qua ngân hàng",
        accounts: [
          {
            bank_name: "Vietcombank",
            account_number: "1234567890",
            account_name: "NGUYEN VAN A",
            branch: "Hồ Chí Minh",
          },
        ],
      },
      {
        id: "momo",
        name: "Ví MoMo",
        description: "Chuyển tiền qua ví MoMo",
        accounts: [
          {
            phone: "0987654321",
            name: "NGUYEN VAN A",
          },
        ],
      },
      {
        id: "zalopay",
        name: "ZaloPay",
        description: "Chuyển tiền qua ZaloPay",
        accounts: [
          {
            phone: "0987654321",
            name: "NGUYEN VAN A",
          },
        ],
      },
    ],
  };

  // Form setup
  const form = useForm<DepositFormValues>({
    resolver: zodResolver(depositFormSchema),
    defaultValues: {
      amount: 100000,
      paymentMethod: "",
    },
  });

  // Watch form values
  const watchAmount = form.watch("amount");
  const watchPaymentMethod = form.watch("paymentMethod");

  // Handle deposit step 1
  const handleStep1Submit = async (data: DepositFormValues) => {
    setSelectedMethod(data.paymentMethod);

    // Generate transfer code
    const code = `NAP${data.amount}VB${Math.floor(Math.random() * 1000)}`;
    setTransferCode(code);

    try {
      // Create payment request
      const result = await createPaymentRequestMutation.mutateAsync({
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        paymentDetails: {
          transferCode: code,
        },
      });

      if (result.requestId) {
        setRequestId(result.requestId);
        setStep(2);
      }
    } catch (error) {
      console.error("Error creating payment request:", error);
      toast.error("Không thể tạo yêu cầu nạp tiền. Vui lòng thử lại.");
    }
  };

  // Submit proof and go to final step
  const handleProofUploaded = () => {
    setStep(3);
  };

  // Reset flow and start over
  const handleReset = () => {
    form.reset();
    setSelectedMethod("");
    setSelectedAccount(0);
    setTransferCode("");
    setRequestId(null);
    setStep(1);
  };

  // Format money
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép vào clipboard");
  };

  // Get selected payment method details
  const getSelectedMethodDetails = () => {
    return config.payment_methods.find((m) => m.id === selectedMethod);
  };

  // Get account details
  const getSelectedAccount = () => {
    const method = getSelectedMethodDetails();
    if (!method || method.accounts.length === 0) return null;
    return method.accounts[selectedAccount];
  };

  // Get instruction based on payment method
  const getPaymentInstructions = () => {
    const method = getSelectedMethodDetails();
    if (!method) return null;

    const account = getSelectedAccount();
    if (!account) return null;

    switch (method.id) {
      case "bank_transfer":
        const bankAccount = account as BankAccount;
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Ngân hàng:</Label>
                <div className="flex items-center">
                  <span className="font-medium">{bankAccount.bank_name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-1"
                    onClick={() => copyToClipboard(bankAccount.bank_name)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between">
                <Label>Số tài khoản:</Label>
                <div className="flex items-center">
                  <span className="font-medium">
                    {bankAccount.account_number}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-1"
                    onClick={() => copyToClipboard(bankAccount.account_number)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between">
                <Label>Tên tài khoản:</Label>
                <div className="flex items-center">
                  <span className="font-medium">
                    {bankAccount.account_name}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-1"
                    onClick={() => copyToClipboard(bankAccount.account_name)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {bankAccount.branch && (
                <div className="flex justify-between">
                  <Label>Chi nhánh:</Label>
                  <div className="flex items-center">
                    <span className="font-medium">{bankAccount.branch}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 ml-1"
                      onClick={() => copyToClipboard(bankAccount.branch)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Label>Số tiền:</Label>
                <div className="flex items-center">
                  <span className="font-medium text-primary">
                    {formatMoney(watchAmount)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-1"
                    onClick={() => copyToClipboard(watchAmount.toString())}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between">
                <Label>Nội dung chuyển khoản:</Label>
                <div className="flex items-center">
                  <code className="bg-muted px-1 py-0.5 rounded text-sm font-medium">
                    {transferCode}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-1"
                    onClick={() => copyToClipboard(transferCode)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            <Alert
              variant="destructive"
              className="bg-red-50 text-red-800 border-red-200"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Quan trọng</AlertTitle>
              <AlertDescription>
                Bạn phải ghi chính xác nội dung chuyển khoản{" "}
                <strong>{transferCode}</strong>. Nếu không, hệ thống sẽ không
                ghi nhận giao dịch của bạn.
              </AlertDescription>
            </Alert>
          </div>
        );

      case "momo":
      case "zalopay":
        const eWalletAccount = account as EWalletAccount;
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Số điện thoại:</Label>
                <div className="flex items-center">
                  <span className="font-medium">{eWalletAccount.phone}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-1"
                    onClick={() => copyToClipboard(eWalletAccount.phone)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between">
                <Label>Tên người nhận:</Label>
                <div className="flex items-center">
                  <span className="font-medium">{eWalletAccount.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-1"
                    onClick={() => copyToClipboard(eWalletAccount.name)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between">
                <Label>Số tiền:</Label>
                <div className="flex items-center">
                  <span className="font-medium text-primary">
                    {formatMoney(watchAmount)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-1"
                    onClick={() => copyToClipboard(watchAmount.toString())}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between">
                <Label>Nội dung chuyển khoản:</Label>
                <div className="flex items-center">
                  <code className="bg-muted px-1 py-0.5 rounded text-sm font-medium">
                    {transferCode}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-1"
                    onClick={() => copyToClipboard(transferCode)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <div className="w-48 h-48 bg-white p-2 border rounded flex items-center justify-center">
                <QrCode className="h-32 w-32 text-primary" />
              </div>
              <Button size="sm" variant="outline">
                <QrCode className="h-4 w-4 mr-2" /> Tải mã QR
              </Button>
            </div>

            <Alert
              variant="destructive"
              className="bg-red-50 text-red-800 border-red-200"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Quan trọng</AlertTitle>
              <AlertDescription>
                Bạn phải ghi chính xác nội dung chuyển khoản{" "}
                <strong>{transferCode}</strong>. Nếu không, hệ thống sẽ không
                ghi nhận giao dịch của bạn.
              </AlertDescription>
            </Alert>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Nạp tiền vào tài khoản</CardTitle>
            <CardDescription>
              Chọn phương thức và số tiền bạn muốn nạp
            </CardDescription>
          </div>
          <div className="flex items-center space-x-4">
            <div
              className={`w-3 h-3 rounded-full ${
                step >= 1 ? "bg-primary" : "bg-muted"
              }`}
            ></div>
            <div
              className={`w-3 h-3 rounded-full ${
                step >= 2 ? "bg-primary" : "bg-muted"
              }`}
            ></div>
            <div
              className={`w-3 h-3 rounded-full ${
                step >= 3 ? "bg-primary" : "bg-muted"
              }`}
            ></div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {step === 1 && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleStep1Submit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số tiền nạp</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          placeholder="100,000"
                          className="pl-10"
                          {...field}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            field.onChange(isNaN(value) ? 0 : value);
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Số tiền tối thiểu: {formatMoney(config.min_deposit)}, tối
                      đa: {formatMoney(config.max_deposit)}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel>Phương thức thanh toán</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid gap-4 grid-cols-1 md:grid-cols-3"
                      >
                        {config.payment_methods.map((method) => (
                          <PaymentMethodCard
                            key={method.id}
                            method={method}
                            selected={field.value === method.id}
                            onSelect={() => field.onChange(method.id)}
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4 flex justify-end space-x-2">
                <Button
                  type="submit"
                  disabled={createPaymentRequestMutation.isLoading}
                >
                  {createPaymentRequestMutation.isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      Tiếp tục <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">
                Thông tin chuyển khoản
              </h3>

              {getSelectedMethodDetails()?.accounts.length > 1 && (
                <Tabs
                  value={selectedAccount.toString()}
                  onValueChange={(value) => setSelectedAccount(parseInt(value))}
                  className="mb-6"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    {getSelectedMethodDetails()?.accounts.map(
                      (account, index) => (
                        <TabsTrigger
                          key={index}
                          value={index.toString()}
                          className="text-xs"
                        >
                          {selectedMethod === "bank_transfer"
                            ? (account as BankAccount).bank_name
                            : `Tài khoản ${index + 1}`}
                        </TabsTrigger>
                      )
                    )}
                  </TabsList>
                  <TabsContent value={selectedAccount.toString()}>
                    {getPaymentInstructions()}
                  </TabsContent>
                </Tabs>
              )}

              {getSelectedMethodDetails()?.accounts.length === 1 &&
                getPaymentInstructions()}
            </div>

            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">
                Tải lên bằng chứng thanh toán
              </h3>
              {requestId && (
                <PaymentProofUpload
                  requestId={requestId}
                  onUploadComplete={handleProofUploaded}
                />
              )}
            </div>

            <div className="pt-4 flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
              </Button>
              <Button onClick={handleProofUploaded}>
                Tiếp tục <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 text-center py-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold tracking-tight">
                Yêu cầu nạp tiền thành công!
              </h3>
              <p className="text-muted-foreground">
                Yêu cầu nạp tiền của bạn đã được gửi thành công. Vui lòng chờ
                admin xác nhận và tiền sẽ được cộng vào tài khoản của bạn trong
                thời gian sớm nhất.
              </p>
            </div>

            <div className="bg-muted p-4 rounded-md my-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phương thức:</span>
                  <span className="font-medium">
                    {getSelectedMethodDetails()?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Số tiền:</span>
                  <span className="font-medium">
                    {formatMoney(watchAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trạng thái:</span>
                  <span className="font-medium text-amber-600">Đang xử lý</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Thời gian yêu cầu:
                  </span>
                  <span className="font-medium">
                    {new Date().toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-center space-x-4">
              <Button variant="outline" onClick={handleReset}>
                <RefreshCw className="mr-2 h-4 w-4" /> Tạo yêu cầu mới
              </Button>
              <Button onClick={() => router.push("/finance")}>
                <Wallet className="mr-2 h-4 w-4" /> Quay lại trang Tài chính
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
