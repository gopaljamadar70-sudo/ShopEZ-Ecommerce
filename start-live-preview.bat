@echo off
title ShopEZ Full-Stack Live Preview & Public Tunnel
cd /d C:\ShopEZ
echo ========================================================
echo   ShopEZ Full-Stack Web Application & Public Preview
echo ========================================================
echo Starting backend, frontend and Cloudflare tunnel...
node scripts/serve-live-tunnel.js
pause
