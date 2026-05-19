'use client';

import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Footer } from '@/components/custom/footer';
import { Header } from '@/components/custom/header';
import { PositionsTable } from '@/components/custom/positions-table';
import { ThemeToggle } from '@/components/custom/theme-toggle';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { TradeControls } from './trade-controls';
import type {
  AuthState,
  DerivAccount,
  ActiveSymbol,
  Tick,
  BuyResult,
  DerivWS,
} from '@deriv/core';
import type { GrowthRate } from '../lib/types';
import type { AccumulatorProposalInfo } from '../hooks/use-accumulator-proposal';
import type { UseSmartChartsApiReturn } from '@/hooks/use-smartcharts-api';
import type { SmartChartChartData } from '@/hooks/use-smartchart-chart-data';
import type { OpenPosition, ClosedPosition } from '../lib/types';

const AccumulatorChart = dynamic(
  () => import('./accumulator-chart').then(m => m.AccumulatorChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse rounded-md border border-border/50 bg-muted/30" />
    ),
  }
);

const ACCUMULATOR_CONTRACT_LABELS: Record<string, string> = {
  ACCU: 'Accumulator',
};

export interface AccumulatorViewProps {
  // Auth
  authState: AuthState;
  accounts: DerivAccount[];
  activeAccount: DerivAccount | null;
  onLogin: () => Promise<void>;
  onSignUp: () => Promise<void>;
  onLogout: () => void;
  onSwitchAccount: (accountId: string) => Promise<void>;

  // Connection / loading
  ws: DerivWS | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;

  // Market data
  symbols: ActiveSymbol[];
  activeSymbol: ActiveSymbol | null;
  selectSymbol: (symbol: string) => void;
  currentTick: Tick | null;

  // Trade controls
  growthRate: GrowthRate;
  setGrowthRate: (rate: GrowthRate) => void;
  growthRateOptions: { value: number; label: string }[];
  stake: string;
  setStake: (value: string) => void;
  takeProfit: string;
  setTakeProfit: (value: string) => void;
  proposal: AccumulatorProposalInfo | null;
  buyContract: () => Promise<void>;
  isBuying: boolean;
  buyResult: BuyResult | null;
  buyError: string | null;
  clearBuyResult: () => void;

  // Positions
  openPositions: OpenPosition[];
  closedPositions: ClosedPosition[];
  sellContract: (contractId: number, bidPrice: string) => Promise<void>;
  sellingId: number | null;
  sellError: string | null;
  clearSellError: () => void;

  // Chart data
  chartData: SmartChartChartData | undefined;
  getQuotes: UseSmartChartsApiReturn['getQuotes'];
  subscribeQuotes: UseSmartChartsApiReturn['subscribeQuotes'];
  unsubscribeQuotes: UseSmartChartsApiReturn['unsubscribeQuotes'];
  /** Passed to SmartChart. Set to false for a frozen preview. Defaults to true. */
  isLive?: boolean;
  /** Unix epoch (seconds) to freeze the chart at. */
  endEpoch?: number;

  // Branding (used by preview route; no-op in the real app)
  logoSrc?: string;
}

