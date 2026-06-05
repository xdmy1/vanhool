"use client";

import { useState } from "react";

import { DateInputEU } from "@/components/common/DateInputEU";

/**
 * Custom-range from/to fields for the /panel/facturi filter form.
 * Stored as state so the visible text stays DD/MM/YYYY while the
 * hidden inputs submit the ISO value over the GET form.
 */
export function FacturiDateRangeFields({
  fromParam,
  toParam,
}: {
  fromParam: string;
  toParam: string;
}) {
  const [from, setFrom] = useState(fromParam);
  const [to, setTo] = useState(toParam);
  return (
    <>
      <DateInputEU
        value={from}
        onChange={setFrom}
        name="from"
        className="w-32"
      />
      <span className="text-muted">—</span>
      <DateInputEU value={to} onChange={setTo} name="to" className="w-32" />
    </>
  );
}
