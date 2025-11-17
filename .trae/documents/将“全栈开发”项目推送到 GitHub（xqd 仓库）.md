## 目标
- 把 `d:\徐铭杞\项目目录\全栈开发` 的代码推送到 `https://github.com/xuxutadie/xqd` 的 `main` 分支。

## 预检查
- 远程：`git remote -v` 应为 `git@github.com:xuxutadie/xqd.git` 或 `https://github.com/xuxutadie/xqd.git`
- 分支：`git branch --show-current` 显示 `main`
- 提交：`git status` 若有改动，我会先提交再推送

## 方案 A（推荐，最稳）：使用 HTTPS + PAT 推送
1. 生成 PAT：`GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token`
   - 权限勾选：`repo`
   - 复制令牌
2. 切换远程为 HTTPS：
   - `git remote set-url origin https://github.com/xuxutadie/xqd.git`
3. 推送：
   - `git push -u origin main`
   - 弹出登录时：用户名填 `xuxutadie`，密码粘贴 PAT（令牌）
4. 验证推送成功：打开仓库页面确认最新提交

## 方案 B：使用 SSH（需要无口令密钥并已添加到账户）
1. 生成“无口令”密钥：
   - `ssh-keygen -t ed25519 -C xuxutadie@local-noenc -f %USERPROFILE%\.ssh\id_ed25519_noenc -N ""`
2. 添加账户级公钥：
   - 打开 `https://github.com/settings/keys` → `New SSH key`
   - Title：`local-ed25519-noenc`
   - Key：粘贴 `%USERPROFILE%\.ssh\id_ed25519_noenc.pub` 的整行
3. 设置 SSH 配置（仅选用这把密钥）：
   - 编辑 `%USERPROFILE%\.ssh\config` 为：
     - `Host github.com`
     - `  HostName github.com`
     - `  User git`
     - `  IdentityFile ~/.ssh/id_ed25519_noenc`
     - `  IdentitiesOnly yes`
4. 验证：`ssh -T git@github.com`（期望输出成功认证）
5. 推送：`git push -u origin main`

## 大文件处理（避免推送失败）
- GitHub 单文件大小限制 100MB。项目内有 `public/uploads` 下的 `.mp4/.png/.jpg` 可能超限。
- 两种方式：
  - 直接忽略：在顶层 `.gitignore` 增加 `public/uploads/`，只推代码
  - 使用 Git LFS（需安装）：
    - 安装 Git LFS 后运行：
      - `git lfs install`
      - `git lfs track "*.mp4" "*.png" "*.jpg"`
      - 提交 `.gitattributes`，再推送

## 验证与交付
- 推送完成后，我会：
  - 在仓库页面确认最新提交与分支跟踪
  - 返回提交哈希与链接

## 你的确认
- 选择方案 A（HTTPS+PAT）或方案 B（SSH）。
- 若需要我忽略 `public/uploads` 或配置 Git LFS，请告诉我你的偏好。