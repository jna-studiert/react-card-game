import { createDeck } from '@/utils/functions';
import {
    type SlotType,
    type AnimatedCardType,
    type GameModalMode,
    type PlayerType,
    MAX_POINTS,
} from '@/utils/types';

export type GamePhase =
    | 'dealing'
    | 'draw'
    | 'redraw'
    | 'attack'
    | 'end'
    | 'gameOver';

interface GameState {
    computerDeck: number[];
    playerDeck: number[];
    playerAnimatedCards: AnimatedCardType[];
    computerAnimatedCards: AnimatedCardType[];
    playerDrawnCard: number | null;
    computerDrawnCard: number | null;
    computerDefenseSlots: SlotType[];
    playerDefenseSlots: SlotType[];
    slotsCanBeAttacked: SlotType[];
    playerDiscardDeck: number[];
    computerDiscardDeck: number[];
    attackingCardsInSlots: SlotType[];
    modalMode: GameModalMode;
    showEndTurnButton: boolean;
    showDrawCardButton: boolean;
    playerPoints: number;
    computerPoints: number;
    gamePhase: GamePhase;
    winner: PlayerType | null;
    whosTurn: PlayerType | null;
}

export type GameAction =
    | { type: 'START_GAME'; payload: { whosTurn: PlayerType } }
    | {
          type: 'SET_DRAWN_CARD';
          payload: { target: PlayerType; cardValue: number | null };
      }
    | {
          type: 'SET_ANIMATED_CARDS';
          payload: { target: PlayerType; cards: AnimatedCardType[] };
      }
    | {
          type: 'ADD_TO_DECK';
          payload: { target: PlayerType; cards: number[] };
      }
    | {
          type: 'UPDATE_DECK';
          payload: { target: PlayerType; newDeck: number[] };
      }
    | {
          type: 'UPDATE_SLOTS';
          payload: { target: PlayerType; newSlots: SlotType[] };
      }
    | { type: 'SET_SLOTS_CAN_BE_ATTACKED'; payload: SlotType[] }
    | { type: 'SET_ATTACKING_CARDS_IN_SLOTS'; payload: SlotType[] }
    | { type: 'SET_GAME_PHASE'; payload: GamePhase }
    | {
          type: 'SET_BUTTONS_VISIBILITY';
          payload: { draw?: boolean; end?: boolean };
      }
    | {
          type: 'DECREMENT_POINTS';
          payload: { target: PlayerType };
      }
    | {
          type: 'ADD_TO_DISCARD_DECK';
          payload: { target: PlayerType; cards: number[] };
      }
    | {
          type: 'SET_WINNER';
          payload: PlayerType | null;
      }
    | { type: 'SET_MODAL_MODE'; payload: GameModalMode }
    | { type: 'SET_WHOS_TURN'; payload: PlayerType };

export const initialState: GameState = {
    playerDeck: createDeck(5),
    computerDeck: createDeck(5),
    playerDrawnCard: null,
    computerDrawnCard: null,
    playerDefenseSlots: Array(3)
        .fill(0)
        .map((_, i) => ({ id: i + 100, cardValue: null })),
    computerDefenseSlots: Array(3)
        .fill(0)
        .map((_, i) => ({ id: i, cardValue: null })),
    playerDiscardDeck: [],
    computerDiscardDeck: [],
    playerAnimatedCards: [],
    computerAnimatedCards: [],
    attackingCardsInSlots: [],
    slotsCanBeAttacked: [],
    playerPoints: MAX_POINTS,
    computerPoints: MAX_POINTS,
    gamePhase: 'dealing',
    modalMode: 'start' as GameModalMode,
    showEndTurnButton: false,
    showDrawCardButton: false,
    winner: null,
    whosTurn: null,
};

export const gameReducer = (
    state: GameState,
    action: GameAction
): GameState => {
    switch (action.type) {
        case 'START_GAME':
            return {
                ...state,
                modalMode: null,
                gamePhase: 'draw',
                whosTurn:
                    action.payload.whosTurn === 'player'
                        ? 'player'
                        : 'computer',
                showDrawCardButton: action.payload.whosTurn === 'player',
            };

        case 'SET_GAME_PHASE':
            if (state.gamePhase === 'gameOver') return state;

            return {
                ...state,
                gamePhase: action.payload,
            };

        case 'SET_DRAWN_CARD':
            return {
                ...state,
                [`${action.payload.target}DrawnCard`]: action.payload.cardValue,
            } as GameState;

        case 'SET_ANIMATED_CARDS':
            return {
                ...state,
                [`${action.payload.target}AnimatedCards`]: action.payload.cards,
            } as GameState;

        case 'ADD_TO_DECK':
            const deckKey = `${action.payload.target}Deck` as
                | 'playerDeck'
                | 'computerDeck';
            return {
                ...state,
                [deckKey]: [...state[deckKey], ...action.payload.cards],
            } as GameState;

        case 'UPDATE_DECK':
            return {
                ...state,
                [`${action.payload.target}Deck`]: action.payload.newDeck,
            } as GameState;

        case 'UPDATE_SLOTS':
            return {
                ...state,
                [`${action.payload.target}DefenseSlots`]:
                    action.payload.newSlots,
            } as GameState;

        case 'SET_SLOTS_CAN_BE_ATTACKED':
            return {
                ...state,
                slotsCanBeAttacked: action.payload,
            };

        case 'SET_ATTACKING_CARDS_IN_SLOTS':
            return {
                ...state,
                attackingCardsInSlots: action.payload,
            };

        case 'ADD_TO_DISCARD_DECK':
            const discardDeckKey = `${action.payload.target}DiscardDeck` as
                | 'playerDiscardDeck'
                | 'computerDiscardDeck';
            return {
                ...state,
                [discardDeckKey]: [
                    ...state[discardDeckKey],
                    ...action.payload.cards,
                ],
            } as GameState;

        case 'SET_BUTTONS_VISIBILITY':
            return {
                ...state,
                ...(action.payload.draw !== undefined && {
                    showDrawCardButton: action.payload.draw,
                }),
                ...(action.payload.end !== undefined && {
                    showEndTurnButton: action.payload.end,
                }),
            };

        case 'DECREMENT_POINTS': {
            const target = action.payload.target;

            const newPlayerPoints =
                target === 'player'
                    ? state.playerPoints - 1
                    : state.playerPoints;

            const newComputerPoints =
                target === 'computer'
                    ? state.computerPoints - 1
                    : state.computerPoints;

            if (newPlayerPoints <= 0) {
                return {
                    ...state,
                    playerPoints: 0,
                    computerPoints: newComputerPoints,
                    winner: 'computer',
                    gamePhase: 'gameOver',
                    modalMode: 'result',
                };
            }

            if (newComputerPoints <= 0) {
                return {
                    ...state,
                    playerPoints: newPlayerPoints,
                    computerPoints: 0,
                    winner: 'player',
                    gamePhase: 'gameOver',
                    modalMode: 'result',
                };
            }

            return {
                ...state,
                playerPoints: newPlayerPoints,
                computerPoints: newComputerPoints,
            };
        }

        case 'SET_WINNER':
            return {
                ...state,
                winner: action.payload,
                gamePhase: 'gameOver',
                modalMode: 'result',
                showDrawCardButton: false,
                showEndTurnButton: false,
            };

        case 'SET_MODAL_MODE':
            return {
                ...state,
                modalMode: action.payload,
            };

        case 'SET_WHOS_TURN':
            return {
                ...state,
                whosTurn: action.payload,
            };
        default:
            return state;
    }
};
