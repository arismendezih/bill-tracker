import { useEffect, useMemo, useState } from "react";
import "./App.css";

const BILLS = [
  { id: "superbox", name: "SuperBox", amount: 700 },
  { id: "traverse_0216", name: "Traverse (Feb 16)", amount: 888.5 },
  { id: "tires", name: "Tires", amount: 500 },
  { id: "phone", name: "Phone Bill", amount: 581.71 },
  { id: "traverse_0301", name: "Traverse (Mar 1)", amount: 888.5 }
];

const money = (n) =>
  Number(n || 0).toLocaleString(undefined, {
    style: "currency",
    currency: "USD"
  });

export default function App() {
  // rollover cash
  const [carryover, setCarryover] = useState(
    Number(localStorage.getItem("carryover") || 0)
  );

  // tonight inputs
  const [income, setIncome] = useState("");
  const [spent, setSpent] = useState("");

  // bill allocations
  const [allocations, setAllocations] = useState(() => {
    const saved = localStorage.getItem("allocations");
    return saved ? JSON.parse(saved) : {};
  });

  // persist data
  useEffect(() => {
    localStorage.setItem("carryover", carryover);
  }, [carryover]);

  useEffect(() => {
    localStorage.setItem("allocations", JSON.stringify(allocations));
  }, [allocations]);

  const totalAllocated = useMemo(
    () => Object.values(allocations).reduce((a, b) => a + b, 0),
    [allocations]
  );

  const totalCashLeft = useMemo(() => {
    return (
      carryover +
      Number(income || 0) -
      Number(spent || 0) -
      totalAllocated
    );
  }, [carryover, income, spent, totalAllocated]);

  function endNight() {
    setCarryover(totalCashLeft);
    setIncome("");
    setSpent("");
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <h1>Nightly Bill Tracker</h1>

      <div>
        <label>Income Tonight ($)</label>
        <input
          type="number"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
        />
      </div>

      <div>
        <label>Spent Tonight ($)</label>
        <input
          type="number"
          value={spent}
          onChange={(e) => setSpent(e.target.value)}
        />
      </div>

      <h2>Total Cash Left</h2>
      <h3>{money(totalCashLeft)}</h3>

      <button onClick={endNight}>End Night & Roll Over</button>

      <hr />

      <h2>Assign Cash to Bills</h2>

      {BILLS.map((bill) => {
        const paid = allocations[bill.id] || 0;
        const remaining = bill.amount - paid;

        return (
          <div
            key={bill.id}
            style={{
              border: "1px solid #444",
              padding: 12,
              marginBottom: 12
            }}
          >
            <strong>{bill.name}</strong>
            <div>Total: {money(bill.amount)}</div>
            <div>Saved: {money(paid)}</div>
            <div>Remaining: {money(remaining)}</div>

            <input
              type="number"
              placeholder="Add amount"
              onChange={(e) => {
                const value = Number(e.target.value || 0);
                setAllocations((prev) => ({
                  ...prev,
                  [bill.id]: (prev[bill.id] || 0) + value
                }));
                e.target.value = "";
              }}
            />
          </div>
        );
      })}
      <div style={{ height: 2000 }} />
    </div>
  );
}