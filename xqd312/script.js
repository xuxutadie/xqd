// 等待DOM完全加载
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM fully loaded');
  
  // 防止事件冒泡和默认行为阻止
  function initEventPropagation() {
    // 为所有可点击元素阻止冒泡
    const clickables = document.querySelectorAll('button, .nav-btn, .cat-tab, .work-card, .theme-toggle, a, .upload-area');
    clickables.forEach(elem => {
      elem.addEventListener('click', function(e) {
        e.stopPropagation();
      });
    });
  }

  // 初始化事件传播
  initEventPropagation();
  
  // 导航功能
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault(); // 防止默认行为
      
      // 移除所有active类
      navButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      // 获取目标页面
      const pageId = this.getAttribute('data-page');
      
      // 隐藏所有页面
      document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
      });
      
      // 显示目标页面
      const targetPage = document.getElementById(pageId);
      if (targetPage) {
        targetPage.classList.add('active');
        console.log('Navigated to: ' + pageId);
      } else {
        console.error('页面未找到: ' + pageId);
      }
    });
  });
  
  // 主题切换功能
  const themeToggle = document.getElementById('themeToggle');
  if(themeToggle) {
    themeToggle.addEventListener('click', function() {
      document.body.classList.toggle('light-mode');
    });
  }
  
  // 分类标签切换功能
  const categoryTabs = document.querySelectorAll('.cat-tab');
  if (categoryTabs.length > 0) {
    console.log('找到了', categoryTabs.length, '个分类标签');
    
    categoryTabs.forEach(tab => {
      tab.addEventListener('click', function(e) {
        e.preventDefault(); // 防止默认行为
        console.log('点击了分类:', this.getAttribute('data-category'));
        
        // 更新标签激活状态
        categoryTabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        
        const category = this.getAttribute('data-category');
        const sections = document.querySelectorAll('.section');
        
        console.log('找到了', sections.length, '个内容区域');
        
        if (category === 'all') {
          // 显示所有分区
          sections.forEach(section => {
            section.style.display = 'block';
          });
        } else {
          // 按分类筛选
          sections.forEach(section => {
            const sectionTitle = section.querySelector('.section-title').textContent.toLowerCase();
            console.log('部分标题:', sectionTitle);
            
            if (
              (category === 'image' && sectionTitle.includes('图片')) ||
              (category === 'book' && sectionTitle.includes('绘本')) ||
              (category === 'video' && sectionTitle.includes('视频')) ||
              (category === 'ai' && sectionTitle.includes('ai')) ||
              (category === 'whitelist' && sectionTitle.includes('白名单'))
            ) {
              section.style.display = 'block';
            } else {
              section.style.display = 'none';
            }
          });
        }
      });
    });
  }
  
  // 上传功能
  const uploadBtn = document.querySelector('.upload-btn');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', function() {
      alert('上传功能即将开发完成！');
    });
  }
  
  // 上传区域点击事件
  const uploadArea = document.getElementById('uploadArea');
  if (uploadArea) {
    uploadArea.addEventListener('click', function() {
      // 创建一个隐藏的文件输入元素
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*,video/*,application/pdf,text/html';
      fileInput.click();
      
      fileInput.addEventListener('change', function() {
        if (fileInput.files.length > 0) {
          alert('已选择文件: ' + fileInput.files[0].name);
        }
      });
    });
  }
  
  // 添加"我的作品"页面的预览和删除按钮事件
  const myWorksPage = document.getElementById('my-works');
  if (myWorksPage) {
    const previewButtons = myWorksPage.querySelectorAll('.preview-btn');
    previewButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        const workTitle = this.closest('.work-item').querySelector('h3').textContent;
        alert('预览: ' + workTitle);
      });
    });
    
    const deleteButtons = myWorksPage.querySelectorAll('.delete-btn');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        const workTitle = this.closest('.work-item').querySelector('h3').textContent;
        if (confirm('确定要删除 "' + workTitle + '" 吗?')) {
          alert('删除功能即将开发完成!');
        }
      });
    });
  }
  
  // 添加登录/注册页面的事件
  const loginPage = document.getElementById('login');
  if (loginPage) {
    // 登录按钮
    const loginSubmitBtn = loginPage.querySelector('.login-submit-btn');
    if (loginSubmitBtn) {
      loginSubmitBtn.addEventListener('click', function() {
        alert('登录功能即将开发完成!');
      });
    }
    
    // 注册按钮
    const registerSubmitBtn = loginPage.querySelector('.register-submit-btn');
    if (registerSubmitBtn) {
      registerSubmitBtn.addEventListener('click', function() {
        alert('注册功能即将开发完成!');
      });
    }
    
    // 获取验证码按钮
    const getCodeBtns = loginPage.querySelectorAll('.get-code-btn');
    getCodeBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        this.textContent = '60s后重试';
        this.disabled = true;
        this.style.opacity = '0.5';
        
        let countdown = 60;
        const timer = setInterval(() => {
          countdown--;
          this.textContent = countdown + 's后重试';
          
          if (countdown <= 0) {
            clearInterval(timer);
            this.textContent = '获取验证码';
            this.disabled = false;
            this.style.opacity = '1';
          }
        }, 1000);
        
        alert('验证码已发送至您的手机');
      });
    });
    
    // 切换登录和注册表单
    const showRegister = loginPage.querySelector('#showRegister');
    const showLogin = loginPage.querySelector('#showLogin');
    const registerForm = loginPage.querySelector('#registerForm');
    
    if (showRegister && showLogin && registerForm) {
      showRegister.addEventListener('click', function(e) {
        e.preventDefault();
        registerForm.style.display = 'block';
        registerForm.previousElementSibling.style.display = 'none';
      });
      
      showLogin.addEventListener('click', function(e) {
        e.preventDefault();
        registerForm.style.display = 'none';
        registerForm.previousElementSibling.style.display = 'block';
      });
    }
  }
});