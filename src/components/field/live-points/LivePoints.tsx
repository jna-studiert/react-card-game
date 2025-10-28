// import { useState, useEffect } from 'react';
// import './styles.css';

// export default function LivePoints({
//     lives = 3,
//     maxLives = 5,
//     target,
// }: {
//     maxLives: number;
//     lives: number;
//     target: 'player' | 'computer';
// }) {
//     const color =
//         target === 'player'
//             ? ({
//                   '--primary-color': '#f97316',
//               } as React.CSSProperties)
//             : ({
//                   '--primary-color': '#8b5cf6',
//               } as React.CSSProperties);

//     const [poppingIndex, setPoppingIndex] = useState<number | null>(null);
//     const [previousLives, setPreviousLives] = useState(lives);

//     useEffect(() => {
//         if (lives < previousLives) {
//             setPoppingIndex(lives - 1);
//             setPreviousLives(lives);
//         }
//     }, [lives]);

//     return (
//         <div className="flex flex-col items-center gap-4 justify-between">
//             {Array.from({ length: maxLives }).map((_, index) => (
//                 <div key={index} className="empty-slot">
//                     {index < lives && (
//                         <div
//                             className={`crystal ${
//                                 poppingIndex !== null && index <= poppingIndex
//                                     ? 'popping'
//                                     : ''
//                             }`}
//                             style={color}
//                         >
//                             <div className="crystal-shine" />
//                             {poppingIndex === index && (
//                                 <>
//                                     <div className="crystal-particle particle-1" />
//                                     <div className="crystal-particle particle-2" />
//                                     <div className="crystal-particle particle-3" />
//                                     <div className="crystal-particle particle-4" />
//                                 </>
//                             )}
//                         </div>
//                     )}
//                 </div>
//             ))}
//         </div>
//     );
// }

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
                  '--primary-color': '#f97316',
                  '--light-color': '#ffcd28',
                  '--dark-color': '#c2410c',
              } as React.CSSProperties)
            : ({
                  '--primary-color': '#8b5cf6',
                  '--light-color': '#c4b5fd',
                  '--dark-color': '#7c3aed',
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
                        className={`crystal ${isActive ? 'active' : 'lost'} ${
                            isPopping ? 'popping' : ''
                        } ${
                            index < lives
                                ? 'hover:scale-110 hover:rotate-3'
                                : ''
                        } transition-all duration-300`}
                        onAnimationEnd={() => handleAnimationEnd(index)}
                    >
                        <div className="crystal-inner">
                            <div className="crystal-shine"></div>
                        </div>
                        {poppingIndex === index && (
                            <>
                                <div className="crystal-particle particle-1"></div>
                                <div className="crystal-particle particle-2"></div>
                                <div className="crystal-particle particle-3"></div>
                                <div className="crystal-particle particle-4"></div>
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
