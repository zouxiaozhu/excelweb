<template>
  <footer class="app-footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-info">
          <p class="copyright">&copy; 2024 Excel Web. All rights reserved.</p>
          <p class="icp">
            <a href="https://beian.miit.gov.cn/" target="_blank" class="footer-link">
              浙ICP备2025166866号
            </a>
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
/**
 * @component Footer
 * @description 全局页脚组件，显示版权信息和备案信息
 */
</script>

<style scoped>
.app-footer {
  background-color: #2c3e50;
  color: white;
  padding: 20px 0;
  margin-top: auto;
}

.footer-content {
  text-align: center;
}

.footer-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.footer-info p {
  margin: 0;
  font-size: 14px;
}

.copyright {
  color: #bdc3c7;
}

.icp {
  color: #95a5a6;
}

.footer-link {
  color: #bdc3c7;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: #409eff;
}

@media (max-width: 768px) {
  .app-footer {
    padding: 15px 0;
  }
  
  .footer-info p {
    font-size: 12px;
  }
  
  .footer-info {
    gap: 6px;
  }
}
</style>
