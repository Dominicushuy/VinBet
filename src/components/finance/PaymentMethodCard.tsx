// src/components/finance/PaymentMethodCard.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CreditCard, Wallet, Landmark } from "lucide-react";

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  accounts: any[];
}

interface PaymentMethodCardProps {
  method: PaymentMethod;
  selected: boolean;
  onSelect: () => void;
}

export function PaymentMethodCard({
  method,
  selected,
  onSelect,
}: PaymentMethodCardProps) {
  const getIcon = () => {
    switch (method.id) {
      case "bank_transfer":
        return <Landmark className="h-5 w-5" />;
      case "momo":
      case "zalopay":
        return <Wallet className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  return (
    <Card
      className={cn(
        "relative border-2 cursor-pointer transition-all",
        selected
          ? "border-primary shadow-sm"
          : "border-muted hover:border-muted-foreground/20"
      )}
      onClick={onSelect}
    >
      {selected && (
        <div className="absolute right-2 top-2 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-white"></div>
        </div>
      )}
      <CardContent className="p-4 flex flex-col items-center text-center">
        <div
          className={cn(
            "mb-3 rounded-full p-2",
            selected
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          )}
        >
          {getIcon()}
        </div>
        <Label
          htmlFor={`payment-method-${method.id}`}
          className="font-medium text-base cursor-pointer"
        >
          {method.name}
        </Label>
        <p className="text-xs text-muted-foreground mt-1">
          {method.description}
        </p>
      </CardContent>
    </Card>
  );
}
