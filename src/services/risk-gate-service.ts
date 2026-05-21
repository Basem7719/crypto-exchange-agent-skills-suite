import { OrderSpec, RiskCheckResult } from '../types/trading.js';

export interface RiskConfig {
  maxOrderNotionalUsdt: number;
  maxDailyLossUsdt: number;
  maxLeverage: number;
  maxRiskPctPerTrade: number;
  dryRun: boolean;
}

export class RiskGateService {
  constructor(private readonly config: RiskConfig) {}

  check(spec: OrderSpec, accountEquityUsdt: number): RiskCheckResult {
    const reasons: string[] = [];
    const notional = (spec.price ?? 0) * spec.quantity;
    const riskPct = notional / accountEquityUsdt;
    const maxLossUsdt = spec.stop_loss
      ? Math.abs(spec.price! - spec.stop_loss) * spec.quantity
      : notional * 0.1;
    const rrRatio =
      spec.take_profit && spec.stop_loss && spec.price
        ? Math.abs(spec.take_profit - spec.price) / Math.abs(spec.price - spec.stop_loss)
        : undefined;

    if (this.config.dryRun && !spec.client_order_id.startsWith('dry-')) {
      reasons.push('DRY_RUN mode is active — no live orders permitted');
    }

    if (notional > this.config.maxOrderNotionalUsdt) {
      reasons.push(
        `Notional ${notional.toFixed(2)} USDT exceeds max ${this.config.maxOrderNotionalUsdt} USDT`,
      );
    }

    if (riskPct * 100 > this.config.maxRiskPctPerTrade) {
      reasons.push(
        `Trade uses ${(riskPct * 100).toFixed(2)}% of equity (max ${this.config.maxRiskPctPerTrade}%)`,
      );
    }

    if (spec.leverage && spec.leverage > this.config.maxLeverage) {
      reasons.push(`Leverage ${spec.leverage}x exceeds max ${this.config.maxLeverage}x`);
    }

    if (rrRatio !== undefined && rrRatio < 1.5) {
      reasons.push(`R:R ratio ${rrRatio.toFixed(2)} is below minimum 1.5`);
    }

    const specAge = Date.now() - new Date(spec.generated_at).getTime();
    if (specAge > 5 * 60 * 1000) {
      reasons.push('Order spec is older than 5 minutes — re-plan required');
    }

    return {
      approved: reasons.length === 0,
      reasons,
      risk_pct: riskPct * 100,
      reward_risk_ratio: rrRatio,
      max_loss_usdt: maxLossUsdt,
    };
  }

  summarize(result: RiskCheckResult): string {
    if (result.approved) {
      return [
        '✅ Risk gate: APPROVED',
        `   Risk: ${result.risk_pct.toFixed(2)}% of equity`,
        `   Max loss: ${result.max_loss_usdt.toFixed(2)} USDT`,
        result.reward_risk_ratio
          ? `   R:R ratio: ${result.reward_risk_ratio.toFixed(2)}`
          : '',
      ]
        .filter(Boolean)
        .join('\n');
    }
    return [
      '❌ Risk gate: REJECTED',
      ...result.reasons.map((r) => `   • ${r}`),
    ].join('\n');
  }
}
