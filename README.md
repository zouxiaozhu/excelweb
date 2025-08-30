# Excel Web 管理系统

一个基于 Vue 3 + TypeScript + Element Plus 的 Excel 文件处理 Web 应用。

## 功能特性

### 🚀 核心功能
- **表格快查**: 快速上传Excel文件，智能解析表格内容，支持数据预览和详细查看
- **Excel转Word**: 将Excel文件批量转换为Word文档，支持自定义模板和格式设置

### 🔐 登录系统
- **体验账号登录**: 无需注册，直接使用系统提供的体验账号快速体验功能
- **用户账号登录**: 使用自己的账号登录，享受完整的个人数据管理
- **智能登录选择**: 未登录用户点击功能时，提供体验账号和正常登录两个选项

### ⚠️ 体验账号提醒
- 体验账号数据仅用于测试
- 使用完毕后请及时删除测试数据
- 建议不要使用真实数据进行测试

## 技术栈

- **前端框架**: Vue 3 + TypeScript
- **UI组件库**: Element Plus
- **状态管理**: Pinia
- **路由管理**: Vue Router 4
- **构建工具**: Vite
- **HTTP客户端**: Axios

## 快速开始

### 安装依赖
```bash
npm install
```

### 开发环境运行
```bash
npm run dev
```

### 生产环境构建
```bash
npm run build
```

### 代码检查
```bash
npm run lint
```

### 代码格式化
```bash
npm run format
```

## 项目结构

```
src/
├── components/          # 公共组件
│   ├── AuthModal.vue           # 登录注册弹框
│   ├── LoginChoiceDialog.vue   # 登录选择对话框
│   ├── FileUpload.vue          # 文件上传组件
│   └── ...
├── pages/              # 页面组件
│   ├── Home.vue               # 首页
│   ├── ExcelQuery.vue         # 表格快查
│   ├── ExcelToWord.vue        # Excel转Word
│   └── UserProfile.vue        # 用户资料
├── services/           # API服务
│   ├── api.ts                 # 通用API
│   ├── authApi.ts             # 认证API
│   └── request.ts             # 请求配置
├── store/              # 状态管理
│   └── index.ts               # 全局状态
├── router/             # 路由配置
│   └── index.ts               # 路由定义
├── utils/              # 工具函数
│   ├── env.ts                 # 环境配置
│   └── index.ts               # 通用工具
└── typings/            # 类型定义
    ├── api.ts                 # API类型
    └── components.ts          # 组件类型
```

## 登录流程

### 体验账号登录
1. 未登录用户点击功能时，系统显示登录选择对话框
2. 选择"体验账号登录"
3. 系统自动使用体验账号登录（无需输入用户名密码）
4. 登录成功后显示体验账号提醒

### 用户账号登录
1. 未登录用户点击功能时，系统显示登录选择对话框
2. 选择"使用自己的账号"
3. 系统显示登录注册弹框
4. 用户可以登录现有账号或注册新账号

## 环境配置

项目使用 Vite 环境变量配置，主要配置项：

- `VITE_API_BASE_URL`: API基础地址（默认: http://localhost:8080）
- `VITE_API_TIMEOUT`: API请求超时时间（默认: 10000ms）
- `VITE_APP_TITLE`: 应用标题（默认: Excel Web）
- `VITE_APP_VERSION`: 应用版本（默认: 1.0.0）

### 环境变量设置

1. **开发环境**: 创建 `.env.development` 文件
2. **生产环境**: 创建 `.env.production` 文件
3. **参考配置**: 查看 `env.example` 文件

#### 示例配置
```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8080
VITE_API_TIMEOUT=10000

# .env.production  
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_API_TIMEOUT=15000
```

### 开发环境代理

在开发环境中，API请求会通过 Vite 代理转发：
- 请求路径: `/api/*` 
- 代理目标: `VITE_API_BASE_URL`
- 自动去除 `/api` 前缀

## 开发说明

### 新增功能
- 实现了体验账号登录功能
- 添加了登录选择对话框组件
- 在未登录状态下，点击功能会显示登录选择选项
- 体验账号登录后会在页面显示提醒信息

### 代码规范
- 使用 TypeScript 进行类型检查
- 遵循 ESLint 代码规范
- 使用 Prettier 进行代码格式化

## 许可证

MIT License
