// src/components/profile/AvatarUpload.tsx
"use client";

import { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { Upload, X, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";

export function AvatarUpload() {
  const { profile, refreshSession } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    try {
      setIsUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append("avatar", file);

      // Giả lập progress
      const intervalId = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(intervalId);
            return prev;
          }
          return prev + 10;
        });
      }, 300);

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });

      clearInterval(intervalId);
      setUploadProgress(100);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const data = await response.json();

      // Refresh session để cập nhật avatar trong context
      await refreshSession();

      toast.success("Avatar đã được cập nhật");
    } catch (error: any) {
      toast.error(error.message || "Upload avatar thất bại");
      console.error("Upload error:", error);
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
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
            disabled={isUploading}
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
          disabled={isUploading}
        />

        {isUploading && (
          <div className="w-full max-w-xs space-y-2">
            <Progress value={uploadProgress} className="h-2 w-full" />
            <p className="text-center text-sm text-muted-foreground">
              Đang tải lên... {uploadProgress}%
            </p>
          </div>
        )}

        {preview && !isUploading && (
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

        {!preview && !isUploading && (
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
