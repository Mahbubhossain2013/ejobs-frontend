"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check } from "lucide-react";

interface Currency {
  id: number;
  code: string;
  symbol: string;
  rate: number;
}

export default function CurrencySwitcher() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [currentCode, setCurrentCode] = useState("BDT");
  const [currentSymbol, setCurrentSymbol] = useState("৳");

  useEffect(() => {
    const savedCode = localStorage.getItem("currency_code");
    const savedSymbol = localStorage.getItem("currency_symbol");
    if (savedCode) setCurrentCode(savedCode);
    if (savedSymbol) setCurrentSymbol(savedSymbol);

    api
      .get("/currencies")
      .then((res) => {
        const data = res.data?.data;
        if (Array.isArray(data)) {
          setCurrencies(data);
          // Apply default from API if nothing saved yet
          if (!savedCode && data.length > 0) {
            const defaultCur = data.find((c: Currency) => c.code === "BDT") || data[0];
            applyCurrency(defaultCur);
          }
        }
      })
      .catch(() => { /* handled */ });
  }, []);

  function applyCurrency(currency: Currency) {
    localStorage.setItem("currency_code", currency.code);
    localStorage.setItem("currency_symbol", currency.symbol);
    localStorage.setItem("currency_rate", String(currency.rate));
    setCurrentCode(currency.code);
    setCurrentSymbol(currency.symbol);
    window.dispatchEvent(new Event("storage"));
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs font-medium gap-1">
          {currentSymbol} {currentCode}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {currencies.map((currency) => (
          <DropdownMenuItem
            key={currency.id}
            onClick={() => applyCurrency(currency)}
            className="gap-2"
          >
            {currentCode === currency.code && <Check className="h-3 w-3" />}
            <span>{currency.symbol} {currency.code}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
