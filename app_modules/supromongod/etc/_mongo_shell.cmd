@echo off
set CYGWIN=nodosfilewarning
set JSAPPSTART=console
rem current working directory must be set up by shortcut or by manual running from here
..\..\..\nodenwer\bin\sh.exe /etc/init.d/mongodb+.sh ./*app.conf mongo
pause
exit