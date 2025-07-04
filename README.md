# 电影评分网站

一个使用 React + Supabase 开发的简洁电影评分网站，支持用户注册登录、电影浏览、评分管理以及管理员功能。

## 功能特性

### 基础功能
1. **用户认证**：邮箱注册登录（基于 Supabase Auth）
2. **电影浏览**：首页展示电影卡片（标题、简介、评分、封面图）
3. **电影详情**：查看电影详细信息和所有用户评分
4. **评分系统**：登录用户可评分（1-5分），每用户每电影只能评分一次，可修改
5. **统计信息**：显示平均评分和评分人数

### 管理员功能
1. **角色管理**：基于 `public.users` 表的用户角色系统
2. **电影管理**：管理员可添加、编辑、删除电影
3. **评分管理**：管理员可删除任何用户的评分
4. **权限控制**：基于 RLS 策略的精细权限控制

## 技术栈

- **前端**：React 18 + TypeScript + Vite + TailwindCSS + React Router
- **后端**：Supabase（PostgreSQL + Auth + RLS）
- **数据库**：PostgreSQL with Row Level Security
- **部署**：支持 Vercel 等平台部署

## 数据库设计

### 核心表
- `movies`：电影信息表
- `ratings`：评分表（用户-电影评分关系）
- `public.users`：用户角色表（扩展 auth.users）

### 视图
- `movie_stats`：电影统计视图（聚合评分信息）
- `user_profile`：用户资料视图（关联认证和角色信息）
- `rating_with_user`：评分用户视图（包含评分者信息）

### 权限策略
- 所有用户可查看电影和评分
- 登录用户可评分
- 用户只能修改自己的评分
- 管理员可管理所有内容

## 项目结构

```
src/
├── components/          # 组件
│   ├── Layout.tsx      # 主布局组件
│   ├── MovieCard.tsx   # 电影卡片组件
│   ├── MovieForm.tsx   # 电影表单组件
│   ├── AdminPanel.tsx  # 管理员面板组件
│   ├── RatingForm.tsx  # 评分表单组件
│   └── LoadingSpinner.tsx
├── pages/              # 页面
│   ├── HomePage.tsx    # 首页
│   ├── LoginPage.tsx   # 登录页
│   └── MovieDetailPage.tsx # 电影详情页
├── hooks/              # 自定义 Hook
│   ├── useAuth.ts      # 认证 Hook
│   └── useUserRole.ts  # 用户角色 Hook
├── lib/
│   └── supabase.ts     # Supabase 客户端配置
├── types/
│   └── supabase.ts     # TypeScript 类型定义
└── App.tsx             # 主应用组件
```

## 开发指南

### 环境要求
- Node.js 18+
- npm 或 yarn

### 本地开发

1. **安装依赖**
```bash
npm install
```

2. **配置 Supabase**
   - 在 `src/lib/supabase.ts` 中配置你的 Supabase 项目信息
   - 运行 `sql/schema.sql` 中的 SQL 语句创建数据库结构

3. **启动开发服务器**
```bash
npm run dev
```

4. **设置管理员用户**
   - 注册一个普通用户账户
   - 在 Supabase Dashboard 中执行以下 SQL：
   ```sql
   UPDATE public.users 
   SET role = 'admin' 
   WHERE auth_user_id = '你的用户UUID';
   ```

### 构建和部署

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 主要依赖

- `@supabase/supabase-js`：Supabase 客户端
- `react-router-dom`：路由管理
- `tailwindcss`：CSS 框架

## 开发注意事项

1. **权限控制**：所有数据库操作都通过 RLS 策略控制权限
2. **类型安全**：使用 Supabase 生成的 TypeScript 类型
3. **错误处理**：完善的错误处理和用户提示
4. **响应式设计**：支持移动端和桌面端

## 部署说明

项目使用 Vite 构建，支持部署到 Vercel、Netlify 等平台。确保在部署前：

1. 正确配置 Supabase 连接信息
2. 运行数据库迁移脚本
3. 设置环境变量（如果使用）

## 许可证

MIT License
