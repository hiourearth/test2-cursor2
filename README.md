我想用 React + Supabase 开发一个简洁的“电影评分网站”，功能包括：

1. 用户使用邮箱注册和登录，采用 Supabase 自带的 Auth 功能（auth.users 表）
2. 首页展示所有电影的卡片信息（标题、简介、评分、封面图）
3. 用户点击卡片可以进入电影详情页，查看电影信息和所有评分
4. 登录用户可以对每部电影打分（1 到 5 分），一个用户只能评分一次，可以修改
5. 每部电影展示平均评分和评分人数
6. 使用 Supabase 的 Postgres 数据库，仅需要设计两张表：movies 和 ratings
7. 使用 Supabase MCP 工具生成数据库结构、RLS 权限策略以及类型定义，确保不同用户只能访问和修改自己的评分
8. 前端使用 Vite + React，样式使用 TailwindCSS
9. Supabase 项目配置通过 `.env.local` 文件设置 SUPABASE_URL 和 SUPABASE_ANON_KEY
10. 请将前端组件尽量模块化，功能清晰，结构合理，方便维护和扩展

请帮我生成整个项目的前端代码结构，包括登录页、电影列表页、电影详情页、评分提交组件，并连接 Supabase。数据库部分请使用 MCP 创建 movies 和 ratings 表并生成 RLS 策略，确保用户只能评分一次，且只能修改自己的评分。
