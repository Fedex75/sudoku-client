#!/bin/bash
folder=server/control/proxy/www/sudoku.zaifo.com.ar
ssh root@production "rm -rf ~/${folder}/*"
scp -r build/* "root@production:~/${folder}/"
