import type { PlayerType } from '@/utils/types';
import { useState } from 'react';

export default function StartGameModal({
    onStartGame,
    onShowRules,
}: {
    onStartGame: (first: PlayerType) => void;
    onShowRules: () => void;
}) {
    const [stage, setStage] = useState<'start' | 'arrow'>('start');
    const [spinning, setSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);

    const spinArrow = () => {
        if (spinning) return;
        setSpinning(true);

        const res = Math.random() < 0.5 ? 'player' : 'computer';
        const targetAngle = res === 'player' ? 180 : 0;
        const extraSpins = 3 * 360;
        const finalAngle = extraSpins + targetAngle;

        setRotation(finalAngle);

        setTimeout(() => {
            setSpinning(false);
            onStartGame(res);
        }, 4000);
    };

    return (
        <>
            {stage === 'start' && (
                <>
                    <h2 className="text-3xl font-bold leading-tight">
                        Добро пожаловать в игру
                        <br />
                        <span className="highlight animate-gradient">
                            Стенка на стенку
                        </span>
                    </h2>

                    <div className="flex gap-4 justify-center flex-col">
                        <button
                            onClick={() => {
                                setStage('arrow');
                                setTimeout(() => spinArrow(), 10);
                            }}
                            className="btn-primary"
                        >
                            Играть
                        </button>

                        <button onClick={onShowRules} className="btn-primary">
                            Правила
                        </button>
                    </div>
                </>
            )}

            {stage === 'arrow' && (
                <div className="bg-amber-200 relative flex justify-center aspect-square rounded-full w-60 p-6">
                    <div
                        className={`transition-transform duration-[4000ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${
                            spinning ? 'spinning' : ''
                        }`}
                        style={{
                            transform: `rotate(${rotation}deg)`,
                        }}
                    >
                        <div
                            className="w-18 h-24 bg-gradient-to-b from-purple-500 via-pink-500 to-orange-500 clip-polygon"
                            style={{
                                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                            }}
                        />
                        <div
                            className="w-18 h-18 bg-black clip-polygon rotate-180"
                            style={{
                                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                            }}
                        />
                    </div>

                    <div className="w-2.5 h-2.5 bg-white rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-sm" />
                </div>
            )}
        </>
    );
}
