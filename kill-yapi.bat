@echo off
echo 正在查找并终止 YApi 进程...

REM 查找占用 3000 端口的进程
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo 找到进程 ID: %%a
    taskkill /pid %%a /f
    if !errorlevel! equ 0 (
        echo 成功终止进程 %%a
    ) else (
        echo 无法终止进程 %%a，可能需要管理员权限
    )
)

echo 完成！
pause 