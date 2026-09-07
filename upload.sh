#!/bin/bash

USER=deployer
HOST=zaifo.com.ar
FOLDER="/www/test.sudoku.zaifo.com.ar"

# Check for --prod argument
if [[ "$1" == "--prod" ]]; then
  FOLDER="/www/sudoku.zaifo.com.ar"  # Replace with your production IP
fi

# Ask for confirmation
read -p "Are you sure you want to deploy to $FOLDER? (y/n): " CONFIRM
if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
  echo "Deployment canceled."
  exit 1
fi

echo "Clearing remote folder..."
ssh $USER@$HOST rm -rf $FOLDER/*

echo "Creating static remote folder..."
ssh $USER@$HOST mkdir $FOLDER/static

echo "Creating splash-screens remote folder..."
ssh $USER@$HOST mkdir $FOLDER/splash-screens

echo "Transfering files to remote..."
scp -r build/* $USER@$HOST:$FOLDER
