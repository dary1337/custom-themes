// document.addEventListener('DOMContentLoaded', function () {
//      var switchInput = document.getElementById('chatgpt-amoled');

//      switchInput.addEventListener('change', function () {
//           chrome.runtime.sendMessage({
//                action: 'switchStateChanged',
//                checked: switchInput.checked,
//                id: id,
//           });
//      });
// });
document.addEventListener('DOMContentLoaded', async () => {
     try {
          const response = await fetch(
               'https://raw.githubusercontent.com/dary1337/custom-themes/main/data.json'
          );

          if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

          const data = await response.json();

          for (const theme of data["Author's"]) {
               const label = document.createElement('label');
               label.setAttribute('for', theme.name);

               const switchInput = document.createElement('input');
               switchInput.setAttribute('type', 'checkbox');
               switchInput.setAttribute('id', theme.name);

               const slider = document.createElement('span');
               slider.className = 'slider';

               const switchLabel = document.createTextNode(theme.name);

               label.appendChild(switchInput);
               label.appendChild(slider);
               label.appendChild(switchLabel);

               const switchInputContainer = document.createElement('div');
               switchInputContainer.className = 'switch-input';

               switchInputContainer.appendChild(label);

               document.querySelector('container').appendChild(switchInputContainer);

               switchInput.addEventListener('change', () => {
                    chrome.runtime.sendMessage({
                         action: 'switchStateChanged',
                         checked: switchInput.checked,
                         name: theme.name,
                    });
               });
          }
     } catch (error) {
          console.error('Error fetching or parsing data:', error);
     }
});
