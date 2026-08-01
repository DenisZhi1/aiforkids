# Как загрузить игру на GitHub

Не загружайте исходную папку `GrammarMeteorLab`: в ней находятся десятки тысяч служебных файлов.

Загружайте содержимое этой папки — `GrammarMeteorLab-GitHub`. Здесь только готовая игра и файлы для GitHub Pages.

1. Создайте на GitHub пустой репозиторий.
2. Нажмите **Add file → Upload files**.
3. Откройте папку `C:\Codexprojects\GrammarMeteorLab-GitHub`, выделите всё её содержимое и перетащите в окно загрузки.
4. Нажмите **Commit changes**.
5. Откройте **Settings → Pages** и выберите **GitHub Actions**.

После загрузки workflow **Deploy Galaxy Patrol to GitHub Pages** проверит и опубликует игру автоматически.
