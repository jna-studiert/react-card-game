import type { PlayerType } from '@/utils/types';

export default function GameResultModal({ winner }: { winner: PlayerType }) {
    const isWin = winner === 'player';
    return (
        <>
            <div className="animate-bounce text-3xl cursor-default">
                {isWin ? '🏆' : '💀'}
            </div>

            <>
                <h2
                    className={`text-2xl ${
                        isWin
                            ? 'highlight animate-gradient text-semibold'
                            : 'text-red-800'
                    }`}
                >
                    {isWin ? 'Победа!' : 'Поражение...'}
                </h2>

                <p className="result-text">
                    {isWin
                        ? 'Ты оказался сильнее. Стенка устояла!'
                        : 'Сегодня удача была не на твоей стороне...'}
                </p>
            </>

            <button className="btn-primary">Продолжить</button>
        </>
    );
}
