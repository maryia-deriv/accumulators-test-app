'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { BuyResult } from '@deriv/core';
import type { AccumulatorProposalInfo } from '../hooks/use-accumulator-proposal';
import type { GrowthRate } from '../lib/types';

interface TradeControlsProps {
  growthRate: GrowthRate;
  onGrowthRateChange: (rate: GrowthRate) => void;
  growthRateOptions: { value: number; label: string }[];
  isConnected: boolean;
  stake: string;
  onStakeChange: (value: string) => void;
  takeProfit: string;
  onTakeProfitChange: (value: string) => void;
  proposal: AccumulatorProposalInfo | null;
  onBuy: () => void;
  isBuying: boolean;
  buyResult: BuyResult | null;
  buyError: string | null;
  onClearBuyResult: () => void;
}

export function TradeControls({
  growthRate,
  onGrowthRateChange,
  growthRateOptions,
  isConnected,
  stake,
  onStakeChange,
  takeProfit,
  onTakeProfitChange,
  proposal,
  onBuy,
  isBuying,
  buyResult,
  buyError,
  onClearBuyResult,
}: TradeControlsProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  useEffect(() => {
    if (buyError) {
      toast.error('Purchase Failed', { description: buyError });
      onClearBuyResult();
    }
  }, [buyError, onClearBuyResult]);

  useEffect(() => {
    if (buyResult) {
      toast.success('Contract Purchased', {
        description: `Buy price: ${buyResult.buyPrice.toFixed(2)} USD | Payout: ${buyResult.payout.toFixed(2)} USD | Balance: ${buyResult.balanceAfter.toFixed(2)} USD`,
      });
      onClearBuyResult();
    }
  }, [buyResult, onClearBuyResult]);

  return (
    <div className="w-full space-y-3 lg:max-w-[400px] lg:space-y-4">
      {/* Growth Rate selector */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Label className="text-xs text-muted-foreground">Growth rate</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-muted-foreground/40 text-[10px] text-muted-foreground">
                  i
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[200px]">
                <p className="text-xs">
                  Your stake grows by the selected percentage for each tick that stays within the barrier range.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Select
          value={String(growthRate)}
          onValueChange={(value) => {
            onGrowthRateChange(parseFloat(value));
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {growthRateOptions.map((opt) => (
              <SelectItem key={opt.value} value={String(opt.value)}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stake */}
      <div className="space-y-1.5">
        <Label htmlFor="stake" className="text-xs text-muted-foreground">Stake</Label>
        <Input
          id="stake"
          type="number"
          value={stake}
          onChange={(e) => onStakeChange(e.target.value)}
          onKeyDown={(e) => {
            if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
          }}
          min={0}
          step="0.01"
          labelRight="USD"
        />
      </div>

      {/* Take Profit (optional) */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Label htmlFor="take-profit" className="text-xs text-muted-foreground">Take profit</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-muted-foreground/40 text-[10px] text-muted-foreground">
                  i
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[200px]">
                <p className="text-xs">
                  The contract closes automatically when your profit reaches this amount. Leave empty for no limit.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Input
          id="take-profit"
          type="number"
          value={takeProfit}
          onChange={(e) => onTakeProfitChange(e.target.value)}
          onKeyDown={(e) => {
            if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
          }}
          min={0}
          step="0.01"
          placeholder="-"
          labelRight="USD"
        />
      </div>

      {/* Contract info summary */}
      {proposal && (
        <div className="space-y-1.5 rounded-md border border-border/50 bg-muted/30 p-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Max. payout</span>
            <span className="font-medium">{proposal.maxPayout.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</span>
          </div>
          {proposal.barrierPercentage && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Barrier</span>
              <span className="font-medium">{proposal.barrierPercentage}</span>
            </div>
          )}
          {proposal.maxTicks > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Max. duration</span>
              <span className="font-medium">{proposal.maxTicks} ticks</span>
            </div>
          )}
        </div>
      )}

      {/* Desktop-only: buy button */}
      {isDesktop && (
        <Button
          className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
          size="lg"
          disabled={!isConnected || !proposal || isBuying}
          onClick={onBuy}
        >
          {isBuying ? 'Purchasing...' : 'Buy'}
        </Button>
      )}
    </div>
  );
}
