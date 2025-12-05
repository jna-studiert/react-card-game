import { useRef, useEffect, useReducer } from 'react';
import type { AnimatedCardType } from '@/utils/types';
import { checkCanAttack, checkMinSlot } from '@/utils/functions';
import { calculateAnimationCoordinates } from '@/utils/animationCalculation';
import { gameReducer, initialState, type GamePhase } from './gameReducer';

export const useGameLogic = () => {
    const [state, dispatch] = useReducer(gameReducer, {
        ...initialState,
    });

    useEffect(() => {
        console.log('КОЛОДА ИГРОКА: ', state.playerDeck);
    }, [state.playerDeck]);
    useEffect(() => {
        console.log('КОЛОДА КОМПА: ', state.computerDeck);
    }, [state.computerDeck]);
    useEffect(() => {
        console.log('КОЛОДА СБРОСА ИГРОКА: ', state.playerDiscardDeck);
    }, [state.playerDiscardDeck]);
    useEffect(() => {
        console.log('КОЛОДА СБРОСА КОМПА: ', state.computerDiscardDeck);
    }, [state.computerDiscardDeck]);

    const computerSlotRefs = useRef<Record<number, HTMLDivElement>>({});
    const computerDeckRef = useRef<HTMLDivElement>(null);
    const computerDrawnCardRef = useRef<HTMLDivElement>(null);
    const computerDiscardDeckRef = useRef<HTMLDivElement>(null);

    const playerSlotRefs = useRef<Record<number, HTMLDivElement>>({});
    const playerDeckRef = useRef<HTMLDivElement>(null);
    const playerDrawnCardRef = useRef<HTMLDivElement>(null);
    const playerDiscardDeckRef = useRef<HTMLDivElement>(null);

    const handleStart = (first: 'player' | 'computer') => {
        dispatch({
            type: 'SET_BUTTONS_VISIBILITY',
            payload: { modal: false },
        });

        dispatch({
            type: 'SET_GAME_PHASE',
            payload:
                first === 'player' ? 'playerTurn_draw' : 'computerTurn_draw',
        });

        dispatch({
            type: 'SET_BUTTONS_VISIBILITY',
            payload: { draw: first === 'player' },
        });
    };

    const dealCards = (target: 'player' | 'computer'): Promise<void> => {
        return new Promise((resolve) => {
            const { deck, slots, slotRefs, deckRef } =
                target === 'player'
                    ? {
                          deck: state.playerDeck,
                          slots: state.playerDefenseSlots,
                          slotRefs: playerSlotRefs.current,
                          deckRef: playerDeckRef.current,
                      }
                    : {
                          deck: state.computerDeck,
                          slots: state.computerDefenseSlots,
                          slotRefs: computerSlotRefs.current,
                          deckRef: computerDeckRef.current,
                      };

            if (!deckRef || Object.keys(slotRefs).length === 0) {
                resolve();
                return;
            }

            const emptySlots = slots.filter((slot) => !slot.cardValue);
            if (!emptySlots.length) {
                resolve();
                return;
            }

            const drawnCards = deck.slice(0, emptySlots.length);
            dispatch({
                type: 'UPDATE_DECK',
                payload: {
                    target,
                    newDeck: deck.slice(emptySlots.length),
                },
            });

            const newAnimatedCards = emptySlots
                .map((slot, i) => {
                    const slotRef = slotRefs[slot.id];
                    if (!slotRef) return null;

                    try {
                        const coordinates = calculateAnimationCoordinates({
                            startRef: deckRef,
                            endRef: slotRef,
                            animationType: 'deal',
                        });

                        return {
                            ...slot,
                            cardValue: drawnCards[i],
                            startPosition: coordinates.startPosition,
                            targetPosition: coordinates.targetPosition,
                            size: coordinates.size,
                            duration: coordinates.duration,
                            animationType: 'deal',
                        } as AnimatedCardType;
                    } catch (error) {
                        console.error(
                            'Error calculating animation coordinates:',
                            error
                        );
                        return null;
                    }
                })
                .filter(Boolean) as AnimatedCardType[];

            if (newAnimatedCards.length === 0) {
                resolve();
                return;
            }

            let completedCount = 0;

            dispatch({
                type: 'SET_ANIMATED_CARDS',
                payload: {
                    target,
                    cards: newAnimatedCards.map((card) => ({
                        ...card,
                        onAnimationEnd: () => {
                            completedCount++;
                            if (completedCount === newAnimatedCards.length) {
                                dispatch({
                                    type: 'UPDATE_SLOTS',
                                    payload: {
                                        target,
                                        newSlots: slots.map((slot) => {
                                            const animatedCard =
                                                newAnimatedCards.find(
                                                    (c) => c.id === slot.id
                                                );
                                            return animatedCard
                                                ? {
                                                      ...slot,
                                                      cardValue:
                                                          animatedCard.cardValue,
                                                  }
                                                : slot;
                                        }),
                                    },
                                });

                                dispatch({
                                    type: 'SET_ANIMATED_CARDS',
                                    payload: { target, cards: [] },
                                });
                                resolve();
                            }
                        },
                    })),
                },
            });
        });
    };

    const drawCard = (target: 'player' | 'computer'): Promise<number> => {
        return new Promise((resolve) => {
            const { deck, deckRef } =
                target === 'player'
                    ? {
                          deck: state.playerDeck,
                          deckRef: playerDeckRef.current,
                      }
                    : {
                          deck: state.computerDeck,
                          deckRef: computerDeckRef.current,
                      };

            if (!deckRef || deck.length === 0) {
                resolve(-1);
                return;
            }

            const [topCard, ...rest] = deck;
            dispatch({
                type: 'UPDATE_DECK',
                payload: { target, newDeck: rest },
            });

            try {
                const coordinates = calculateAnimationCoordinates({
                    startRef: deckRef,
                    target: target,
                    animationType: 'draw',
                });

                const newAnimatedCard: AnimatedCardType = {
                    id: Date.now(),
                    cardValue: topCard,
                    startPosition: coordinates.startPosition,
                    targetPosition: coordinates.targetPosition,
                    size: coordinates.size,
                    duration: coordinates.duration,
                    animationType: 'draw',
                    onAnimationEnd: () => {
                        dispatch({
                            type: 'SET_DRAWN_CARD',
                            payload: { target, cardValue: topCard },
                        });
                        dispatch({
                            type: 'SET_ANIMATED_CARDS',
                            payload: { target, cards: [] },
                        });
                        resolve(topCard);
                    },
                };
                dispatch({
                    type: 'SET_ANIMATED_CARDS',
                    payload: { target, cards: [newAnimatedCard] },
                });
            } catch (error) {
                console.error(
                    'Error calculating animation coordinates:',
                    error
                );
                resolve(-1);
            }
        });
    };

    const handleDrawCard = async (target: 'player' | 'computer') => {
        dispatch({
            type: 'SET_BUTTONS_VISIBILITY',
            payload: { draw: false },
        });

        const { drawnCard, defenseSlots, attackGamePhase } =
            target === 'player'
                ? {
                      drawnCard: await drawCard('player'),
                      defenseSlots: state.computerDefenseSlots,
                      attackGamePhase: 'playerTurn_attack' as GamePhase,
                  }
                : {
                      drawnCard: await drawCard('computer'),
                      defenseSlots: state.playerDefenseSlots,
                      attackGamePhase: 'computerTurn_attack' as GamePhase,
                  };

        const availableDefenseSlots = defenseSlots.filter(
            ({ id: defenseCardId }) =>
                !state.attackingCardsInSlots.some(
                    ({ id: attackingCardId }) =>
                        attackingCardId === defenseCardId
                )
        );

        if (drawnCard === -1) {
            target === 'player'
                ? dispatch({
                      type: 'SET_BUTTONS_VISIBILITY',
                      payload: { end: true },
                  })
                : dispatch({
                      type: 'SET_GAME_PHASE',
                      payload: 'computerTurn_end',
                  });
            return;
        }

        if (checkMinSlot(availableDefenseSlots, drawnCard)) {
            const { drawnCardRef, targetDeckRef } =
                target === 'player'
                    ? {
                          drawnCardRef: playerDrawnCardRef.current,
                          targetDeckRef: playerDeckRef.current,
                      }
                    : {
                          drawnCardRef: computerDrawnCardRef.current,
                          targetDeckRef: computerDeckRef.current,
                      };

            if (!drawnCardRef || !targetDeckRef || drawnCard === null) {
                dispatch({
                    type: 'ADD_TO_DECK',
                    payload: { target, cards: [drawnCard] },
                });
                const redrawPhase: GamePhase =
                    target === 'player'
                        ? 'playerTurn_redraw'
                        : 'computerTurn_redraw';
                dispatch({ type: 'SET_GAME_PHASE', payload: redrawPhase });
                return;
            }

            await new Promise<void>((resolve) => {
                const coordinates = calculateAnimationCoordinates({
                    startRef: drawnCardRef,
                    endRef: targetDeckRef,
                    animationSpeed: 500,
                    animationType: 'deal',
                });

                const returnCard: AnimatedCardType = {
                    id: Date.now(),
                    cardValue: drawnCard,
                    ...coordinates,
                    animationType: 'discard',

                    onAnimationEnd: () => {
                        dispatch({
                            type: 'ADD_TO_DECK',
                            payload: { target, cards: [drawnCard] },
                        });

                        dispatch({
                            type: 'SET_ANIMATED_CARDS',
                            payload: { target, cards: [] },
                        });

                        const redrawPhase: GamePhase =
                            target === 'player'
                                ? 'playerTurn_redraw'
                                : 'computerTurn_redraw';
                        dispatch({
                            type: 'SET_GAME_PHASE',
                            payload: redrawPhase,
                        });

                        resolve();
                    },
                };

                dispatch({
                    type: 'SET_DRAWN_CARD',
                    payload: { target, cardValue: null },
                });

                dispatch({
                    type: 'SET_ANIMATED_CARDS',
                    payload: { target, cards: [returnCard] },
                });
            });

            return;
        }

        const canAttackArray = checkCanAttack(availableDefenseSlots, drawnCard);

        if (!!canAttackArray.length) {
            dispatch({
                type: 'SET_SLOTS_CAN_BE_ATTACKED',
                payload: canAttackArray,
            });
            dispatch({ type: 'SET_GAME_PHASE', payload: attackGamePhase });
        } else {
            target === 'player'
                ? dispatch({
                      type: 'SET_BUTTONS_VISIBILITY',
                      payload: { end: true },
                  })
                : dispatch({
                      type: 'SET_GAME_PHASE',
                      payload: 'computerTurn_end',
                  });
        }
    };

    const handleAttack = (
        target: 'player' | 'computer',
        targetSlotId?: number
    ) => {
        const {
            drawnCard,
            drawnCardRef,
            defenseSlots,
            slotRefs,
            nextDrawPhase,
        } =
            target === 'player'
                ? {
                      drawnCard: state.playerDrawnCard,
                      drawnCardRef: playerDrawnCardRef,
                      defenseSlots: state.computerDefenseSlots,
                      slotRefs: computerSlotRefs,
                      nextDrawPhase: 'playerTurn_draw' as GamePhase,
                  }
                : {
                      drawnCard: state.computerDrawnCard,
                      drawnCardRef: computerDrawnCardRef,
                      defenseSlots: state.playerDefenseSlots,
                      slotRefs: playerSlotRefs,
                      nextDrawPhase: 'computerTurn_draw' as GamePhase,
                  };

        if (
            !drawnCard ||
            !drawnCardRef.current ||
            state.slotsCanBeAttacked.length === 0
        )
            return;

        const targetSlot =
            target === 'player'
                ? defenseSlots.find((s) => s.id === targetSlotId)
                : state.slotsCanBeAttacked.reduce((prev, curr) =>
                      prev.cardValue! > curr.cardValue! ? prev : curr
                  );

        if (!targetSlot || !targetSlot.cardValue) return;

        const attackSlotRef = slotRefs.current[targetSlot.id];
        if (!attackSlotRef) return;

        const attackCard = drawnCard;

        dispatch({ type: 'SET_SLOTS_CAN_BE_ATTACKED', payload: [] });

        dispatch({
            type: 'SET_DRAWN_CARD',
            payload: { target, cardValue: null },
        });

        const attackCoordinates = calculateAnimationCoordinates({
            startRef: drawnCardRef.current,
            endRef: attackSlotRef,
            animationType: 'deal',
        });

        const animatedAttackCard: AnimatedCardType = {
            id: Date.now() + 1,
            cardValue: attackCard,
            ...attackCoordinates,
            animationType: 'attack',
            onAnimationEnd: () => {
                const newAttackingCards = [
                    ...state.attackingCardsInSlots,
                    { id: targetSlot.id, cardValue: attackCard },
                ];
                dispatch({
                    type: 'SET_ATTACKING_CARDS_IN_SLOTS',
                    payload: newAttackingCards,
                });
                dispatch({
                    type: 'SET_ANIMATED_CARDS',
                    payload: { target, cards: [] },
                });

                if (newAttackingCards.length >= defenseSlots.length)
                    target === 'player'
                        ? dispatch({
                              type: 'SET_BUTTONS_VISIBILITY',
                              payload: { end: true },
                          })
                        : dispatch({
                              type: 'SET_GAME_PHASE',
                              payload: 'computerTurn_end',
                          });
                else
                    dispatch({
                        type: 'SET_GAME_PHASE',
                        payload: nextDrawPhase,
                    });
            },
        };
        dispatch({
            type: 'SET_ANIMATED_CARDS',
            payload: { target, cards: [animatedAttackCard] },
        });
    };

    const handlePlayerEndTurn = () => {
        dispatch({
            type: 'SET_BUTTONS_VISIBILITY',
            payload: { end: false },
        });
        dispatch({ type: 'SET_GAME_PHASE', payload: 'playerTurn_end' });
    };

    const handleEndTurn = (target: 'player' | 'computer') => {
        let completedCount = 0;

        const {
            drawnCard,
            drawnCardRef,
            attackerDeckRef,
            defenderDeckRef,
            discardDeckRef,
            defenseSlots,
            slotRefs,
        } =
            target === 'player'
                ? {
                      drawnCard: state.playerDrawnCard,
                      drawnCardRef: playerDrawnCardRef.current,
                      attackerDeckRef: playerDeckRef.current,
                      defenderDeckRef: computerDeckRef.current,
                      discardDeckRef: playerDiscardDeckRef.current,
                      defenseSlots: state.computerDefenseSlots,
                      slotRefs: computerSlotRefs,
                  }
                : {
                      drawnCard: state.computerDrawnCard,
                      drawnCardRef: computerDrawnCardRef.current,
                      attackerDeckRef: computerDeckRef.current,
                      defenderDeckRef: playerDeckRef.current,
                      discardDeckRef: computerDiscardDeckRef.current,
                      defenseSlots: state.playerDefenseSlots,
                      slotRefs: playerSlotRefs,
                  };

        if (state.attackingCardsInSlots.length === defenseSlots.length) {
            dispatch({
                type: 'DECREMENT_POINTS',
                payload: {
                    target: target === 'player' ? 'computer' : 'player',
                },
            });
        }

        const cardsToDiscard: number[] = [];
        const cardsToAttackerDeck: number[] = [];

        let allAnimatedCards: AnimatedCardType[] = [];

        if (drawnCard) {
            if (!state.attackingCardsInSlots.length) {
                dispatch({
                    type: 'DECREMENT_POINTS',
                    payload: {
                        target,
                    },
                });
            }
            const coordinates = calculateAnimationCoordinates({
                startRef: drawnCardRef!,
                endRef: defenderDeckRef!,
                animationType: 'deal',
            });

            const toDefenderCard: AnimatedCardType = {
                id: Date.now(),
                cardValue: drawnCard,
                ...coordinates,
                animationType: 'discard',
                size: coordinates.size,
                duration: coordinates.duration,
            };

            allAnimatedCards.push(toDefenderCard);
            dispatch({
                type: 'SET_DRAWN_CARD',
                payload: { target, cardValue: null },
            });
        }

        const defeatedAnimatedCards: AnimatedCardType[] =
            state.attackingCardsInSlots
                .map((attackingCard) => {
                    const defenseCard = defenseSlots.find(
                        (defense) => defense.id === attackingCard.id
                    );
                    if (!defenseCard) return null;

                    const slotRef = slotRefs.current[defenseCard.id];
                    if (!slotRef) return null;

                    cardsToAttackerDeck.push(defenseCard.cardValue!);

                    const coordinates = calculateAnimationCoordinates({
                        startRef: slotRef,
                        endRef: attackerDeckRef!,
                        animationType: 'deal',
                    });

                    return {
                        id: Date.now() + Math.random(),
                        cardValue: defenseCard.cardValue,
                        ...coordinates,
                        animationType: 'discard',
                    } as AnimatedCardType;
                })
                .filter(Boolean) as AnimatedCardType[];

        allAnimatedCards.push(...defeatedAnimatedCards);

        const attackingAnimatedCards = state.attackingCardsInSlots
            .map((card) => {
                const slotRef = slotRefs.current[card.id];
                if (!slotRef) return null;

                cardsToDiscard.push(card.cardValue!);

                const coordinates = calculateAnimationCoordinates({
                    startRef: slotRef,
                    endRef: discardDeckRef!,
                    animationType: 'deal',
                });

                return {
                    id: Date.now() + Math.random(),
                    cardValue: card.cardValue,
                    ...coordinates,
                    animationType: 'discard',
                } as AnimatedCardType;
            })
            .filter(Boolean) as AnimatedCardType[];

        allAnimatedCards.push(...attackingAnimatedCards);

        const totalAnimations = allAnimatedCards.length;

        if (totalAnimations === 0) {
            if (cardsToDiscard.length > 0 || cardsToAttackerDeck.length > 0) {
                dispatch({
                    type: 'ADD_TO_DISCARD_DECK',
                    payload: { target, cards: cardsToDiscard },
                });
                dispatch({
                    type: 'ADD_TO_DECK',
                    payload: {
                        target,
                        cards: cardsToAttackerDeck,
                    },
                });
            }
            return;
        }

        dispatch({
            type: 'SET_ATTACKING_CARDS_IN_SLOTS',
            payload: [],
        });

        const defeatedSlotIds = state.attackingCardsInSlots.map((c) => c.id);
        dispatch({
            type: 'UPDATE_SLOTS',
            payload: {
                target: target === 'player' ? 'computer' : 'player',
                newSlots: defenseSlots.map((card) => {
                    if (defeatedSlotIds.includes(card.id))
                        card.cardValue = null;
                    return card;
                }),
            },
        });

        const combinedAnimatedCards = allAnimatedCards.map((card) => {
            return {
                ...card,
                onAnimationEnd: () => {
                    completedCount++;

                    if (completedCount === totalAnimations) {
                        if (drawnCard) {
                            dispatch({
                                type: 'ADD_TO_DECK',
                                payload: {
                                    target:
                                        target === 'player'
                                            ? 'computer'
                                            : 'player',
                                    cards: [drawnCard],
                                },
                            });
                        }

                        dispatch({
                            type: 'ADD_TO_DISCARD_DECK',
                            payload: { target, cards: cardsToDiscard },
                        });

                        dispatch({
                            type: 'ADD_TO_DECK',
                            payload: {
                                target,
                                cards: cardsToAttackerDeck,
                            },
                        });
                        dispatch({
                            type: 'SET_ANIMATED_CARDS',
                            payload: { target, cards: [] },
                        });
                        dealCards(
                            target === 'player' ? 'computer' : 'player'
                        ).then(() =>
                            dispatch({
                                type: 'SET_GAME_PHASE',
                                payload:
                                    target === 'player'
                                        ? 'computerTurn_draw'
                                        : 'playerTurn_draw',
                            })
                        );
                    }
                },
            };
        });
        dispatch({
            type: 'SET_ANIMATED_CARDS',
            payload: { target, cards: combinedAnimatedCards },
        });
    };

    useEffect(() => {
        const handleGamePhase = async () => {
            switch (state.gamePhase) {
                case 'dealing':
                    await Promise.all([
                        dealCards('player'),
                        dealCards('computer'),
                    ]);
                    break;
                case 'playerTurn_draw':
                    dispatch({
                        type: 'SET_BUTTONS_VISIBILITY',
                        payload: { draw: true },
                    });
                    break;
                case 'computerTurn_redraw':
                    dispatch({
                        type: 'SET_GAME_PHASE',
                        payload: 'computerTurn_draw',
                    });
                    break;
                case 'playerTurn_redraw':
                    handleDrawCard('player');
                    break;
                case 'playerTurn_end':
                    handleEndTurn('player');
                    break;
                case 'computerTurn_draw':
                    dispatch({
                        type: 'SET_BUTTONS_VISIBILITY',
                        payload: { draw: false },
                    });
                    setTimeout(() => handleDrawCard('computer'), 1000);
                    break;
                case 'computerTurn_attack':
                    setTimeout(() => handleAttack('computer'), 1000);
                    break;
                case 'computerTurn_end':
                    setTimeout(() => handleEndTurn('computer'), 1000);
                    break;
                case 'resolveTurn':
                    break;
            }
        };

        handleGamePhase();
    }, [state.gamePhase]);

    return {
        computerSlotRefs,
        computerDeckRef,
        computerDrawnCardRef,
        computerDiscardDeckRef,
        playerSlotRefs,
        playerDeckRef,
        playerDrawnCardRef,
        playerDiscardDeckRef,
        showModal: state.showModal,
        playerAnimatedCards: state.playerAnimatedCards,
        computerAnimatedCards: state.computerAnimatedCards,
        computerDrawnCard: state.computerDrawnCard,
        playerDrawnCard: state.playerDrawnCard,
        computerDefenseSlots: state.computerDefenseSlots,
        playerDefenseSlots: state.playerDefenseSlots,
        slotsCanBeAttacked: state.slotsCanBeAttacked,
        handleStart,
        handleAttack,
        attackingCardsInSlots: state.attackingCardsInSlots,
        playerDiscardDeck: state.playerDiscardDeck,
        computerDiscardDeck: state.computerDiscardDeck,
        playerDeckLength: state.playerDeck.length,
        computerDeckLength: state.computerDeck.length,
        handleDrawPlayerCard: () => handleDrawCard('player'),
        showEndTurnButton: state.showEndTurnButton,
        handlePlayerEndTurn,
        showDrawCardButton: state.showDrawCardButton,
        playerPoints: state.playerPoints,
        computerPoints: state.computerPoints,
    };
};
