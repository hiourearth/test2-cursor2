-- ================================
-- 电影评分网站数据库 Schema
-- ================================

-- 创建电影表
CREATE TABLE movies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建用户角色表
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 确保每个 auth_user_id 只能有一条记录
    UNIQUE(auth_user_id)
);

-- 创建评分表
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    movie_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 确保一个用户只能对每部电影评分一次
    UNIQUE(user_id, movie_id)
);

-- ================================
-- 索引
-- ================================

-- 电影表索引
CREATE INDEX idx_movies_title ON movies(title);

-- 用户表索引
CREATE INDEX idx_users_auth_user_id ON public.users(auth_user_id);
CREATE INDEX idx_users_role ON public.users(role);

-- 评分表索引
CREATE INDEX idx_ratings_movie_id ON ratings(movie_id);
CREATE INDEX idx_ratings_user_id ON ratings(user_id);

-- ================================
-- 函数
-- ================================

-- 更新时间戳函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 获取当前用户角色函数
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role 
        FROM public.users 
        WHERE auth_user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 检查当前用户是否为管理员函数
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role() = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 处理新用户注册函数
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (auth_user_id, role)
    VALUES (NEW.id, 'user')
    ON CONFLICT (auth_user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================
-- 触发器
-- ================================

-- 电影表更新时间戳触发器
CREATE TRIGGER update_movies_updated_at
    BEFORE UPDATE ON movies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 评分表更新时间戳触发器
CREATE TRIGGER update_ratings_updated_at
    BEFORE UPDATE ON ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 新用户自动创建资料触发器
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ================================
-- 视图
-- ================================

-- 电影统计视图（包含平均评分和评分人数）
CREATE VIEW movie_stats AS
SELECT 
    m.id,
    m.title,
    m.description,
    m.cover_image_url,
    m.created_at,
    m.updated_at,
    COALESCE(ROUND(AVG(r.rating), 2), 0) as average_rating,
    COUNT(r.rating) as rating_count
FROM movies m
LEFT JOIN ratings r ON m.id = r.movie_id
GROUP BY m.id, m.title, m.description, m.cover_image_url, m.created_at, m.updated_at;

-- 用户资料视图
CREATE VIEW user_profile AS
SELECT 
    u.id,
    u.auth_user_id,
    u.role,
    u.created_at,
    au.email
FROM public.users u
JOIN auth.users au ON u.auth_user_id = au.id;

-- 评分与用户信息视图
CREATE VIEW rating_with_user AS
SELECT 
    r.*,
    up.email as user_email,
    up.role as user_role
FROM ratings r
LEFT JOIN user_profile up ON r.user_id = up.auth_user_id;

-- ================================
-- 行级安全策略 (RLS)
-- ================================

-- 启用所有表的行级安全
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- 电影表权限策略
-- 允许所有用户查看电影
CREATE POLICY "允许所有用户查看电影" ON movies
    FOR SELECT
    USING (true);

-- 只允许管理员创建电影
CREATE POLICY "只允许管理员创建电影" ON movies
    FOR INSERT
    WITH CHECK (is_admin());

-- 只允许管理员更新电影
CREATE POLICY "只允许管理员更新电影" ON movies
    FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

-- 只允许管理员删除电影
CREATE POLICY "只允许管理员删除电影" ON movies
    FOR DELETE
    USING (is_admin());

-- 用户表权限策略
-- 允许已登录用户查看用户信息
CREATE POLICY "允许已登录用户查看用户信息" ON public.users
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- 允许创建和更新用户记录（支持注册时自动创建和用户自己更新）
CREATE POLICY "允许创建和更新用户记录" ON public.users
    FOR ALL
    USING (auth.uid() = auth_user_id OR auth.uid() IS NULL)
    WITH CHECK (auth.uid() = auth_user_id OR auth.uid() IS NULL);

-- 评分表权限策略
-- 允许已登录用户查看所有评分
CREATE POLICY "允许已登录用户查看所有评分" ON ratings
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- 允许已登录用户创建评分
CREATE POLICY "允许已登录用户创建评分" ON ratings
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 只允许用户更新自己的评分
CREATE POLICY "只允许用户更新自己的评分" ON ratings
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 允许用户删除自己的评分，或管理员删除任何评分
CREATE POLICY "允许用户删除自己的评分或管理员删除任何评分" ON ratings
    FOR DELETE
    USING (auth.uid() = user_id OR is_admin());

-- ================================
-- 视图权限设置
-- ================================

-- 设置视图所有者和权限
ALTER VIEW movie_stats OWNER TO postgres;
ALTER VIEW user_profile OWNER TO postgres;
ALTER VIEW rating_with_user OWNER TO postgres;

GRANT SELECT ON movie_stats TO authenticated;
GRANT SELECT ON user_profile TO authenticated;
GRANT SELECT ON rating_with_user TO authenticated;

-- ================================
-- 示例数据
-- ================================

-- 插入示例电影数据
INSERT INTO movies (title, description, cover_image_url) VALUES
('肖申克的救赎', '一个银行家在被判终身监禁后，在监狱中与囚犯们建立友谊，并最终找到救赎的故事。', 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=450&fit=crop'),
('教父', '一个意大利裔美国黑手党家族的史诗故事，展现了权力、家族和忠诚的复杂关系。', 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=450&fit=crop'),
('阿甘正传', '一个智商不高但善良纯真的男子，经历了美国历史上的重要时刻的温暖故事。', 'https://images.unsplash.com/photo-1489599735280-1b527ac3c89c?w=300&h=450&fit=crop'),
('泰坦尼克号', '在豪华游轮泰坦尼克号上，一对来自不同社会阶层的恋人的爱情悲剧。', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop'),
('星际穿越', '在地球面临环境危机时，一群探险家通过虫洞寻找新家园的科幻史诗。', 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=300&h=450&fit=crop');

-- 注意：
-- 1. 用户角色数据会在用户注册时自动创建
-- 2. 要设置管理员用户，需要在用户注册后手动更新：
--    UPDATE public.users SET role = 'admin' WHERE auth_user_id = '用户的UUID';
-- 3. 评分数据会在用户登录后评分时创建 