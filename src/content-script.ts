// Content Script - 在网页中运行的脚本
console.log('Editor Browser Extension content script loaded!')

// 在页面中添加一个浮动按钮示例
function createFloatingButton() {
  const button = document.createElement('div')
  button.id = 'editor-browser-float-btn'
  button.innerHTML = '📝'
  button.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    background: #4F46E5;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10000;
    font-size: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    transition: all 0.3s ease;
  `

  button.addEventListener('click', () => {
    alert('Hello from Editor Browser Extension!')
  })

  button.addEventListener('mouseenter', () => {
    button.style.transform = 'scale(1.1)'
  })

  button.addEventListener('mouseleave', () => {
    button.style.transform = 'scale(1)'
  })

  document.body.appendChild(button)
}

// 页面加载完成后创建按钮
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createFloatingButton)
} else {
  createFloatingButton()
}
