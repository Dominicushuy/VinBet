// src/components/ui/pagination.tsx
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}: PaginationProps) {
  // Không hiển thị pagination nếu chỉ có 1 trang
  if (totalPages <= 1) {
    return null;
  }

  // Tạo dãy số trang hiển thị
  const getPageNumbers = () => {
    const totalNumbers = siblingCount * 2 + 3; // left + current + right + first + last
    const totalButtons = totalNumbers + 2; // +2 for ellipses

    if (totalPages <= totalButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const showLeftDots = leftSiblingIndex > 2;
    const showRightDots = rightSiblingIndex < totalPages - 1;

    if (!showLeftDots && showRightDots) {
      const leftItemCount = 1 + 2 * siblingCount;
      return [
        ...Array.from({ length: leftItemCount }, (_, i) => i + 1),
        "dots",
        totalPages,
      ];
    }

    if (showLeftDots && !showRightDots) {
      const rightItemCount = 1 + 2 * siblingCount;
      return [
        1,
        "dots",
        ...Array.from(
          { length: rightItemCount },
          (_, i) => totalPages - rightItemCount + i + 1
        ),
      ];
    }

    if (showLeftDots && showRightDots) {
      return [
        1,
        "dots",
        ...Array.from(
          { length: rightSiblingIndex - leftSiblingIndex + 1 },
          (_, i) => leftSiblingIndex + i
        ),
        "dots",
        totalPages,
      ];
    }

    return [];
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center justify-center space-x-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Trang trước</span>
      </Button>

      {pages.map((page, index) => {
        if (page === "dots") {
          return (
            <Button
              key={`dots-${index}`}
              variant="outline"
              size="icon"
              disabled
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More pages</span>
            </Button>
          );
        }

        const pageNumber = page as number;
        return (
          <Button
            key={pageNumber}
            variant={currentPage === pageNumber ? "default" : "outline"}
            size="icon"
            onClick={() => onPageChange(pageNumber)}
            aria-current={currentPage === pageNumber ? "page" : undefined}
          >
            {pageNumber}
            <span className="sr-only">
              {currentPage === pageNumber
                ? `Trang ${pageNumber}`
                : `Chuyển đến trang ${pageNumber}`}
            </span>
          </Button>
        );
      })}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Trang sau</span>
      </Button>
    </div>
  );
}
