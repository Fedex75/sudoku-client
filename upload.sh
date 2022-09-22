#!/bin/bash
FOLDER="~/server/control/proxy/www/sudoku.zaifo.com.ar"
ssh root@zaifo.com.ar rm -rf $FOLDER/*
ssh root@zaifo.com.ar mkdir $FOLDER/static
ssh root@zaifo.com.ar mkdir $FOLDER/splash-screens
scp -r build/* root@zaifo.com.ar:$FOLDER
