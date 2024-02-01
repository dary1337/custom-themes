document.addEventListener('DOMContentLoaded', async () => {
     try {
          const data = {
               "Author's": [
                    {
                         name: 'Smaller Scrollbar',
                         link: '*',
                         linkText: 'All sites',
                         cssLink: 'https://raw.githubusercontent.com/dary1337/chatgpt-material-ui/master/main.css',
                    },
                    {
                         name: 'Chat-GPT Amoled',
                         link: 'https://chat.openai.com',
                         cssLink: 'https://raw.githubusercontent.com/dary1337/chatgpt-material-ui/master/main.css',
                    },
                    {
                         name: 'Material GPT',
                         link: 'https://chat.openai.com',
                         cssLink: 'https://raw.githubusercontent.com/dary1337/chatgpt-material-ui/master/main.css',
                    },
                    {
                         name: 'Youtube Amoled',
                         link: 'https://www.youtube.com',
                         cssLink: 'https://raw.githubusercontent.com/dary1337/chatgpt-material-ui/master/main.css',
                    },
                    {
                         name: 'Anilibria Amoled',
                         link: 'https://anilibria.tv',
                         cssLink: 'https://raw.githubusercontent.com/dary1337/chatgpt-material-ui/master/main.css',
                    },
               ],
               Community: [],
          };

          const storedSettings = await new Promise((resolve) => {
               chrome.storage.local.get('userSettings', (result) => {
                    resolve(result.userSettings || {});
               });
          });

          const activeTab = "Author's";

          data[activeTab].forEach((theme) => {
               const switchContainerHtml = `
                 <div class="switch-container">
                     <div style="display:flex; flex-direction:column;">
                         <label>${theme.name}</label>
                         ${
                              theme.linkText
                                   ? `<label class="dimmed">${theme.linkText}</label>`
                                   : `<a href="${theme.link}" target="_blank">${theme.link.replace(
                                          /^https?:\/\//,
                                          ''
                                     )}</a>`
                         }

                     </div>
                     <label class="switch-input">
                         <input type="checkbox" id="${theme.name}" ${
                    storedSettings[theme.name]?.checked ? 'checked' : ''
               } />
                         <span class="slider"></span>
                     </label>
                 </div>
             `;

               document
                    .querySelector('container')
                    .insertAdjacentHTML('beforeend', switchContainerHtml);

               const switchInput = document.getElementById(theme.name);
               switchInput.addEventListener('change', () => {
                    storedSettings[theme.name] = { link: theme.link, checked: switchInput.checked };
                    const userSettings = {
                         ...storedSettings,
                         [theme.name]: {
                              link: theme.link,
                              checked: switchInput.checked,
                              cssLink: theme.cssLink,
                         },
                    };
                    chrome.storage.local.set({ userSettings });
               });
          });
     } catch (error) {
          console.error('Error fetching or parsing data:', error);
     }
});
