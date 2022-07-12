#!/bin/bash
FOLDER="~/server/control/proxy/www/sudoku.zaifo.com.ar"
ssh root@production rm -rf $FOLDER/*
ssh root@production mkdir $FOLDER/static
scp -r build/* root@production:$FOLDER
