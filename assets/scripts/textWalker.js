// Перенос висячих слов
document.addEventListener('DOMContentLoaded', function () {
    // 1. Находим все текстовые элементы, которые нужно обработать
    const textElements = document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, li, dt, dd, a, label');
    
    // 2. Список предлогов и союзов, которые нельзя переносить
    const prepositions = ['в', 'без', 'до', 'из', 'к', 'на', 'по', 'о', 'от', 'перед', 'при', 'через', 'для', 'с', 'у', 'и', 'а', 'но', 'да', 'или', 'либо', 'что', 'чтобы', 'как', 'когда', 'если', 'вы', 'за'];
    
    // 3. Функция для обработки каждого элемента
    textElements.forEach(element => {
        // Получаем все текстовые узлы внутри элемента
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        const textNodes = [];
        while (walker.nextNode()) {
            textNodes.push(walker.currentNode);
        }
        
        // Обрабатываем каждый текстовый узел
        textNodes.forEach(textNode => {
            let text = textNode.nodeValue;
            
            // Заменяем пробелы после коротких слов на неразрывные пробелы
            text = text.replace(/(^|\s)([а-яё]{1,2})\s/gi, (match, prefix, word) => {
                // Проверяем, есть ли слово в списке предлогов
                if (prepositions.includes(word.toLowerCase())) {
                    return prefix + word + '\u00A0'; // \u00A0 - это неразрывный пробел
                }
                return match;
            });
            
            // Обновляем содержимое текстового узла
            textNode.nodeValue = text;
        });
    });
});