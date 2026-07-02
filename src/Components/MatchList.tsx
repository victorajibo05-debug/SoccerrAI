import { useState, useEffect } from "react";
import { MatchCard } from "./MatchCard";
import { fetchPrediction } from "../services/predictionService";
import type { MatchResponse, Prediction } from "./types/types";

interface MatchListProps {
    matches: MatchResponse[];
}


export function MatchList({ matches }: MatchListProps) {
    const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
    


    

useEffect(() => {
  matches.forEach(async (match) => {
    const key = match.id; //  whatever uniquely identifies a matchor
    const result = await fetchPrediction(
      match.homeTeam.name,
      match.awayTeam.name,
      match.utcDate
    );
    setPredictions((prev) => ({ ...prev, [key]: result }));
  });
}, [matches]);

// Sort matches by competition name
const sortedMatches = [...matches].sort((a, b) =>
        a.competition.name.localeCompare(b.competition.name)
    );

    const containerStyle: React.CSSProperties = {
        display: 'flex',
        flexWrap: 'wrap',
        flexDirection: 'column',
        gap: '12px',

    };

    const emptyStateStyle: React.CSSProperties = {
        padding: '40px',
        textAlign: 'center',
        color: '#888888',
        backgroundColor: '#111111',
        borderRadius: '12px',
        border: '1px solid #1a1a1a',
    };

    if (!matches || matches.length === 0) {
        return (
            <div style={emptyStateStyle}>
                <h3>No matches for this day</h3>
                <p style={{ fontSize: '14px', marginTop: '8px' }}>
                    Check back later for updates.
                </p>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            {sortedMatches.map((match) => (
                <MatchCard
                    key={match.id}
                    match={match}
                    prediction={predictions[match.id]}
                />
            ))}
        </div>
    );
}