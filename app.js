// 全域變量
let currentSection = 'home';
let currentDate = new Date();
let selectedDate = null;
let selectedTimeSlot = null;
let visitsChart = null;
let servicesChart = null;

// 應用程式數據
const appData = {
  stationInfo: {
    name: "幸福小棧失智社區服務據點",
    address: "臺北市士林區忠誠路一段171巷10弄12號（蘭雅教會）",
    phone: "02-2835-3456#5178",
    mobile: "0905-211-123",
    contact: "謝管理師",
    serviceTime: "每週二、三、五 09:00–16:00",
    serviceTarget: "輕中度失智（CDR 0.5–1、CMS ≤ 3）；需家屬陪同"
  },
  statistics: {
    monthlyVisits: [120, 135, 142, 158, 167, 173],
    serviceUsage: {
      consultation: 45,
      courses: 32,
      tracking: 28,
      referral: 25
    },
    downloadStats: {
      educational: 234,
      application: 156,
      multilingual: 89
    }
  }
};

// DOM 載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

// 應用程式初始化
function initializeApp() {
  setupNavigation();
  setupForms();
  setupTabs();
  setupCalendar();
  setupModals();
  loadSavedData();
  
  // 延遲初始化圖表，等待頁面完全載入
  setTimeout(() => {
    initializeCharts();
  }, 500);
  
  // 顯示首頁
  showSection('home');
}

// 導航功能
function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  // 導航連結點擊事件
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetSection = this.getAttribute('data-section');
      if (targetSection) {
        showSection(targetSection);
        
        // 更新活動狀態
        navLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        
        // 關閉手機選單
        if (navMenu) {
          navMenu.classList.remove('active');
        }
      }
    });
  });

  // 手機選單切換
  if (navToggle) {
    navToggle.addEventListener('click', function() {
      if (navMenu) {
        navMenu.classList.toggle('active');
      }
    });
  }

  // 首頁按鈕功能
  const heroButton = document.querySelector('[data-section="resources"]');
  if (heroButton) {
    heroButton.addEventListener('click', function(e) {
      e.preventDefault();
      showSection('resources');
      updateNavActiveState('resources');
    });
  }
}

// 顯示指定區段
function showSection(sectionId) {
  console.log('Switching to section:', sectionId);
  
  // 隱藏所有區段
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => {
    section.classList.remove('active');
    section.style.display = 'none';
  });

  // 顯示目標區段
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add('active');
    targetSection.style.display = 'block';
    currentSection = sectionId;
    
    // 如果是分析頁面，重新初始化圖表
    if (sectionId === 'analytics') {
      setTimeout(() => {
        initializeCharts();
      }, 100);
    }
    
    // 滾動到頂部
    window.scrollTo(0, 0);
    
    console.log('Section switched to:', sectionId);
  } else {
    console.error('Section not found:', sectionId);
  }
}

// 更新導航活動狀態
function updateNavActiveState(sectionId) {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-section') === sectionId) {
      link.classList.add('active');
    }
  });
}

// 標籤頁功能
function setupTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const targetTab = this.getAttribute('data-tab');
      
      // 更新按鈕狀態
      const parentContainer = this.closest('.section');
      if (parentContainer) {
        const siblingBtns = parentContainer.querySelectorAll('.tab-btn');
        siblingBtns.forEach(b => b.classList.remove('active'));
      }
      this.classList.add('active');
      
      // 更新內容顯示
      if (parentContainer) {
        const tabContents = parentContainer.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
          content.classList.remove('active');
        });
      }
      
      const targetContent = document.getElementById(targetTab);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });
}

// 表單處理
function setupForms() {
  // 個案基本資料表單
  const caseForm = document.querySelector('.case-form');
  if (caseForm) {
    caseForm.addEventListener('submit', function(e) {
      e.preventDefault();
      saveCaseData();
    });
  }

  // 諮詢表單
  const consultationForm = document.querySelector('.consultation-form');
  if (consultationForm) {
    consultationForm.addEventListener('submit', function(e) {
      e.preventDefault();
      submitConsultation();
    });
  }

  // 追蹤記錄表單
  const trackingForm = document.querySelector('.tracking-form form');
  if (trackingForm) {
    trackingForm.addEventListener('submit', function(e) {
      e.preventDefault();
      addTrackingRecord();
    });
  }

  // 提醒設定表單
  const reminderForm = document.querySelector('.reminder-form');
  if (reminderForm) {
    reminderForm.addEventListener('submit', function(e) {
      e.preventDefault();
      setReminder();
    });
  }
}

