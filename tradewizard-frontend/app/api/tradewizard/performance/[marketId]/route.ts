import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface RouteContext {
  params: Promise<{ marketId: string }>; // This is actually the Polymarket condition_id
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { marketId } = await context.params; // This is the Polymarket condition_id from the URL

    if (!marketId) {
      return NextResponse.json(
        { error: "Market ID is required" },
        { status: 400 }
      );
    }

    // Fetch recommendations for this market
    // Note: marketId parameter is actually the Polymarket condition_id, not our database UUID
    // For active markets, query from base tables; for closed markets, use the performance view
    const { data: market, error: marketError } = await supabase
      .from("markets")
      .select("id, condition_id, question, event_type, status, resolved_outcome")
      .eq("condition_id", marketId)
      .single();

    if (marketError || !market) {
      console.error("Error fetching market:", marketError);
      return NextResponse.json(
        { error: "Market not found" },
        { status: 404 }
      );
    }

    const isResolved = market.status === 'resolved';

    let recommendations;
    let recError;

    if (isResolved) {
      // For resolved markets, use the performance view with outcome data
      // Use the database UUID (market.id) for querying recommendations
      const result = await supabase
        .from("v_closed_markets_performance")
        .select("*")
        .eq("market_id", market.id)
        .order("recommendation_created_at", { ascending: false });
      
      recommendations = result.data;
      recError = result.error;
    } else {
      // For active markets, query recommendations directly
      // Use the database UUID (market.id) for querying recommendations
      // Note: market_probability_at_recommendation is not in recommendations table,
      // we'll calculate it from entry_zone_max (approximation)
      const result = await supabase
        .from("recommendations")
        .select(`
          id,
          market_id,
          direction,
          confidence,
          fair_probability,
          market_edge,
          expected_value,
          entry_zone_min,
          entry_zone_max,
          explanation,
          created_at
        `)
        .eq("market_id", market.id)
        .order("created_at", { ascending: false });
      
      recommendations = result.data;
      recError = result.error;
    }

    if (recError) {
      console.error("Error fetching market recommendations:", recError);
      return NextResponse.json(
        { error: "Failed to fetch market performance data" },
        { status: 500 }
      );
    }

    if (!recommendations || recommendations.length === 0) {
      return NextResponse.json(
        { error: "No performance data found for this market" },
        { status: 404 }
      );
    }

    // Extract market info
    const marketInfo = {
      id: market.id,
      conditionId: market.condition_id,
      question: market.question,
      description: "", // Not in view, would need separate query if needed
      eventType: market.event_type,
      resolvedOutcome: market.resolved_outcome || "Pending",
      resolutionDate: isResolved && (recommendations as any)[0]?.resolution_date 
        ? (recommendations as any)[0].resolution_date 
        : new Date().toISOString(),
      slug: market.question && market.id
        ? generateMarketSlug(market.question, market.id)
        : `market-${market.id || marketId}`,
    };

    // Fetch agent signals for this market (if available)
    // Use the database UUID (market.id) for querying agent signals
    const { data: agentSignals, error: signalsError } = await supabase
      .from("agent_signals")
      .select("agent_name, direction, agent_probability, agent_confidence")
      .eq("market_id", market.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (signalsError) {
      console.error("Error fetching agent signals:", signalsError);
    }

    // Transform recommendations to include outcome data
    const recommendationsWithOutcome = recommendations.map((rec: any) => {
      if (isResolved) {
        // Data from v_closed_markets_performance view
        return {
          id: rec.recommendation_id,
          marketId: rec.market_id,
          direction: rec.direction,
          confidence: rec.confidence,
          fairProbability: rec.fair_probability,
          marketEdge: rec.market_edge,
          expectedValue: rec.expected_value,
          entryZoneMin: rec.entry_zone_min,
          entryZoneMax: rec.entry_zone_max,
          explanation: rec.explanation,
          createdAt: rec.recommendation_created_at,
          actualOutcome: rec.resolved_outcome,
          wasCorrect: rec.recommendation_was_correct,
          roiRealized: rec.roi_realized || 0,
          edgeCaptured: rec.edge_captured || 0,
          marketPriceAtRecommendation: rec.market_probability_at_recommendation,
          resolutionDate: rec.resolution_date,
          entryPrice: rec.market_probability_at_recommendation,
          exitPrice: rec.resolved_outcome === "YES" ? 1.0 : 0.0,
        };
      } else {
        // Data from recommendations table (active market)
        // Estimate market price from entry zone (midpoint approximation)
        const estimatedMarketPrice = (rec.entry_zone_min + rec.entry_zone_max) / 2;
        
        return {
          id: rec.id,
          marketId: rec.market_id,
          direction: rec.direction,
          confidence: rec.confidence,
          fairProbability: rec.fair_probability,
          marketEdge: rec.market_edge,
          expectedValue: rec.expected_value,
          entryZoneMin: rec.entry_zone_min,
          entryZoneMax: rec.entry_zone_max,
          explanation: rec.explanation,
          createdAt: rec.created_at,
          actualOutcome: "Pending",
          wasCorrect: false, // Unknown for active markets
          roiRealized: 0, // Cannot calculate for active markets
          edgeCaptured: 0,
          marketPriceAtRecommendation: estimatedMarketPrice,
          resolutionDate: new Date().toISOString(),
          entryPrice: estimatedMarketPrice,
          exitPrice: undefined, // No exit price for active markets
        };
      }
    });

    // Calculate performance metrics
    const metrics = calculateMarketMetrics(recommendationsWithOutcome);

    return NextResponse.json({
      market: marketInfo,
      recommendations: recommendationsWithOutcome,
      metrics,
      agentSignals: agentSignals || [],
    });
  } catch (error) {
    console.error("Error in market performance detail API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function generateMarketSlug(question: string, marketId: string): string {
  const slug = question
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 60);
  
  const idSuffix = marketId.substring(0, 8);
  return `${slug}-${idSuffix}`;
}

function calculateMarketMetrics(recommendations: any[]) {
  if (recommendations.length === 0) {
    return {
      accuracy: {
        total: 0,
        correct: 0,
        percentage: 0,
        byConfidence: {
          high: { total: 0, correct: 0, percentage: 0 },
          moderate: { total: 0, correct: 0, percentage: 0 },
          low: { total: 0, correct: 0, percentage: 0 },
        },
      },
      roi: {
        total: 0,
        average: 0,
        best: 0,
        worst: 0,
        byRecommendation: [],
      },
    };
  }

  // Calculate accuracy
  const correctCount = recommendations.filter(r => r.wasCorrect).length;
  const accuracyPercentage = (correctCount / recommendations.length) * 100;

  // Calculate accuracy by confidence
  const byConfidence = {
    high: { total: 0, correct: 0, percentage: 0 },
    moderate: { total: 0, correct: 0, percentage: 0 },
    low: { total: 0, correct: 0, percentage: 0 },
  };

  recommendations.forEach(rec => {
    const conf = rec.confidence as "high" | "moderate" | "low";
    byConfidence[conf].total++;
    if (rec.wasCorrect) {
      byConfidence[conf].correct++;
    }
  });

  Object.keys(byConfidence).forEach(key => {
    const conf = key as "high" | "moderate" | "low";
    if (byConfidence[conf].total > 0) {
      byConfidence[conf].percentage = 
        (byConfidence[conf].correct / byConfidence[conf].total) * 100;
    }
  });

  // Calculate ROI metrics
  const roiValues = recommendations.map(r => r.roiRealized || 0);
  const totalROI = roiValues.reduce((sum, roi) => sum + roi, 0);
  const avgROI = totalROI / recommendations.length;
  const bestROI = Math.max(...roiValues);
  const worstROI = Math.min(...roiValues);

  const roiByRecommendation = recommendations.map(rec => ({
    id: rec.id,
    roi: rec.roiRealized || 0,
  }));

  return {
    accuracy: {
      total: recommendations.length,
      correct: correctCount,
      percentage: Math.round(accuracyPercentage * 100) / 100,
      byConfidence,
    },
    roi: {
      total: Math.round(totalROI * 100) / 100,
      average: Math.round(avgROI * 100) / 100,
      best: Math.round(bestROI * 100) / 100,
      worst: Math.round(worstROI * 100) / 100,
      byRecommendation: roiByRecommendation,
    },
  };
}
