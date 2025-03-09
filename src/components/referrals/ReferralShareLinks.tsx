// src/components/referrals/ReferralShareLinks.tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Facebook,
  Instagram,
  Mail,
  MessageCircle,
  Twitter,
} from "lucide-react";
import { useReferralCodeQuery } from "@/hooks/queries/useReferralQueries";

export function ReferralShareLinks() {
  const { data } = useReferralCodeQuery();

  const shareText = `Đăng ký VinBet với mã giới thiệu của tôi và nhận thưởng: ${data?.referralCode}`;
  const shareUrl = data?.shareUrl || "";

  const handleShare = (platform: string) => {
    let url = "";

    switch (platform) {
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          shareUrl
        )}&quote=${encodeURIComponent(shareText)}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          shareText
        )}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case "email":
        url = `mailto:?subject=${encodeURIComponent(
          "Tham gia VinBet"
        )}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
        break;
      case "telegram":
        url = `https://t.me/share/url?url=${encodeURIComponent(
          shareUrl
        )}&text=${encodeURIComponent(shareText)}`;
        break;
      case "messenger":
        url = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(
          shareUrl
        )}&app_id=YOUR_FACEBOOK_APP_ID&redirect_uri=${encodeURIComponent(
          window.location.href
        )}`;
        break;
      default:
        return;
    }

    window.open(url, "_blank", "width=600,height=400");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chia sẻ mã giới thiệu</CardTitle>
        <CardDescription>Chia sẻ với bạn bè qua mạng xã hội</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button
            variant="outline"
            className="bg-[#1877F2] text-white hover:bg-[#1877F2]/90 hover:text-white"
            onClick={() => handleShare("facebook")}
          >
            <Facebook className="mr-2 h-4 w-4" />
            Facebook
          </Button>

          <Button
            variant="outline"
            className="bg-[#1DA1F2] text-white hover:bg-[#1DA1F2]/90 hover:text-white"
            onClick={() => handleShare("twitter")}
          >
            <Twitter className="mr-2 h-4 w-4" />
            Twitter
          </Button>

          <Button
            variant="outline"
            className="bg-[#0088CC] text-white hover:bg-[#0088CC]/90 hover:text-white"
            onClick={() => handleShare("telegram")}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Telegram
          </Button>

          <Button
            variant="outline"
            className="bg-[#E1306C] text-white hover:bg-[#E1306C]/90 hover:text-white"
            onClick={() => handleShare("messenger")}
          >
            <Instagram className="mr-2 h-4 w-4" />
            Messenger
          </Button>

          <Button variant="outline" onClick={() => handleShare("email")}>
            <Mail className="mr-2 h-4 w-4" />
            Email
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
