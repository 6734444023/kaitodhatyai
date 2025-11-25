import { useEffect, useState } from "react";
import "./index.css";

export default function RequestFilters({
  onChange,
}: {
  onChange: (filters: { viewType: string; status: string }) => void;
}) {
  // view: "mine" | "all"
  const [viewType, setViewType] = useState("mine");
  // status: "" (all) | "OPEN" | "PENDING" | "RESOLVED"
  const [status, setStatus] = useState("");

  // notify parent when filters change
  useEffect(() => {
    if (onChange) onChange({ viewType, status });
  }, [viewType, status, onChange]);

  return (
    <div className="filters-row-2">
      <div className="filter-group">
        <label htmlFor="viewType">แสดงผล</label>
        <select
          id="viewType"
          value={viewType}
          onChange={(e) => setViewType(e.target.value)}
        >
          <option value="mine">ดูเฉพาะคำร้องของฉัน</option>
          <option value="all">ดูทั้งหมด</option>
        </select>
      </div>

      {/* <div className="filter-group">
        <label htmlFor="statusFilter">สถานะ</label>
        <select
          id="statusFilter"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">ทั้งหมด</option>
          <option value="OPEN">รอความช่วยเหลือ</option>
          <option value="PENDING">มีผู้รับเรื่อง</option>
          <option value="RESOLVED">ช่วยเหลือสำเร็จ</option>
        </select>
      </div> */}

      <div className="filter-actions">
        <button
          type="button"
          className="btn apply"
          onClick={() => {
            if (onChange) onChange({ viewType, status });
          }}
        >
          Apply
        </button>
        <button
          type="button"
          className="btn clear"
          onClick={() => {
            setViewType("mine");
            setStatus("");
            if (onChange) onChange({ viewType: "mine", status: "" });
          }}
        >
          ล้าง
        </button>
      </div>
    </div>
  );
}