// 儲存個案資料
function saveCaseData() {
  const formData = {
    patientName: document.getElementById('patientName')?.value,
    patientId: document.getElementById('patientId')?.value,
    birthDate: document.getElementById('birthDate')?.value,
    phone: document.getElementById('phone')?.value,
    address: document.getElementById('address')?.value,
    emergencyContact: document.getElementById('emergencyContact')?.value,
    timestamp: new Date().toISOString()
  };

  try {
    localStorage.setItem('caseData', JSON.stringify(formData));
    showAlert('個案資料已成功儲存', 'success');
  } catch (error) {
    showAlert('儲存失敗，請重試', 'error');
  }
}

// 提交諮詢
function submitConsultation() {
  const consultations = JSON.parse(localStorage.getItem('consultations') || '[]');
  const formElements = document.querySelectorAll('.consultation-form input, .consultation-form select, .consultation-form textarea');
  
  const newConsultation = {
    id: Date.now(),
    name: formElements[0]?.value || '',
    phone: formElements[1]?.value || '',
    type: formElements[2]?.value || '',
    content: formElements[3]?.value || '',
    timestamp: new Date().toISOString(),
    status: 'pending'
  };

  consultations.push(newConsultation);
  localStorage.setItem('consultations', JSON.stringify(consultations));
  
  showAlert('諮詢已送出，我們將盡快回覆您', 'success');
  document.querySelector('.consultation-form').reset();
}

// 新增追蹤記錄
function addTrackingRecord() {
  const records = JSON.parse(localStorage.getItem('trackingRecords') || '[]');
  const newRecord = {
    id: Date.now(),
    date: document.getElementById('trackingDate')?.value,
    method: document.getElementById('trackingMethod')?.value,
    notes: document.getElementById('trackingNotes')?.value,
    timestamp: new Date().toISOString()
  };

  records.push(newRecord);
  localStorage.setItem('trackingRecords', JSON.stringify(records));
  
  updateTrackingList();
  showAlert('追蹤記錄已新增', 'success');
  document.querySelector('.tracking-form form').reset();
}

// 更新追蹤記錄列表
function updateTrackingList() {
  const records = JSON.parse(localStorage.getItem('trackingRecords') || '[]');
  const listContainer = document.getElementById('trackingList');
  
  if (!listContainer) return;

  listContainer.innerHTML = '';
  
  if (records.length === 0) {
    listContainer.innerHTML = '<p class="text-secondary">尚無追蹤記錄</p>';
    return;
  }
  
  records.slice(-5).reverse().forEach(record => {
    const recordElement = document.createElement('div');
    recordElement.className = 'tracking-record';
    recordElement.innerHTML = `
      <div class="tracking-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <strong>${record.date}</strong>
        <span class="status status--info">${getMethodName(record.method)}</span>
      </div>
      <p style="margin: 0;">${record.notes}</p>
    `;
    listContainer.appendChild(recordElement);
  });
}

// 獲取追蹤方式名稱
function getMethodName(method) {
  const methods = {
    phone: '電話關懷',
    visit: '家庭訪視',
    clinic: '門診追蹤'
  };
  return methods[method] || method;
}

// 設定提醒
function setReminder() {
  const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
  const newReminder = {
    id: Date.now(),
    type: document.getElementById('reminderType')?.value,
    date: document.getElementById('reminderDate')?.value,
    content: document.getElementById('reminderContent')?.value,
    created: new Date().toISOString(),
    active: true
  };

  reminders.push(newReminder);
  localStorage.setItem('reminders', JSON.stringify(reminders));
  
  showAlert('提醒已設定', 'success');
  document.querySelector('.reminder-form').reset();
}

// 日曆功能
function setupCalendar() {
  const calendarElement = document.getElementById('calendar');
  const currentMonthElement = document.getElementById('currentMonth');
  const prevMonthBtn = document.getElementById('prevMonth');
  const nextMonthBtn = document.getElementById('nextMonth');

  if (!calendarElement) return;

  // 月份切換
  if (prevMonthBtn) {
    prevMonthBtn.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderCalendar();
    });
  }

  if (nextMonthBtn) {
    nextMonthBtn.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderCalendar();
    });
  }

  // 時間段選擇
  setupTimeSlots();
  
  // 初始渲染
  renderCalendar();
}

