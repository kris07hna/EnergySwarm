import { NextResponse } from "next/server";

/**
 * Grid Market Data & Electricity Pricing
 * Real-time and forward market prices, ancillary services, capacity payments
 * Multi-ISO pricing with arbitrage opportunities
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get("region") || "PJM";
    const horizon = parseInt(searchParams.get("horizon_hours") || "24");

    // Hourly Day-Ahead Market (DAM) prices
    const damPrices = Array.from({ length: horizon }, (_, h) => {
      const basePrice = 45;
      const timeOfDay = h % 24;

      // Peak pricing
      let multiplier = 1;
      if (timeOfDay >= 6 && timeOfDay <= 10) multiplier = 1.4;
      if (timeOfDay >= 17 && timeOfDay <= 21) multiplier = 1.6;
      if (timeOfDay >= 2 && timeOfDay <= 6) multiplier = 0.7;

      return {
        hour: h,
        lmp_energy: basePrice * multiplier + Math.random() * 5,
        marginal_loss: 1.2 + Math.random() * 0.5,
        marginal_congestion: 0.8 + Math.random() * 0.3,
        total_lmp: (basePrice * multiplier) + 1.2 + 0.8 + Math.random() * 6,
        volume_mwh: 50000 + Math.random() * 20000,
        bid_ask_spread: 2.5 + Math.random() * 1.5,
      };
    });

    // Real-Time Market (RTM) prices (more volatile)
    const rtmPrices = damPrices.map(dam => ({
      ...dam,
      total_lmp: dam.total_lmp + (Math.random() * 20 - 10), // ±$10 volatility
      volume_mwh: dam.volume_mwh * 0.3, // Smaller RTM volume
    }));

    // Ancillary Services pricing
    const ancillaryServices = {
      regulation_up: 8.5 + Math.random() * 3,
      regulation_down: 6.2 + Math.random() * 2.5,
      spinning_reserve: 5.1 + Math.random() * 2,
      non_spinning_reserve: 3.8 + Math.random() * 1.5,
      voltage_support: 4.5 + Math.random() * 2,
      real_power_loss: 7.2 + Math.random() * 2.5,
    };

    // Capacity market (forward market)
    const capacityMarket = {
      current_clearing_price_per_mw_day: 125.50,
      annual_equivalent: 45837.50,
      auction_date: "2025-06-15",
      next_auction: "2025-12-15",
      availability_requirement_mw: 185000,
      offered_capacity_mw: 195000,
      excess_supply_pct: 5.4,
      trend: "downward",
    };

    // Renewable Energy Credits (REC) pricing
    const recMarket = {
      solar_rec_per_mwh: 42,
      wind_rec_per_mwh: 38,
      combined_rec_per_mwh: 40,
      volume_mwh_annual: 450000,
      compliance_requirement_pct: 35,
    };

    // Multi-ISO price spreads (arbitrage opportunities)
    const isoSpreads = [
      {
        pair: "PJM-MISO",
        current_spread: 8.50,
        avg_spread: 5.20,
        max_spread_today: 12.80,
        recommendation: "MISO cheaper - consider export",
        transmission_loss: 2.5,
      },
      {
        pair: "MISO-SPP",
        current_spread: -3.20,
        avg_spread: -2.50,
        max_spread_today: 5.60,
        recommendation: "Neutral",
        transmission_loss: 1.8,
      },
      {
        pair: "PJM-ISO-NE",
        current_spread: 5.80,
        avg_spread: 4.10,
        max_spread_today: 9.30,
        recommendation: "Potential import to PJM",
        transmission_loss: 3.1,
      },
    ];

    // Congestion pricing (thermal limits)
    const congestionPoints = [
      {
        location: "Chicago North",
        severity: 0.78,
        typical_congestion_cost: 15.50,
        current_marginal_congestion: 8.20,
        expected_relief_hours: 4,
      },
      {
        location: "Ohio Valley",
        severity: 0.45,
        typical_congestion_cost: 8.75,
        current_marginal_congestion: 3.10,
        expected_relief_hours: 6,
      },
      {
        location: "New York City",
        severity: 0.92,
        typical_congestion_cost: 22.30,
        current_marginal_congestion: 12.50,
        expected_relief_hours: 2,
      },
    ];

    // Demand side response compensation
    const dsrCompensation = {
      emergency_response: 350, // $/MWh
      economic_response: 75, // $/MWh
      frequency_response: 45, // $/MWh
      voltage_support: 60, // $/MWh
      expected_activation_events: 12,
      annual_enrollment_incentive: 2500, // $ per MW
    };

    // Forward market curve (7-day, 30-day, monthly, quarterly, yearly)
    const forwardCurve = [
      { period: "Day 1", price: damPrices[0].total_lmp },
      { period: "Day 2", price: 50.5 + Math.random() * 8 },
      { period: "Day 3", price: 49.2 + Math.random() * 7 },
      { period: "Week 1", price: 51.0 + Math.random() * 6 },
      { period: "Week 4", price: 52.5 + Math.random() * 5 },
      { period: "Month 1", price: 53.0 + Math.random() * 4 },
      { period: "Month 3", price: 54.5 + Math.random() * 3 },
      { period: "Year 1", price: 55.0 + Math.random() * 2 },
    ];

    // Price volatility metrics
    const volatilityMetrics = {
      current_day_volatility: 12.5,
      weekly_volatility: 14.2,
      monthly_volatility: 10.8,
      vix_equivalent: 18.3,
      high_volatility_hours: [17, 18, 19, 20], // Peak demand hours
      low_volatility_hours: [2, 3, 4, 5], // Off-peak hours
    };

    // Market alerts and insights
    const marketInsights = [
      {
        type: "price_spike_alert",
        severity: "high",
        message: "LMP forecast spike to $85/MWh during 18:00-20:00 window",
        recommendation: "Discharge storage or reduce load during this window",
      },
      {
        type: "oversupply_alert",
        severity: "moderate",
        message: "Excess wind generation expected 02:00-06:00",
        recommendation: "Charge storage at low prices",
      },
      {
        type: "congestion_alert",
        severity: "high",
        message: "NYC transmission constraints approaching thermal limits",
        recommendation: "Consider demand response or transmission upgrade planning",
      },
    ];

    // Revenue optimization strategies
    const revenueOptimization = {
      strategies: [
        {
          strategy: "Peak Load Shifting",
          estimated_annual_revenue: 450000,
          participants_needed: 500,
          implementation_time: "3 months",
        },
        {
          strategy: "Ancillary Services Provision",
          estimated_annual_revenue: 320000,
          participants_needed: 50,
          implementation_time: "1 month",
        },
        {
          strategy: "Demand Response Program",
          estimated_annual_revenue: 680000,
          participants_needed: 1200,
          implementation_time: "6 months",
        },
      ],
      portfolio_annual_revenue: 1450000,
    };

    return NextResponse.json({
      success: true,
      market: {
        region,
        current_time: new Date().toISOString(),
        pricing_date: new Date().toDateString(),
      },
      day_ahead_market: {
        prices: damPrices,
        avg_price: (damPrices.reduce((sum, p) => sum + p.total_lmp, 0) / damPrices.length).toFixed(2),
        peak_price: Math.max(...damPrices.map(p => p.total_lmp)).toFixed(2),
        off_peak_price: Math.min(...damPrices.map(p => p.total_lmp)).toFixed(2),
      },
      real_time_market: {
        prices: rtmPrices,
        volatility: volatilityMetrics,
      },
      ancillary_services: ancillaryServices,
      capacity_market: capacityMarket,
      renewable_credits: recMarket,
      iso_spreads: isoSpreads,
      congestion_pricing: congestionPoints,
      demand_response_compensation: dsrCompensation,
      forward_curve: forwardCurve,
      market_insights: marketInsights,
      revenue_optimization: revenueOptimization,
    });
  } catch (error) {
    console.error("Market Data API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch market data" },
      { status: 500 }
    );
  }
}
