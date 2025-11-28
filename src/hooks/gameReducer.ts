import { createDeck } from '@/utils/functions';
import type { SlotType, AnimatedCardType } from '@/utils/types';

export type GamePhase =
    | 'dealing'
    | 'playerTurn_draw'
    | 'playerTurn_redraw'
    | 'playerTurn_attack'
    | 'playerTurn_end'
    | 'computerTurn_draw'
    | 'computerTurn_redraw'
    | 'computerTurn_attack'
    | 'computerTurn_end'
    | 'resolveTurn'
    | 'gameOver';

export const MAX_POINTS = 5;

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
    showModal: boolean;
    showEndTurnButton: boolean;
    showDrawCardButton: boolean;
    playerPoints: number;
    computerPoints: number;
    gamePhase: GamePhase;
}

type GameAction =
    | { type: 'START_GAME'; payload: { first: 'player' | 'computer' } }
    | {
          type: 'SET_DRAWN_CARD';
          payload: { target: 'player' | 'computer'; cardValue: number | null };
      }
    | {
          type: 'SET_ANIMATED_CARDS';
          payload: { target: 'player' | 'computer'; cards: AnimatedCardType[] };
      }
    | {
          type: 'ADD_TO_DECK';
          payload: { target: 'player' | 'computer'; cards: number[] };
      }
    | {
          type: 'UPDATE_DECK';
          payload: { target: 'player' | 'computer'; newDeck: number[] };
      }
    | {
          type: 'UPDATE_SLOTS';
          payload: { target: 'player' | 'computer'; newSlots: SlotType[] };
      }
    | { type: 'SET_SLOTS_CAN_BE_ATTACKED'; payload: SlotType[] }
    | { type: 'SET_ATTACKING_CARDS_IN_SLOTS'; payload: SlotType[] }
    | { type: 'SET_GAME_PHASE'; payload: GamePhase }
    | {
          type: 'SET_BUTTONS_VISIBILITY';
          payload: { draw?: boolean; end?: boolean; modal?: boolean };
      }
    | {
          type: 'DECREMENT_POINTS';
          payload: { target: 'player' | 'computer' };
      }
    | {
          type: 'ADD_TO_DISCARD_DECK';
          payload: { target: 'player' | 'computer'; cards: number[] };
      };

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
    showModal: true,
    showEndTurnButton: false,
    showDrawCardButton: false,
};

export const gameReducer = (
    state: GameState,
    action: GameAction
): GameState => {
    switch (action.type) {
        case 'START_GAME':
            return {
                ...state,
                showModal: false,
                gamePhase:
                    action.payload.first === 'player'
                        ? 'playerTurn_draw'
                        : 'computerTurn_draw',
                showDrawCardButton: action.payload.first === 'player',
            };

        case 'SET_GAME_PHASE':
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
                ...(action.payload.modal !== undefined && {
                    showModal: action.payload.modal,
                }),
            };

        case 'DECREMENT_POINTS':
            const pointsKey = `${action.payload.target}Points` as
                | 'playerPoints'
                | 'computerPoints';
            return {
                ...state,
                [pointsKey]: state[pointsKey] - 1,
            } as GameState;

        default:
            return state;
    }
};
