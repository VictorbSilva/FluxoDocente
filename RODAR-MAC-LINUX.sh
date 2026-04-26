#!/bin/sh
cd "$(dirname "$0")" || exit 1
echo "Instalando dependencias..."
npm install || exit 1
echo "Iniciando projeto..."
npm run dev
