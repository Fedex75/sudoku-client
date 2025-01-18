#!/bin/bash
HOST=104.131.184.251
FOLDER="/www/sudoku.zaifo.com.ar"
echo "Clearing remote folder..."
ssh root@$HOST rm -rf $FOLDER/*
echo "Creating static remote folder..."
ssh root@$HOST mkdir $FOLDER/static
echo "Creating splash-screens remote folder..."
ssh root@$HOST mkdir $FOLDER/splash-screens
echo "Transfering files to remote..."
scp -r build/* root@$HOST:$FOLDER
