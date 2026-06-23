import React, { useState } from 'react';
import type { MatchResponse, Prediction } from './types/types';
import { fetchMarketAnalysis } from '../services/geminiServices';

function toPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

interface MatchCardProps {
    match: MatchResponse;
    prediction?: Prediction;
}

export function MatchCard({ match, prediction }: MatchCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [loadingAnalysis, setLoadingAnalysis] = useState(false);

    const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED';

    const handleCardClick = async () => {
        setIsExpanded(!isExpanded);

        if (!analysis && !isExpanded) {
            setLoadingAnalysis(true);
            try {
                const result = await fetchMarketAnalysis(
                    match.homeTeam.name,
                    match.awayTeam.name
                );
                setAnalysis(result);
            } catch (err) {
                setAnalysis("Could not load AI analysis right now.");
            } finally {
                setLoadingAnalysis(false);
            }
        }
    };

    const cardStyle: React.CSSProperties = {
        backgroundColor: '#111111',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid #1a1a1a',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginBottom: '10px',
        cursor: 'pointer'
    };

    const headerStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontFamily: 'Bebas Neue',
        fontSize: '12px',
        color: '#888888',
        borderBottom: '1px solid #1a1a1a',
        paddingBottom: '8px'
    };

    const liveBadgeStyle: React.CSSProperties = {
        color: '#22c55e',
        fontWeight: 'bold',
        fontFamily: 'Bebas Neue',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
    };

    const teamsContainerStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    };

    const teamRowStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    };

    const teamInfoStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '16px',
        fontWeight: '500',
        fontFamily: 'Bebas Neue'
    };

    const logoStyle: React.CSSProperties = {
        width: '24px',
        height: '24px',
        objectFit: 'contain'
    };

    const scoreStyle: React.CSSProperties = {
        fontSize: '18px',
        fontWeight: 'bold',
        fontFamily: 'Bebas Neue',
        color: isLive ? '#22c55e' : '#ffffff'
    };

    const predictionRowStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontFamily: 'Bebas Neue',
        fontSize: '13px',
        color: '#888888',
        borderTop: '1px solid #1a1a1a',
        paddingTop: '8px',
        marginTop: '4px'
    };

    const predictionValueStyle: React.CSSProperties = {
        color: '#ffffff',
        fontWeight: 'bold'
    };

    const analysisContainerStyle: React.CSSProperties = {
        marginTop: '8px',
        paddingTop: '12px',
        borderTop: '1px solid #1a1a1a',
        fontFamily: 'Bebas Neue',
        fontSize: '14px',
        lineHeight: '1.5'
    };

    return (
        <div style={cardStyle} onClick={handleCardClick}>
            <div style={headerStyle}>
                <span>{match.competition.name} • {match.area.name}</span>
                {isLive ? (
                    <span style={liveBadgeStyle}>
                        <span style={{
                            width: '8px',
                            height: '8px',
                            backgroundColor: '#22c55e',
                            borderRadius: '50%',
                            display: 'inline-block'
                        }} />
                        {match.minute !== null ? `${match.minute}'` : 'LIVE'}
                    </span>
                ) : (
                    <span>{match.status}</span>
                )}
            </div>

            <div style={{ fontFamily: 'Bebas Neue', fontSize: '15px', color: '#ffffff', fontWeight: 'bold', alignContent: "flex-end" }}>
                {match.utcDate ? new Date(match.utcDate).toLocaleString() : 'Date not available'}
            </div>

            <div style={teamsContainerStyle}>
                {/* Home Team */}
                <div style={teamRowStyle}>
                    <div style={teamInfoStyle}>
                        <img src={match.homeTeam.crest ?? undefined} alt={match.homeTeam.name} style={logoStyle} />
                        <span>{match.homeTeam.name}</span>
                    </div>
                    <span style={scoreStyle}>
                        {match.score.fullTime.home !== null ? match.score.fullTime.home : '-'}
                    </span>
                </div>

                {/* Away Team */}
                <div style={teamRowStyle}>
                    <div style={teamInfoStyle}>
                        <img src={match.awayTeam.crest ?? undefined} alt={match.awayTeam.name} style={logoStyle} />
                        <span>{match.awayTeam.name}</span>
                    </div>
                    <span style={scoreStyle}>
                        {match.score.fullTime.away !== null ? match.score.fullTime.away : '-'}
                    </span>
                </div>
            </div>

            {prediction && (
                <div style={predictionRowStyle}>
                    <span>Home: <span style={predictionValueStyle}>{toPercent(prediction.home_win)}</span></span>
                    <span>Draw: <span style={predictionValueStyle}>{toPercent(prediction.draw)}</span></span>
                    <span>Away: <span style={predictionValueStyle}>{toPercent(prediction.away_win)}</span></span>
                </div>
            )}

            {isExpanded && (
                <div style={analysisContainerStyle}>
                    {loadingAnalysis ? (
                        <span style={{ color: '#888888' }}>Analyzing markets...</span>
                    ) : (
                        analysis && analysis.split('\n').filter(line => line.trim() !== '').map((line, index) => {
                            const colonIndex = line.indexOf(':');
                            const label = colonIndex !== -1 ? line.slice(0, colonIndex) : line;
                            const rest = colonIndex !== -1 ? line.slice(colonIndex + 1) : '';
                            const isBestMarket = label.toUpperCase().includes('BEST MARKET');

                            return (
                                <div key={index} style={{ marginBottom: '8px' }}>
                                    <span style={{
                                        fontWeight: 'bold',
                                        fontSize: isBestMarket ? '16px' : '14px',
                                        color: isBestMarket ? '#22c55e' : '#ffffff',
                                    }}>
                                        {label}:
                                    </span>
                                    <span style={{ color: '#cccccc' }}>{rest}</span>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}