<template>
  <el-dialog
    v-model="visible"
    title=""
    width="600px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      class="task-setting-form"
    >
      <!-- 任务名称 -->
      <el-form-item label="任务名称" prop="excelFile">
        <el-input
          v-model="formData.excelFile"
          placeholder="请输入任务名称"
        />
      </el-form-item>

      <!-- 状态 -->
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="formData.status"
          placeholder="请选择状态"
          style="width: 100%"
        >
          <el-option label="启用" value="Enable" />
          <el-option label="禁用" value="Disable" />
        </el-select>
      </el-form-item>

      <!-- 开始时间 -->
      <el-form-item label="开始时间" prop="startTime">
        <el-date-picker
          v-model="formData.startTime"
          type="datetime"
          placeholder="选择开始时间"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 100%"
        />
      </el-form-item>

      <!-- 结束时间 -->
      <el-form-item label="结束时间" prop="endTime">
        <el-date-picker
          v-model="formData.endTime"
          type="datetime"
          placeholder="选择结束时间"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 100%"
        />
      </el-form-item>

      <!-- 多选字段 -->
      <el-form-item label="多选字段" prop="extendData.searchHeaders">
        <div class="fields-container">
          <el-checkbox-group v-model="formData.extendData.searchHeaders" class="fields-grid">
            <el-checkbox
              v-for="field in availableFields"
              :key="field.value"
              :label="field.value"
              class="field-checkbox"
            >
              {{ field.label }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">
          保存
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type { ExcelParseTask, TaskSettingData, TaskFieldOption } from '@/typings/api'

// 定义组件属性
interface Props {
  modelValue: boolean
  task?: ExcelParseTask | null
}

// 定义组件事件
interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', data: TaskSettingData): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  task: null
})

const emit = defineEmits<Emits>()

// 响应式数据
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formRef = ref<FormInstance>()
const saving = ref(false)

// 表单数据
const formData = reactive<TaskSettingData>({
  excelFile: '',
  status: 'Disable',
  startTime: '',
  endTime: '',
  extendData: {
    headers: [],
    searchHeaders: []
  }
})

// 可用字段列表 - 从后端数据动态生成
const availableFields = ref<TaskFieldOption[]>([])

// 表单验证规则
const formRules: FormRules = {
  excelFile: [
    { required: true, message: '请输入任务名称', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 监听任务变化，初始化表单数据
watch(() => props.task, (newTask) => {
  if (newTask) {
     initializeFormData(newTask)
  }
}, { immediate: true })

/**
 * 初始化表单数据
 */
const initializeFormData = (task: ExcelParseTask) => {
  formData.excelFile = task.excelFile || task.fileName || ''
  // 从任务数据中获取实际状态，如果没有则默认为Disable
  formData.status = (task as any).status || 'Disable'
  formData.startTime = task.startTime || ''
  formData.endTime = task.endTime || ''
  // 从任务数据中获取字段信息
  const extendData = (task as any).extendData
  if (extendData && extendData.headers) {
    // 设置可用字段选项 - 使用headers作为所有可选字段
    availableFields.value = extendData.headers.map((header: string) => ({
      label: header,
      value: header
    }))
    
    // 设置extendData
    formData.extendData = {
      headers: extendData.headers,
      searchHeaders: extendData.searchHeaders || []
    }
  } else {
    // 如果没有extendData，清空字段列表
    availableFields.value = []
    formData.extendData = {
      headers: [],
      searchHeaders: []
    }
  }
}

/**
 * 处理取消
 */
const handleCancel = () => {
  visible.value = false
}



/**
 * 处理保存
 */
const handleSave = async () => {
  if (!formRef.value) {
    return
  }

  try {
    await formRef.value.validate()
    
    saving.value = true
    
    // 验证时间逻辑（如果两个时间都填写了，则验证开始时间早于结束时间）
    if (formData.startTime && formData.endTime) {
      const startTime = new Date(formData.startTime)
      const endTime = new Date(formData.endTime)
      
      if (startTime >= endTime) {
        ElMessage.error('开始时间必须早于结束时间')
        return
      }
    }



    // 发送保存事件
    emit('save', { ...formData })
    
    ElMessage.success('设置保存成功')
    visible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
    ElMessage.error('表单验证失败，请检查输入')
  } finally {
    saving.value = false
  }
}

// 暴露方法给父组件
defineExpose({
  resetForm: () => {
    if (formRef.value) {
      formRef.value.resetFields()
    }
  }
})
</script>

<style scoped>
.task-setting-form {
  padding: 20px 0;
}

.fields-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 15px;
  background-color: #fafafa;
  max-height: 200px;
  overflow-y: auto;
}

.fields-grid {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 10px !important;
  width: 100% !important;
}

.field-checkbox {
  margin: 0 !important;
  min-width: 120px !important;
  flex: 0 0 auto !important;
}

:deep(.el-checkbox-group) {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 10px !important;
  width: 100% !important;
}

:deep(.el-checkbox) {
  margin: 0 !important;
  margin-right: 0 !important;
  min-width: 120px !important;
  flex: 0 0 auto !important;
}

.dialog-footer {
  text-align: right;
}

:deep(.el-checkbox__label) {
  font-size: 14px;
  color: #606266;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #303133;
}
</style>
