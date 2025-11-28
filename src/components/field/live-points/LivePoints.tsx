import { useEffect, useState } from 'react';
import './styles.css';

export default function LivePoints({
    lives = 3,
    maxLives = 5,
    target,
}: {
    maxLives: number;
    lives: number;
    target?: 'player' | 'computer';
}) {
    const color =
        target === 'player'
            ? ({
                  '--primary-color': '249, 115, 22',
                  '--light-color': '255, 205, 40',
                  '--dark-color': '194, 65, 12',
              } as React.CSSProperties)
            : ({
                  '--primary-color': '139, 92, 246',
                  '--light-color': '196, 181, 253',
                  '--dark-color': '124, 58, 237',
              } as React.CSSProperties);

    const [poppingIndex, setPoppingIndex] = useState<number | null>(null);
    const [displayedLives, setDisplayedLives] = useState(lives);

    useEffect(() => {
        if (lives < displayedLives) {
            setPoppingIndex(lives);
        }
    }, [lives]);

    const handleAnimationEnd = (index: number) => {
        if (index === poppingIndex) {
            setDisplayedLives(lives);
            setPoppingIndex(null);
        }
    };

    return (
        <div className="flex flex-col-reverse items-center gap-4 h-full justify-between">
            {Array.from({ length: maxLives }).map((_, index) => {
                const isPopping = poppingIndex === index;
                const isActive =
                    index < displayedLives || (isPopping && index < lives + 1);
                return (
                    <div
                        key={index}
                        style={color}
                        className={`crystal-container ${
                            isActive ? 'glow' : ''
                        } ${isPopping ? 'glow-pop' : ''}`}
                    >
                        <div className="empty-slot polygon" />
                        {isActive && (
                            <div
                                className={`crystal polygon ${
                                    isPopping ? 'popping' : ''
                                }`}
                                onAnimationEnd={() => handleAnimationEnd(index)}
                            >
                                <div className="crystal-shine polygon" />
                            </div>
                        )}
                        {poppingIndex === index && (
                            <>
                                <div className="crystal-particle particle-1" />
                                <div className="crystal-particle particle-2" />
                                <div className="crystal-particle particle-3" />
                                <div className="crystal-particle particle-4" />
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
