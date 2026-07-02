import { useState, useEffect } from 'react';
import { getTeamMatches } from '../football';
import { MatchCard } from './MatchCard';
import type { MatchResponse } from './types/types';

interface Team {
    id: number;
    name: string;
    crest: string | null;
    competition: string;
}

interface SearchResultsProps {
    team: Team;
    onBack: () => void;
}

export function SearchResults({ team, onBack }: SearchResultsProps) {
    const [matches, setMatches] = useState<MatchResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        getTeamMatches(team.id)
            .then((res) => {
                setMatches(res.data.matches || []);
                setLoading(false);
            })
            .catch(() => {
                setError('Failed to load matches for this team.');
                setLoading(false);
            });
    }, [team.id]);

    const headerStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
    };

    const backButtonStyle: React.CSSProperties = {
        padding: '6px 14px',
        backgroundColor: 'transparent',
        border: '1px solid #333333',
        borderRadius: '8px',
        color: '#888888',
        fontFamily: 'Bebas Neue',
        cursor: 'pointer',
        fontSize: '13px',
    };

    const teamNameStyle: React.CSSProperties = {
        fontFamily: 'Bebas Neue',
        fontSize: '22px',
        color: '#ffffff',
    };

    const emptyStyle: React.CSSProperties = {
        padding: '40px',
        textAlign: 'center',
        color: '#888888',
        backgroundColor: '#111111',
        borderRadius: '12px',
        border: '1px solid #1a1a1a',
        fontFamily: 'Bebas Neue',
    };

    return (
        <div>
            <div style={headerStyle}>
                <button style={backButtonStyle} onClick={onBack}>
                    ← Back
                </button>
                {team.crest && (
                    <img
                        src={team.crest}
                        alt={team.name}
                        style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                    />
                )}
                <span style={teamNameStyle}>
                    Upcoming: {team.name}
                </span>
            </div>

            {loading ? (
                <div style={emptyStyle}>Loading matches...</div>
            ) : error ? (
                <div style={{ ...emptyStyle, color: '#ef4444' }}>{error}</div>
            ) : matches.length === 0 ? (
                <div style={emptyStyle}>No upcoming matches found for {team.name}.</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {matches.map((match) => (
                        <MatchCard key={match.id} match={match} />
                    ))}
                </div>
            )}
        </div>
    );
}