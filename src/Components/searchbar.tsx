import { useState, useEffect, useRef } from 'react';
import { getAllTeams } from '../football';

interface Team {
    id: number;
    name: string;
    shortName: string;
    crest: string | null;
    competition: string;
}

interface SearchBarProps {
    onSelectTeam: (team: Team) => void;
}

export function SearchBar({ onSelectTeam }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [teams, setTeams] = useState<Team[]>([]);
    const [filtered, setFiltered] = useState<Team[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setLoading(true);
        getAllTeams()
            .then((res) => {
                setTeams(res.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (query.trim().length < 2) {
            setFiltered([]);
            setIsOpen(false);
            return;
        }

        const lower = query.toLowerCase();
        const results = teams.filter(
            (t) =>
                t.name.toLowerCase().includes(lower) ||
                t.shortName?.toLowerCase().includes(lower)
        );
        setFiltered(results.slice(0, 8));
        setIsOpen(results.length > 0);
    }, [query, teams]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const containerStyle: React.CSSProperties = {
        position: 'relative',
        width: '100%',
        maxWidth: '400px',
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '10px 16px',
        backgroundColor: '#111111',
        border: '1px solid #333333',
        borderRadius: '10px',
        color: '#ffffff',
        fontFamily: 'Bebas Neue',
        fontSize: '15px',
        outline: 'none',
        boxSizing: 'border-box',
    };

    const dropdownStyle: React.CSSProperties = {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#111111',
        border: '1px solid #1a1a1a',
        borderRadius: '10px',
        marginTop: '4px',
        zIndex: 100,
        overflow: 'hidden',
    };

    const resultRowStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 14px',
        cursor: 'pointer',
        borderBottom: '1px solid #1a1a1a',
        fontFamily: 'Bebas Neue',
    };

    return (
        <div ref={ref} style={containerStyle}>
            <input
                type="text"
                placeholder={loading ? 'Loading teams...' : 'Search teams or competitions...'}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => filtered.length > 0 && setIsOpen(true)}
                style={inputStyle}
                disabled={loading}
            />

            {isOpen && (
                <div style={dropdownStyle}>
                    {filtered.map((team) => (
                        <div
                            key={team.id}
                            style={resultRowStyle}
                            onClick={() => {
                                onSelectTeam(team);
                                setQuery('');
                                setIsOpen(false);
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLDivElement).style.backgroundColor = '#1a1a1a';
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
                            }}
                        >
                            {team.crest && (
                                <img
                                    src={team.crest}
                                    alt={team.name}
                                    style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                                />
                            )}
                            <div>
                                <div style={{ color: '#ffffff', fontSize: '14px' }}>{team.name}</div>
                                <div style={{ color: '#666666', fontSize: '11px' }}>{team.competition}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}