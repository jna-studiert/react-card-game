export default function GameRulePage({
    title,
    content,
}: {
    title: string;
    content: string;
}) {
    const html = (text: string) =>
        text
            .replace(/\n/g, '<br/>')
            .replace(
                /<hl>(.*?)<\/hl>/g,
                '<span class="highlight animate-gradient">$1</span>'
            );

    return (
        <div className="rule-page">
            <h2
                dangerouslySetInnerHTML={{ __html: html(title) }}
                className="text-2xl"
            />
            <p dangerouslySetInnerHTML={{ __html: html(content) }} />
        </div>
    );
}
