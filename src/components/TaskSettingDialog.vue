<template>
  <el-dialog
    v-model="visible"
    title="编辑任务"
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
      <el-form-item label="任务名称" prop="taskName">
        <el-input
          v-model="formData.taskName"
          placeholder="请输入任务名称"
          :disabled="true"
        />
      </el-form-item>

      <!-- 状态 -->
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="formData.status"
          placeholder="请选择状态"
          style="width: 100%"
        >
          <el-option label="启用" value="enabled" />
          <el-option label="禁用" value="disabled" />
          <el-option label="暂停" value="paused" />
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
      <el-form-item label="多选字段" prop="selectedFields">
        <div class="fields-container">
          <el-checkbox-group v-model="formData.selectedFields">
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

      <!-- 高级设置 -->
      <el-form-item label="高级设置">
        <el-collapse v-model="activeCollapse">
          <el-collapse-item title="数据处理选项" name="dataProcessing">
            <el-form-item label="数据过滤">
              <el-input
                v-model="formData.dataFilter"
                type="textarea"
                :rows="3"
                placeholder="请输入数据过滤条件，例如：日期 >= '2024-01-01' AND 费用 > 100"
              />
            </el-form-item>
            <el-form-item label="排序规则">
              <el-select
                v-model="formData.sortField"
                placeholder="选择排序字段"
                style="width: 200px; margin-right: 10px;"
              >
                <el-option
                  v-for="field in availableFields"
                  :key="field.value"
                  :label="field.label"
                  :value="field.value"
                />
              </el-select>
              <el-select
                v-model="formData.sortOrder"
                placeholder="排序方式"
                style="width: 120px;"
              >
                <el-option label="升序" value="asc" />
                <el-option label="降序" value="desc" />
              </el-select>
            </el-form-item>
            <el-form-item label="快速操作">
              <el-button-group>
                <el-button size="small" @click="selectAllFields">全选</el-button>
                <el-button size="small" @click="clearAllFields">清空</el-button>
                <el-button size="small" @click="selectCommonFields">常用字段</el-button>
              </el-button-group>
            </el-form-item>
          </el-collapse-item>
        </el-collapse>
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
const activeCollapse = ref(['dataProcessing'])

// 表单数据
const formData = reactive<TaskSettingData>({
  taskName: '',
  status: 'enabled',
  startTime: '',
  endTime: '',
  selectedFields: [],
  dataFilter: '',
  sortField: '',
  sortOrder: 'asc'
})

// 可用字段列表 - 根据实际Excel列名动态生成
const availableFields = ref<TaskFieldOption[]>([
  { label: '序号', value: 'serialNumber' },
  { label: '日期', value: 'date' },
  { label: '使用时间', value: 'usageTime' },
  { label: '结束时间', value: 'endTime' },
  { label: '上车地点', value: 'pickupLocation' },
  { label: '途径地点', value: 'viaLocation' },
  { label: '下车地点', value: 'dropoffLocation' },
  { label: '车牌号', value: 'plateNumber' },
  { label: '司机姓名', value: 'driverName' },
  { label: '联系电话', value: 'phoneNumber' },
  { label: '费用', value: 'cost' },
  { label: '备注', value: 'remarks' }
])

// 表单验证规则
const formRules: FormRules = {
  taskName: [
    { required: true, message: '请输入任务名称', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ],
  startTime: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  endTime: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
  ],
  selectedFields: [
    { required: true, message: '请至少选择一个字段', trigger: 'change' }
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
  formData.taskName = task.fileName || ''
  formData.status = 'enabled'
  formData.startTime = ''
  formData.endTime = ''
  formData.selectedFields = availableFields.value.map(field => field.value) // 默认全选
  formData.dataFilter = ''
  formData.sortField = ''
  formData.sortOrder = 'asc'
}

/**
 * 处理取消
 */
const handleCancel = () => {
  visible.value = false
}

/**
 * 全选字段
 */
const selectAllFields = () => {
  formData.selectedFields = availableFields.value.map(field => field.value)
}

/**
 * 清空字段选择
 */
const clearAllFields = () => {
  formData.selectedFields = []
}

/**
 * 选择常用字段
 */
const selectCommonFields = () => {
  const commonFields = ['serialNumber', 'date', 'pickupLocation', 'dropoffLocation', 'cost']
  formData.selectedFields = commonFields
}

/**
 * 处理保存
 */
const handleSave = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    
    saving.value = true
    
    // 验证时间逻辑
    if (formData.startTime && formData.endTime) {
      const startTime = new Date(formData.startTime)
      const endTime = new Date(formData.endTime)
      
      if (startTime >= endTime) {
        ElMessage.error('开始时间必须早于结束时间')
        return
      }
    }

    // 验证至少选择一个字段
    if (formData.selectedFields.length === 0) {
      ElMessage.error('请至少选择一个字段')
      return
    }

    // 发送保存事件
    emit('save', { ...formData })
    
    ElMessage.success('设置保存成功')
    visible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
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

.field-checkbox {
  display: block;
  margin-bottom: 10px;
  margin-right: 0;
}

.field-checkbox:last-child {
  margin-bottom: 0;
}

.dialog-footer {
  text-align: right;
}

:deep(.el-checkbox__label) {
  font-size: 14px;
  color: #606266;
}

:deep(.el-collapse-item__header) {
  font-size: 14px;
  font-weight: 500;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #303133;
}
</style>