// 渲染日曆
function renderCalendar() {
  const calendarElement = document.getElementById('calendar');
  const currentMonthElement = document.getElementById('currentMonth');
  
  if (!calendarElement || !currentMonthElement) return;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  currentMonthElement.textContent = `${year}年${month + 1}月`;
  
  // 清空日曆
  calendarElement.innerHTML = '';
  
  // 添加星期標題
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  weekdays.forEach(day => {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-weekday';
    dayElement.textContent = day;
    dayElement.style.fontWeight = 'bold';
    dayElement.style.textAlign = 'center';
    dayElement.style.padding = '8px';
    dayElement.style.backgroundColor = 'var(--color-secondary)';
    calendarElement.appendChild(dayElement);
  });

  // 獲取月份第一天和最後一天
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  // 生成日曆日期
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    dayElement.textContent = date.getDate();
    
    // 標記當前月份外的日期
    if (date.getMonth() !== month) {
      dayElement.style.opacity = '0.3';
    }
    
    // 標記今天
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      dayElement.style.backgroundColor = 'var(--color-secondary)';
    }
    
    // 只允許選擇未來日期且為服務日（週二、三、五）
    const dayOfWeek = date.getDay();
    if (date >= today && (dayOfWeek === 2 || dayOfWeek === 3 || dayOfWeek === 5)) {
      dayElement.style.cursor = 'pointer';
      dayElement.addEventListener('click', () => selectDate(date, dayElement));
    } else {
      dayElement.style.cursor = 'not-allowed';
      dayElement.style.opacity = '0.5';
    }
    
    calendarElement.appendChild(dayElement);
  }
}

// 選擇日期
function selectDate(date, element) {
  // 清除之前的選擇
  document.querySelectorAll('.calendar-day.selected').forEach(el => {
    el.classList.remove('selected');
  });
  
  // 標記新選擇
  element.classList.add('selected');
  selectedDate = date;
  
  // 更新可用時段
  updateAvailableTimeSlots();
}

// 設定時間段
function setupTimeSlots() {
  const timeButtons = document.querySelectorAll('.time-btn');
  
  timeButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      // 清除之前的選擇
      timeButtons.forEach(b => b.classList.remove('selected'));
      
      // 標記新選擇
      this.classList.add('selected');
      selectedTimeSlot = this.textContent;
      
      // 保存預約
      if (selectedDate && selectedTimeSlot) {
        saveAppointment();
      }
    });
  });
}

// 儲存預約
function saveAppointment() {
  const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
  const newAppointment = {
    id: Date.now(),
    date: selectedDate.toISOString(),
    time: selectedTimeSlot,
    status: 'confirmed',
    created: new Date().toISOString()
  };
  
  appointments.push(newAppointment);
  localStorage.setItem('appointments', JSON.stringify(appointments));
  
  showAlert(`已預約 ${selectedDate?.toLocaleDateString()} ${selectedTimeSlot}`, 'success');
}

// 更新可用時間段
function updateAvailableTimeSlots() {
  const timeButtons = document.querySelectorAll('.time-btn');
  const bookedSlots = getBookedSlots(selectedDate);
  
  timeButtons.forEach(btn => {
    const time = btn.textContent;
    if (bookedSlots.includes(time)) {
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
    } else {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
    }
  });
}

// 獲取已預約時段
function getBookedSlots(date) {
  if (!date) return [];
  
  const bookings = JSON.parse(localStorage.getItem('appointments') || '[]');
  return bookings
    .filter(booking => new Date(booking.date).toDateString() === date.toDateString())
    .map(booking => booking.time);
}

// 圖表初始化
function initializeCharts() {
  // 檢查是否在分析頁面且Chart.js已載入
  if (currentSection !== 'analytics' || typeof Chart === 'undefined') {
    return;
  }
  
  initVisitsChart();
  initServicesChart();
}