export function AccumulatorView({
  authState,
  accounts,
  activeAccount,
  onLogin,
  onSignUp,
  onLogout,
  onSwitchAccount,
  ws,
  isConnected,
  isLoading,
  error,
  symbols,
  activeSymbol,
  selectSymbol,
  growthRate,
  setGrowthRate,
  growthRateOptions,
  stake,
  setStake,
  takeProfit,
  setTakeProfit,
  proposal,
  buyContract,
  isBuying,
  buyResult,
  buyError,
  clearBuyResult,
  openPositions,
  closedPositions,
  sellContract,
  sellingId,
  sellError,
  clearSellError,
  chartData,
  getQuotes,
  subscribeQuotes,
  unsubscribeQuotes,
  isLive,
  endEpoch,
  logoSrc,
}: AccumulatorViewProps) {
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <main className="flex flex-col bg-background items-center justify-center px-4 min-h-dvh">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Connecting to Deriv...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-col bg-background items-center justify-center px-4 min-h-dvh">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-destructive">Connection Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex flex-col bg-background max-lg:h-dvh lg:overflow-visible">
      <div className="shrink-0">
        <Header
          authState={authState}
          accounts={accounts}
          activeAccount={activeAccount}
          onLogin={onLogin}
          onSignUp={onSignUp}
          onLogout={onLogout}
          onSwitchAccount={onSwitchAccount}
          logoSrc={logoSrc}
          actions={<ThemeToggle />}
        />
      </div>

      <div className="flex w-full max-w-7xl mx-auto flex-col px-3 py-2 sm:px-4 sm:py-4 gap-2 sm:gap-3 max-lg:flex-1 max-lg:min-h-0 max-lg:overflow-hidden lg:flex-none lg:overflow-visible">
        <div className="max-lg:flex max-lg:flex-col max-lg:flex-1 max-lg:min-h-0 lg:grid lg:grid-cols-[1fr_400px] lg:gap-4">
          {/* Column 1: Chart */}
          <div className="max-lg:shrink-0 flex flex-col gap-2 max-lg:pb-2 pt-2 lg:py-0">
            <div className="max-lg:h-[50dvh] lg:h-[min(33.6rem,66vh)] lg:min-h-[384px]">
              {chartData ? (
                <AccumulatorChart
                  symbolKey="accumulator-chart"
                  symbol={activeSymbol?.underlying_symbol}
                  isConnectionOpened={isConnected}
                  isMobile={isMobile}
                  chartData={chartData}
                  getQuotes={getQuotes}
                  subscribeQuotes={subscribeQuotes}
                  unsubscribeQuotes={unsubscribeQuotes}
                  onSymbolChange={selectSymbol}
                  isLive={isLive}
                  endEpoch={endEpoch}
                />
              ) : (
                <div className="h-full w-full animate-pulse rounded-md border border-border/50 bg-muted/30" />
              )}
            </div>
          </div>

          {/* Column 2: Trade controls in a Card */}
          <div className="max-lg:flex-1 max-lg:min-h-0 max-lg:overflow-y-auto max-lg:overscroll-contain max-lg:border-t max-lg:border-border max-lg:pt-3 max-lg:pb-3 lg:pt-0 flex flex-col gap-3">
            <Card className="lg:h-[min(33.6rem,66vh)] lg:min-h-[384px] lg:overflow-y-auto">
              <CardContent className="pt-4">
                <TradeControls
                  growthRate={growthRate}
                  onGrowthRateChange={setGrowthRate}
                  growthRateOptions={growthRateOptions}
                  isConnected={isConnected}
                  stake={stake}
                  onStakeChange={setStake}
                  takeProfit={takeProfit}
                  onTakeProfitChange={setTakeProfit}
                  proposal={proposal}
                  onBuy={buyContract}
                  isBuying={isBuying}
                  buyResult={buyResult}
                  buyError={buyError}
                  onClearBuyResult={clearBuyResult}
                />
              </CardContent>
            </Card>

            {/* Positions table — visible inside the scroll area on mobile only */}
            <div className="lg:hidden">
              <PositionsTable
                openPositions={openPositions}
                closedPositions={closedPositions}
                onSell={sellContract}
                sellingId={sellingId}
                sellError={sellError}
                onClearSellError={clearSellError}
                contractTypeLabels={ACCUMULATOR_CONTRACT_LABELS}
              />
            </div>
          </div>
        </div>

        {/* Positions table — desktop only */}
        <div className="max-lg:hidden">
          <PositionsTable
            openPositions={openPositions}
            closedPositions={closedPositions}
            onSell={sellContract}
            sellingId={sellingId}
            sellError={sellError}
            onClearSellError={clearSellError}
            contractTypeLabels={ACCUMULATOR_CONTRACT_LABELS}
          />
        </div>
      </div>

      {/* Mobile-only: buy button + footer */}
      <div className="lg:hidden shrink-0 border-t border-border bg-background px-3 pt-2 pb-[env(safe-area-inset-bottom)]">
        <Button
          className="w-full h-auto py-2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-6"
          disabled={!isConnected || !proposal || isBuying}
          onClick={buyContract}
        >
          {isBuying ? 'Purchasing...' : 'Buy'}
        </Button>
        <Footer />
      </div>

      {/* Desktop-only: fixed footer */}
      <div className="hidden lg:block fixed bottom-0 left-0 right-0 py-2 text-center bg-background/80 backdrop-blur-sm">
        <Footer />
      </div>
    </main>
  );
}
