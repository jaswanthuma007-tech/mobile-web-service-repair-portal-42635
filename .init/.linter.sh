#!/bin/bash
cd /home/kavia/workspace/code-generation/mobile-web-service-repair-portal-42635/reactjs_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

