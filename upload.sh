#!/bin/bash
folder=server/control/proxy/www/sudoku.zaifo.com.ar
ssh root@us1.zaifo.com.ar "rm -rf ~/${folder}/*"
scp -r build/* "root@us1.zaifo.com.ar:~/${folder}/"