
(function () {
    typer(
        document.querySelector('#role'),
        ['Volunteer', 'Solution Architect', 'Political Technologist', 'Speaker', 'Entrepreneur', 'Innovator']
    );
})();

function typer($el, messages) {
    let $text = document.createElement('span');
    $el.appendChild($text);
    let $cursor = document.createElement('span');
    $cursor.classList.add('cursor');
    $cursor.classList.add('flashing');
    $cursor.textContent = '|';
    $cursor = $el.appendChild($cursor);

    let displayedText = '';
    let currentText = messages[0];
    let isTyping = false;

    tick();

    function tick() {
        if (!$cursor) return;

        $cursor.classList.remove('flashing');

        const clearedAllText = displayedText.length === 0 && !isTyping;
        const finishedTyping = displayedText.length === currentText.length && isTyping;
        const isAtSpace = isTyping && currentText[displayedText.length] === ' ';

        displayedText = isTyping
            ? currentText.slice(0, displayedText.length + 1)
            : displayedText.slice(0, displayedText.length - 1);

        let timeToWait = isAtSpace ? 250 : (isTyping ? 200 : 100) - Math.random() * 50;


        if (clearedAllText) {
            $cursor.classList.add('flashing');
            isTyping = true;
            timeToWait = 1000;
            currentText = messages[messages.indexOf(currentText) + 1] || messages[0];
        }

        if (finishedTyping) {
            $cursor.classList.add('flashing');
            isTyping = false;
            timeToWait = 3000;
        }

        $text.textContent = displayedText;
        setTimeout(tick, timeToWait);
    }
}
