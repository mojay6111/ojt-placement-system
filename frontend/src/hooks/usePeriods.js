import { useEffect, useState } from "react";
import api from "../api/axios";

export default function usePeriods() {
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/periods")
      .then((res) => {
        setPeriods(res.data);
        // Auto-select current period
        const current = res.data.find((p) => p.isCurrent);
        if (current) setSelectedPeriod(String(current.periodID));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { periods, selectedPeriod, setSelectedPeriod, loading };
}
