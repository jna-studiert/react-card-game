import { useState } from 'react';

const rulesData = [
    {
        title: '<hl>Основы игры</hl>',
        content: `<p>В игре участвуют два игрока. У каждого есть 5 жизней и колода из 20 карт ранга от 1 до 5 — по четыре карты каждого ранга.</p><p>Перед началом игры колоды перемешиваются, и каждый игрок достаёт три карты и выкладывает их на стол рубашкой вниз — это его <hl>защита</hl>.</p>`,
    },
    {
        title: '<hl>Определение хода</hl>',
        content: `<p>Перед началом игры жребий определяет, кто ходит первым.</p><p>Игрок, начинающий ход, считается <hl>атакующим</hl>, другой игрок — <hl>защищающимся</hl>.</p>`,
    },
    {
        title: '<hl>Ход игрока</hl>',
        content: `<p>Атакующий достаёт верхнюю карту из своей колоды и сравнивает её ранг с картами защиты оппонента. Он может побить любую карту защиты с меньшим рангом.</p><p>Ход продолжается, пока у защиты остаются непобитые карты или пока атакующий не встретит карту, которую не может побить.</p>`,
    },
    {
        title: '<hl>Завершение хода</hl>',
        content: `<p>После окончания хода:
- Атакующий забирает все побитые карты защиты.
- Защищающийся получает карту атакующего, которая не смогла пробить защиту (если атака была неудачной).
- Полученные карты добавляются в конец колоды.
- Если атакующий не смог побить на своём ходу ни одной карты противника, то он теряет жизнь.
- Если защита была полностью пробита, защищающийся теряет одну свою жизнь.</p>`,
    },
    {
        title: '<hl>Восстановление защиты</hl>',
        content: `<p>Перед каждым новым ходом оба игрока восстанавливают свои три карты защиты, доставая недостающие карты из своей колоды.</p>`,
    },
    {
        title: '<hl>Смена ролей</hl>',
        content: `<p>После каждого хода игроки меняются ролями: атакующий становится защищающимся, и наоборот.</p>`,
    },
    {
        title: '<hl>Условия проигрыша</hl>',
        content: `<p>Игрок проигрывает, если теряет все свои жизни.</p>`,
    },
    {
        title: '<hl>Правила боя карт</hl>',
        content: `<p>Бой карт происходит сравнением их рангов:
- Карта с более высоким рангом побеждает карту с меньшим.
- Исключение: карту ранга 5 может побить только карта ранга 1.
- При равных рангах атакующий возвращает свою карту в колоду и достаёт следующую.</p>`,
    },
];

export default function GameRulesModal({ onBack }: { onBack: () => void }) {
    const [page, setPage] = useState(0);
    const total = rulesData.length;

    const nextPage = () => setPage((p) => Math.min(p + 1, total - 1));
    const prevPage = () => setPage((p) => Math.max(p - 1, 0));

    const html = (text: string) =>
        text
            .replace(/\n/g, '<br/>')
            .replace(
                /<hl>(.*?)<\/hl>/g,
                '<span class="highlight animate-gradient">$1</span>'
            );

    return (
        <>
            <div className="w-full">
                <h2
                    dangerouslySetInnerHTML={{
                        __html: html(rulesData[page].title),
                    }}
                    className="text-2xl mb-5"
                />
                <div
                    dangerouslySetInnerHTML={{
                        __html: html(rulesData[page].content),
                    }}
                    className="indent-12 text-left"
                />
            </div>
            <div className="w-full flex justify-between items-center">
                {page !== 0 && (
                    <button className="btn-primary" onClick={prevPage}>
                        ← Назад
                    </button>
                )}
                <button className="btn-primary" onClick={onBack}>
                    Вернуться в меню
                </button>
                {page !== total - 1 && (
                    <button className="btn-primary" onClick={nextPage}>
                        Вперёд →
                    </button>
                )}
            </div>
        </>
    );
}