// 初始化訪客趨勢圖表
function initVisitsChart() {
  const ctx = document.getElementById('visitsChart');
  if (!ctx) return;

  // 如果圖表已存在，先銷毀
  if (visitsChart) {
    visitsChart.destroy();
  }

  visitsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
      datasets: [{
        label: '服務人次',
        data: appData.statistics.monthlyVisits,
        borderColor: '#1FB8CD',
        backgroundColor: 'rgba(31, 184, 205, 0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// 初始化服務分佈圖表
function initServicesChart() {
  const ctx = document.getElementById('servicesChart');
  if (!ctx) return;

  // 如果圖表已存在，先銷毀
  if (servicesChart) {
    servicesChart.destroy();
  }

  const serviceData = appData.statistics.serviceUsage;
  
  servicesChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['現場諮詢', '認知課程', '個案追蹤', '資源轉介'],
      datasets: [{
        data: [serviceData.consultation, serviceData.courses, serviceData.tracking, serviceData.referral],
        backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5'],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

// Google Maps 初始化（模擬功能）
function initMap() {
  const mapElement = document.getElementById('map');
  if (!mapElement) return;

  // 由於無法使用真實的 Google Maps API，創建一個模擬地圖
  mapElement.innerHTML = `
    <div style="width: 100%; height: 100%; background: #e0e0e0; display: flex; align-items: center; justify-content: center; border-radius: 8px;">
      <div style="text-align: center; padding: 20px;">
        <i class="fas fa-map-marker-alt" style="font-size: 48px; color: #1FB8CD; margin-bottom: 16px;"></i>
        <h4 style="margin: 0 0 8px 0;">幸福小棧失智社區服務據點</h4>
        <p style="margin: 0; color: #666;">臺北市士林區忠誠路一段171巷10弄12號</p>
        <p style="margin: 8px 0 0 0; color: #666;">點擊查看詳細地圖</p>
      </div>
    </div>
  `;
  
  mapElement.style.cursor = 'pointer';
  mapElement.addEventListener('click', function() {
    window.open('https://maps.google.com?q=臺北市士林區忠誠路一段171巷10弄12號', '_blank');
  });
}

// 電話撥打功能
function makeCall(phoneNumber) {
  if (confirm(`確定要撥打 ${phoneNumber} 嗎？`)) {
    window.location.href = `tel:${phoneNumber}`;
  }
}

// 檔案下載功能
function downloadFile(filename) {
  showAlert(`正在下載 ${filename}...`, 'success');
  
  // 記錄下載統計
  const downloads = JSON.parse(localStorage.getItem('downloadStats') || '{}');
  downloads[filename] = (downloads[filename] || 0) + 1;
  localStorage.setItem('downloadStats', JSON.stringify(downloads));
  
  // 模擬下載
  console.log(`下載檔案: ${filename}`);
}

// 影片觀看功能
function openVideo() {
  showAlert('正在開啟影片...', 'success');
  window.open('https://www.youtube.com/watch?v=example', '_blank');
}

// 評估工具開啟
function openAssessment(type) {
  const assessmentData = {
    CDR: {
      name: '臨床失智評估量表',
      items: ['記憶', '定向感', '判斷和解決問題', '社區事務', '家居和嗜好', '個人照料']
    },
    MMSE: {
      name: '簡易智能測驗',
      items: ['定向感', '記憶', '注意力和計算', '回憶', '語言']
    },
    ADL: {
      name: '日常生活活動能力量表',
      items: ['進食', '個人衛生', '穿衣', '如廁', '移位', '步行']
    }
  };

  const assessment = assessmentData[type];
  if (assessment) {
    showModal(`
      <h3>${assessment.name}</h3>
      <p>評估項目：</p>
      <ul>
        ${assessment.items.map(item => `<li>${item}</li>`).join('')}
      </ul>
      <p>此為模擬功能，實際使用時會開啟完整的評估工具。</p>
      <div style="margin-top: 20px;">
        <button class="btn btn--primary" onclick="closeModal()">確定</button>
      </div>
    `);
  }
}

// 報表匯出功能
function exportReport(type) {
  const reportTypes = {
    monthly: '月報表',
    quarterly: '季報表',
    annual: '年報表'
  };

  showAlert(`正在匯出${reportTypes[type]}...`, 'success');
  
  setTimeout(() => {
    const data = generateReportData(type);
    downloadReportFile(data, type);
  }, 1000);
}

// 生成報表數據
function generateReportData(type) {
  const baseData = {
    generatedAt: new Date().toISOString(),
    period: type,
    statistics: appData.statistics,
    consultations: JSON.parse(localStorage.getItem('consultations') || '[]').length,
    appointments: JSON.parse(localStorage.getItem('appointments') || '[]').length,
    downloads: Object.values(JSON.parse(localStorage.getItem('downloadStats') || '{}')).reduce((a, b) => a + b, 0)
  };

  return baseData;
}

// 下載報表檔案
function downloadReportFile(data, type) {
  const csvContent = convertToCSV(data);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${type}_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showAlert('報表下載完成', 'success');
  }
}

// 轉換為 CSV 格式
function convertToCSV(data) {
  const headers = ['項目', '數值'];
  const rows = [
    ['生成時間', new Date(data.generatedAt).toLocaleString()],
    ['報表類型', data.period],
    ['本月服務人次', data.statistics.monthlyVisits[data.statistics.monthlyVisits.length - 1]],
    ['諮詢件數', data.consultations],
    ['預約件數', data.appointments],
    ['下載次數', data.downloads]
  ];

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  return '\ufeff' + csvContent;
}

// 清除表單
function clearForm() {
  if (confirm('確定要清除所有資料嗎？')) {
    document.querySelector('.case-form').reset();
    showAlert('表單已清除', 'success');
  }
}

// 載入已儲存的數據
function loadSavedData() {
  // 載入個案資料
  const caseData = localStorage.getItem('caseData');
  if (caseData) {
    try {
      const data = JSON.parse(caseData);
      Object.keys(data).forEach(key => {
        const element = document.getElementById(key);
        if (element && key !== 'timestamp') {
          element.value = data[key];
        }
      });
    } catch (error) {
      console.error('載入個案資料失敗:', error);
    }
  }

  // 載入追蹤記錄
  updateTrackingList();
  
  // 初始化地圖
  setTimeout(() => {
    initMap();
  }, 1000);
}

// 模態框功能
function setupModals() {
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal') || e.target.classList.contains('modal-close')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeModal();
    }
  });
}

// 顯示模態框
function showModal(content) {
  let modal = document.querySelector('.modal');
  
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>資訊</h3>
          <button type="button" class="modal-close">&times;</button>
        </div>
        <div class="modal-body"></div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  
  modal.querySelector('.modal-body').innerHTML = content;
  modal.classList.remove('hidden');
}

// 關閉模態框
function closeModal() {
  const modal = document.querySelector('.modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

// 顯示提示訊息
function showAlert(message, type = 'info') {
  const existingAlert = document.querySelector('.alert');
  if (existingAlert) {
    existingAlert.remove();
  }

  const alert = document.createElement('div');
  alert.className = `alert alert--${type}`;
  alert.textContent = message;
  
  const main = document.querySelector('.main-content');
  if (main) {
    main.insertBefore(alert, main.firstChild);
    
    setTimeout(() => {
      if (alert.parentNode) {
        alert.remove();
      }
    }, 3000);
  }
}

// 錯誤處理
window.addEventListener('error', function(e) {
  console.error('應用程式錯誤:', e.error);
  showAlert('系統發生錯誤，請重新整理頁面', 'error');
});

// 網路狀態檢測
window.addEventListener('online', function() {
  showAlert('網路連線已恢復', 'success');
});

window.addEventListener('offline', function() {
  showAlert('網路連線已中斷，部分功能可能無法使用', 'warning');
});

// 瀏覽器兼容性檢查
function checkBrowserCompatibility() {
  const features = {
    localStorage: typeof(Storage) !== 'undefined',
    flexbox: CSS.supports('display', 'flex'),
    grid: CSS.supports('display', 'grid')
  };

  const unsupported = Object.keys(features).filter(feature => !features[feature]);
  
  if (unsupported.length > 0) {
    console.warn('不支援的功能:', unsupported);
  }

  return unsupported.length === 0;
}

// 初始化時檢查瀏覽器兼容性
document.addEventListener('DOMContentLoaded', function() {
  if (!checkBrowserCompatibility()) {
    showAlert('您的瀏覽器可能不完全支援此應用程式的所有功能', 'warning');
  }
});