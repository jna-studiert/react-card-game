import GameRulesModal from './GameRulesModal';
import StartGameModal from './StartGameModal';
import type { GameModalMode, PlayerType } from '@/utils/types';
import GameResultModal from './GameResultModal';

export default function GameModal({
    mode,
    onStartGame,
    onChangeMode,
    winner,
}: {
    mode: GameModalMode;
    onStartGame: (first: PlayerType) => void;
    onChangeMode: (mode: GameModalMode) => void;
    winner: PlayerType | null;
}) {
    return (
        <div className="absolute inset-0 bg-black/70 flex justify-center items-center z-[1000]">
            <div className="bg-white rounded-2xl p-8 flex flex-col gap-6 items-center text-center w-130">
                {mode === 'start' && (
                    <StartGameModal
                        onStartGame={onStartGame}
                        onShowRules={() => onChangeMode('rules')}
                    />
                )}
                {mode === 'rules' && (
                    <GameRulesModal onBack={() => onChangeMode('start')} />
                )}

                {mode === 'result' && !!winner && (
                    <GameResultModal winner={winner} />
                )}
            </div>
        </div>
    );
}
