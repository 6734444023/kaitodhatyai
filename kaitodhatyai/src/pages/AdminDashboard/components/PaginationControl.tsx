import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PaginationControl({
  page,
  totalPages,
  total,
  pageStart,
  pageEnd,
  setPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageStart: number;
  pageEnd: number;
  setPage: (page: number) => void;
}) {
  return (
    <div
      style={{
        marginTop: 20,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ color: "var(--muted)" }}>
        แสดงผล {total === 0 ? 0 : pageStart + 1} – {Math.min(total, pageEnd)}{" "}
        จากทั้งหมด {total}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button
          className="btn btn-map"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          <ChevronLeft size={16} /> ก่อนหน้า
        </button>

        <button
          className="btn btn-map"
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          ถัดไป <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
