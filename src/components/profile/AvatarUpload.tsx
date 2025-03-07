// src/components/profile/AvatarUpload.tsx
"use client";

import { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { Upload, X, Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useUploadAvatarMutation } from "@/hooks/queries/useProfileQueries";

export function AvatarUpload() {
  const { profile } = useAuth();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isLoading, mutateAsync } = useUploadAvatarMutation();

  // Hàm xử lý khi chọn file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Kiểm tra kiểu file
    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ chấp nhận file ảnh");
      return;
    }

    // Kiểm tra kích thước file (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Kích thước file không được vượt quá 2MB");
      return;
    }

    // Tạo preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadAvatar(file);
  };

  // Hàm upload avatar
  const uploadAvatar = async (file: File) => {
    // Setup progress tracking
    setUploadProgress(0);
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 300);

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      await mutateAsync(formData);
      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      setUploadProgress(0);
    }
  };

  // Hàm xóa preview
  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <Avatar className="h-24 w-24">
            <AvatarImage
              src={preview || profile?.avatar_url || ""}
              alt="Avatar"
            />
            <AvatarFallback className="text-2xl">
              {profile?.display_name?.charAt(0) ||
                profile?.username?.charAt(0) ||
                "U"}
            </AvatarFallback>
          </Avatar>
          <Button
            className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <Camera className="h-4 w-4" />
            <span className="sr-only">Change avatar</span>
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isLoading}
        />

        {isLoading && (
          <div className="w-full max-w-xs space-y-2">
            <Progress value={uploadProgress} className="h-2 w-full" />
            <p className="text-center text-sm text-muted-foreground">
              Đang tải lên... {uploadProgress}%
            </p>
          </div>
        )}

        {preview && !isLoading && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8"
              onClick={clearPreview}
            >
              <X className="mr-2 h-4 w-4" />
              Hủy
            </Button>
          </div>
        )}

        {!preview && !isLoading && (
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Tải ảnh lên
          </Button>
        )}
      </div>
    </div>
  );
}
