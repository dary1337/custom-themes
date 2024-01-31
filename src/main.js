// Создаем элемент style для стилей
var styleElement = document.createElement('style');
styleElement.type = 'text/css';

// Загружаем CSS и вставляем его в элемент style
fetch('https://dary1337.github.io/chatgpt-material-ui/main.css')
     .then((response) => response.text())
     .then((cssText) => {
          cssText = cssText.replace(/;/g, ' !important;');

          styleElement.setAttribute('data-extension-priority', 'important');

          styleElement.innerHTML = cssText;

          document.head.insertBefore(styleElement, document.head.firstChild);
     })
     .catch((error) => console.error('Ошибка при загрузке стилей:', error));

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
     if (message.action === 'switchStateChanged') {
          var isChecked = message.checked;

          // Здесь вы можете выполнить действия в зависимости от состояния переключателя
          console.log('Switch State Changed:', isChecked);
     }
});
