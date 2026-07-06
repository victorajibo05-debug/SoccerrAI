import { useState, useEffect } from 'react';
import { getTeamMatches, getCompetitionMatches } from '../football';
import { MatchCard } from './MatchCard';
import type { MatchResponse } from './types/types';

interface Team {
    id: number;
    name: string;
    crest: string | null;
    competition: string;
}

interface Competition {
    id: number;
    code: string;
    name: string;
    emblem: string | null;
}

type SearchResult =
    | { type: 'team'; team: Team }
    | { type: 'competition'; competition: Competition };

interface SearchResultsProps {
    result: SearchResult;
    onBack: () => void;
}

export function SearchResults({ result, onBack }: SearchResultsProps) {
    const [matches, setMatches] = useState<MatchResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        const fetchPromise =
            result.type === 'team'
                ? getTeamMatches(result.team.id)
                : getCompetitionMatches(result.competition.code);

        fetchPromise
            .then((res) => {
                setMatches(res.data.matches || []);
                setLoading(false);
            })
            .catch(() => {
                const label = result.type === 'team' ? 'team' : 'competition';
                setError(`Failed to load matches for this ${label}.`);
                setLoading(false);
            });
    }, [result]);

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

    const titleStyle: React.CSSProperties = {
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

    const isTeam = result.type === 'team';
    const name = isTeam ? result.team.name : result.competition.name;
    const icon = isTeam ? result.team.crest : result.competition.emblem;
    const label = isTeam ? 'Upcoming' : 'Fixtures';

    return (
        <div>
            <div style={headerStyle}>
                <button style={backButtonStyle} onClick={onBack}>
                    ← Back
                </button>
                {icon && (
                    <img
                        src={icon}
                        alt={name}
                        style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                    />
                )}
                <span style={titleStyle}>
                    {label}: {name}
                </span>
            </div>

            {loading ? (
                <div style={emptyStyle}>Loading matches...</div>
            ) : error ? (
                <div style={{ ...emptyStyle, color: '#ef4444' }}>{error}</div>
            ) : matches.length === 0 ? (
                <div style={emptyStyle}>
                    No upcoming matches found for {name}.
                </div>
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