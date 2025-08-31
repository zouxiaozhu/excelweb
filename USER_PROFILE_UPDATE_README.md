# 用户资料更新功能实现

## 概述

本功能实现了用户资料更新API `/system/user/update`，支持更新用户的个人信息包括用户名、昵称、邮箱、手机号、个人简介和头像。

## API 接口

### 更新用户资料

**接口地址:** `POST /system/user/update`

**请求参数:**
```json
{
  "username": "string",
  "nickName": "string", 
  "email": "string",
  "phone": "string",
  "bio": "string",
  "avatar": "string"
}
```

**参数说明:**
- `username`: 用户名（必填）
- `nickName`: 昵称（必填）
- `email`: 邮箱地址（必填）
- `phone`: 手机号码（可选）
- `bio`: 个人简介（可选）
- `avatar`: 头像URL（可选）

**响应格式:**
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "userId": 1,
    "userName": "testuser",
    "nickName": "测试用户",
    "email": "test@example.com",
    "mobile": "13800138000",
    "phone": "13800138000",
    "bio": "这是一个测试用户的个人简介",
    "loginTime": "2024-01-01 12:00:00",
    "avatar": "https://example.com/avatar.jpg"
  }
}
```

## 前端实现

### 1. API 服务层 (`src/services/authApi.ts`)

更新了 `UpdateUserProfileRequest` 接口和 `UserInfoDto` 接口：

```typescript
export interface UpdateUserProfileRequest {
    username: string
    nickName: string
    email: string
    phone: string
    bio: string
    avatar: string
}

export interface UserInfoDto {
    userId: number
    userName: string
    nickName: string
    email: string
    mobile: string
    phone: string
    bio: string
    loginTime: string
    avatar: string
}
```

### 2. 状态管理 (`src/store/index.ts`)

更新了 `UserInfo` 接口，添加了新字段：

```typescript
interface UserInfo {
    id: string
    username: string
    email: string
    nickName?: string
    mobile?: string
    phone?: string
    bio?: string
    avatar?: string
}
```

### 3. 用户资料页面 (`src/pages/UserProfile.vue`)

更新了表单字段和验证规则：

- 添加了手机号字段（`phone`）
- 添加了个人简介字段（`bio`）
- 更新了表单验证规则
- 更新了API调用参数
- **头像上传功能**: 使用 `fileApi.upload(file, 'USER_AVATAR')` 接口上传头像

## 使用说明

### 1. 访问用户资料页面

用户可以通过以下方式访问个人资料页面：
- 在应用中点击用户头像或用户名
- 直接访问 `/user-profile` 路由

### 2. 编辑个人信息

在用户资料页面，用户可以：
- 修改昵称（必填，2-20位字符）
- 修改邮箱地址（必填，需符合邮箱格式）
- 修改手机号码（可选，需符合手机号格式）
- 添加或修改个人简介（可选，最多200字）
- 更换头像（支持JPG、PNG格式，文件大小不超过2MB）

### 3. 头像上传

点击"更换头像"按钮后：
- 选择JPG或PNG格式的图片文件
- 系统验证文件类型和大小（不超过2MB）
- 调用 `/file/upload` API，使用 `USER_AVATAR` 作为businessType
- 上传成功后立即显示新头像
- 头像URL会保存到表单中，点击"保存修改"后同步到服务器

### 4. 保存修改

点击"保存修改"按钮后：
- 系统会验证表单数据
- 调用 `/system/user/update` API
- 更新成功后同步更新本地状态
- 显示成功提示信息

## 测试

### 1. 使用测试页面

项目根目录下提供了多个测试文件：

```bash
# 用户资料更新API测试
open test-user-profile-update.html

# 头像上传功能测试
open test-avatar-upload.html

# 文件访问URL测试
open test-file-access.html
```

### 2. 头像显示调试

如果头像上传成功但显示不出来，可以使用以下方法调试：

1. **查看控制台日志**: 打开浏览器开发者工具，查看控制台中的调试信息
2. **使用文件访问URL测试**: 打开 `test-file-access.html`，输入文件ID测试不同的URL格式
3. **检查网络请求**: 在开发者工具的Network标签页中查看头像请求是否成功

### 3. 手动测试API

可以使用以下curl命令测试API：

```bash
# 测试用户资料更新
curl -X POST http://localhost:8080/system/user/update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "username": "testuser",
    "nickName": "测试用户",
    "email": "test@example.com",
    "phone": "13800138000",
    "bio": "这是一个测试用户的个人简介",
    "avatar": "https://example.com/avatar.jpg"
  }'

# 测试文件上传
curl -X POST http://localhost:8080/file/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@avatar.jpg" \
  -F "businessType=USER_AVATAR"
```

## 注意事项

1. **权限验证**: 用户必须已登录才能更新个人资料
2. **数据验证**: 前端和后端都会进行数据验证
3. **体验账号限制**: 体验账号不支持修改个人资料
4. **头像上传**: 头像上传使用统一的文件上传接口，businessType为`USER_AVATAR`
5. **数据同步**: 更新成功后会自动同步到全局状态和本地存储
6. **头像显示**: 头像通过fileId构造访问URL，格式为`/file/access/{fileId}`
7. **URL配置**: 可以在代码中修改`FILE_ACCESS_URL_FORMAT`常量来调整文件访问URL格式

## 错误处理

常见的错误情况：

1. **未登录**: 返回401状态码，提示用户先登录
2. **数据验证失败**: 返回400状态码，显示具体错误信息
3. **服务器错误**: 返回500状态码，显示通用错误信息
4. **网络错误**: 显示网络连接错误提示

## 故障排除

### 头像显示问题

如果头像上传成功但显示不出来，可能的原因和解决方法：

1. **文件访问URL格式不正确**
   - 检查后端文件访问API的URL格式
   - 使用 `test-file-access.html` 测试不同的URL格式
   - 根据测试结果调整 `avatarUrl` 计算属性中的URL构造逻辑

2. **文件权限问题**
   - 确认文件上传后是否有正确的访问权限
   - 检查是否需要认证token才能访问文件

3. **CORS问题**
   - 检查文件服务器是否配置了正确的CORS策略
   - 确认前端域名是否在允许列表中

4. **文件ID格式问题**
   - 确认上传返回的fileId格式是否正确
   - 检查fileId是否包含特殊字符需要编码

### 调试步骤

1. 打开浏览器开发者工具
2. 查看控制台中的调试信息（包含avatar debug信息）
3. 在Network标签页中查看头像请求的详细信息
4. 使用 `test-file-access.html` 测试文件访问URL
5. 根据测试结果调整代码中的URL格式

### 配置文件访问URL格式

如果测试发现当前的文件访问URL格式不正确，可以修改 `src/pages/UserProfile.vue` 文件中的配置：

```typescript
// 文件访问URL格式配置
// 根据你的后端API，选择合适的URL格式
const FILE_ACCESS_URL_FORMAT = '/file/access/{fileId}' // 可以修改为其他格式
```

常见的URL格式：
- `/file/access/{fileId}` - 文件访问
- `/file/download/{fileId}` - 文件下载
- `/api/file/{fileId}` - API文件访问
- `/file/{fileId}` - 直接文件访问
- `/api/file/access/{fileId}` - API文件访问

## 后续优化建议

1. **头像裁剪**: 添加头像裁剪功能，支持自定义尺寸
2. **数据缓存**: 优化数据缓存策略
3. **实时验证**: 添加实时表单验证
4. **国际化**: 支持多语言显示
5. **主题定制**: 支持个性化主题设置
6. **头像预览**: 添加头像上传前的预览功能
