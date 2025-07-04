import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/supabase'

// 直接配置 Supabase 连接信息（演示项目）
const supabaseUrl = 'https://ltatqfornavxfrstpcyt.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0YXRxZm9ybmF2eGZyc3RwY3l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MzE5MTQsImV4cCI6MjA2NzIwNzkxNH0.wypybs1mDI2TAac61wakahHfiOjZeGl1t7_T4EeDg4U'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey) 