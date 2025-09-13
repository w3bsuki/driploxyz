@echo off
for /f "tokens=1,2,3,4,5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
    echo Killing process on port 5173: %%e
    taskkill /F /PID %%e 2>nul
)
for /f "tokens=1,2,3,4,5" %%a in ('netstat -ano ^| findstr :5174 ^| findstr LISTENING') do (
    echo Killing process on port 5174: %%e
    taskkill /F /PID %%e 2>nul
)
for /f "tokens=1,2,3,4,5" %%a in ('netstat -ano ^| findstr :5175 ^| findstr LISTENING') do (
    echo Killing process on port 5175: %%e
    taskkill /F /PID %%e 2>nul
)
for /f "tokens=1,2,3,4,5" %%a in ('netstat -ano ^| findstr :5176 ^| findstr LISTENING') do (
    echo Killing process on port 5176: %%e
    taskkill /F /PID %%e 2>nul
)
for /f "tokens=1,2,3,4,5" %%a in ('netstat -ano ^| findstr :5177 ^| findstr LISTENING') do (
    echo Killing process on port 5177: %%e
    taskkill /F /PID %%e 2>nul
)
for /f "tokens=1,2,3,4,5" %%a in ('netstat -ano ^| findstr :5178 ^| findstr LISTENING') do (
    echo Killing process on port 5178: %%e
    taskkill /F /PID %%e 2>nul
)