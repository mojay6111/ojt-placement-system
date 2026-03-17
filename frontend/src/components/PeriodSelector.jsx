export default function PeriodSelector({ periods, selectedPeriod, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <label
        style={{
          color: "#666",
          fontSize: "11px",
          fontWeight: "600",
          letterSpacing: "1px",
        }}
      >
        PERIOD
      </label>
      <select
        value={selectedPeriod}
        onChange={(e) => onChange(e.target.value)}
        style={{
          backgroundColor: "#1a1a1a",
          border: "1px solid #333",
          borderRadius: "8px",
          color: "#fff",
          padding: "8px 14px",
          fontSize: "13px",
          cursor: "pointer",
          outline: "none",
          minWidth: "180px",
        }}
      >
        <option value="all">All Periods</option>
        {periods.map((p) => (
          <option key={p.periodID} value={p.periodID}>
            {p.name} {p.isCurrent ? "⭐ Current" : ""}
          </option>
        ))}
      </select>
      {periods.find((p) => String(p.periodID) === String(selectedPeriod))
        ?.isCurrent && (
        <span
          style={{
            backgroundColor: "rgba(74,222,128,0.1)",
            border: "1px solid rgba(74,222,128,0.3)",
            color: "#4ade80",
            padding: "4px 10px",
            borderRadius: "20px",
            fontSize: "11px",
            fontWeight: "600",
          }}
        >
          ⭐ Current Period
        </span>
      )}
    </div>
  );
}
