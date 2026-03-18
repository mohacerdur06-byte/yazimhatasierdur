$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
Write-Host "Git yolu guncellendi. Repo baslatiliyor..."
git init
git branch -M main
git remote remove origin 2>$null
git remote add origin https://github.com/mohacerdur06-byte/yazimhatasi.git
git config user.name "Yazim Hatasi Developer"
git config user.email "dev@yazimhatasi.app"
git add .
git commit -m "Full Stack Quiz App with Supabase Auth, Leaderboard, and Gamification"
Write-Host "GitHub'a pushlaniyor... (Ekranda popup acilabilir, lutfen giris yapin)"
git push -u origin main
