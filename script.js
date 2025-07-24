// script.js (完整替换版 - V2)

// --- 函数：自动获取网站图标 ---
function autoFetchFavicons() {
    const linkCards = document.querySelectorAll('.link-card');
    linkCards.forEach(card => {
        const iconImg = card.querySelector('.card-icon img');
        if (card.href && iconImg && !card.classList.contains('ad-card')) {
            try {
                const domain = new URL(card.href).hostname;
                iconImg.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
                iconImg.onerror = () => { iconImg.src = 'images/placeholder-icon.png'; };
            } catch (e) {
                iconImg.src = 'images/placeholder-icon.png';
            }
        }
    });
}

// --- 主事件监听器 ---
document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.querySelector('.main-content');
    const headerElement = document.querySelector('.main-header');
    const allSidebarLinks = document.querySelectorAll('.sidebar-nav a');
    const allSidebarListItems = document.querySelectorAll('.sidebar-nav li');

    // --- 1. 全新的侧边栏导航逻辑 (支持点击下拉) ---
    function setupSidebarNav() {
        allSidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const parentLi = link.parentElement;
                
                // --- 核心修改：点击一级菜单的逻辑 ---
                // 判断点击的是否为带子菜单的一级链接
                if (parentLi.classList.contains('has-submenu') && link.closest('.sidebar-submenu') === null) {
                    const wasActive = parentLi.classList.contains('active');
                    
                    // 手风琴效果：先关闭所有已打开的二级菜单
                    document.querySelectorAll('.sidebar-nav > ul > li.has-submenu').forEach(li => {
                        li.classList.remove('active');
                    });

                    // 如果刚才不是激活状态，则将其打开
                    if (!wasActive) {
                        parentLi.classList.add('active');
                    }
                    // 如果刚才已激活，上面的操作会将其关闭，实现 toggle 效果
                }

                // --- 联动逻辑 (滚动和标签页切换) ---
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    // 如果点击的是二级菜单链接，需要激活对应的右侧标签页
                    if (targetElement.classList.contains('subcategory-block')) {
                        const parentCategory = targetElement.closest('.category');
                        parentCategory.querySelectorAll('.subcategory-nav a').forEach(a => a.classList.remove('active'));
                        parentCategory.querySelectorAll('.subcategory-block').forEach(b => b.classList.remove('active'));
                        targetElement.classList.add('active');
                        parentCategory.querySelector(`.subcategory-nav a[data-filter="${targetId}"]`).classList.add('active');
                    }
                    
                    // 统一更新侧边栏高亮状态
                    updateSidebarHighlight(link);

                    // 平滑滚动到目标位置
                    const headerHeight = headerElement ? headerElement.offsetHeight : 0;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;
                    mainContent.scrollTo({ top: targetPosition, behavior: 'smooth' });
                }
            });
        });
    }
    
    // --- 2. 内容区标签页切换逻辑 (保持不变) ---
    function setupSubcategoryTabs() {
        const allNavs = document.querySelectorAll('.subcategory-nav');
        allNavs.forEach(nav => {
            nav.addEventListener('click', (e) => {
                e.preventDefault();
                const target = e.target.closest('a');
                if (!target) return;
                const parentCategory = nav.closest('.category');
                const filter = target.dataset.filter;
                nav.querySelectorAll('a').forEach(a => a.classList.remove('active'));
                target.classList.add('active');
                parentCategory.querySelectorAll('.subcategory-block').forEach(block => {
                    block.classList.remove('active');
                    if (block.id === filter) {
                        block.classList.add('active');
                    }
                });
                const correspondingSidebarLink = document.querySelector(`.sidebar-nav a[href="#${filter}"]`);
                if(correspondingSidebarLink) {
                    updateSidebarHighlight(correspondingSidebarLink);
                }
            });
        });
    }

    // --- 3. 滚动时自动高亮侧边栏 (保持不变) ---
    function setupScrollSpy() {
        const sectionsToObserve = document.querySelectorAll('.subcategory-block');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    const correspondingLink = document.querySelector(`.sidebar-nav a[href="#${id}"]`);
                    if (correspondingLink) {
                        updateSidebarHighlight(correspondingLink);
                    }
                }
            });
        }, { root: mainContent, rootMargin: `-${headerElement.offsetHeight + 25}px 0px -50% 0px`, threshold: 0 });
        sectionsToObserve.forEach(section => observer.observe(section));
    }
    
    // --- 辅助函数：统一更新侧边栏高亮状态 (保持不变) ---
    function updateSidebarHighlight(activeLink) {
        allSidebarLinks.forEach(l => l.classList.remove('active'));
        allSidebarListItems.forEach(li => {
             // 只移除链接的 li 的 active，保留父级 has-submenu 的 active
            if (!li.classList.contains('has-submenu')) {
                li.classList.remove('active');
            }
        });
        activeLink.classList.add('active');
        activeLink.parentElement.classList.add('active');
        const parentSubMenu = activeLink.closest('.sidebar-submenu');
        if (parentSubMenu) {
            parentSubMenu.parentElement.classList.add('active');
        }
    }


    // --- 4. 返回顶部按钮等其他功能 (保持不变) ---
    function setupOtherFeatures() {
        const backToTopButton = document.getElementById('back-to-top');
        mainContent.addEventListener('scroll', () => {
            backToTopButton.style.display = (mainContent.scrollTop > 300) ? 'flex' : 'none';
        });
        backToTopButton.addEventListener('click', () => {
            mainContent.scrollTo({ top: 0, behavior: 'smooth' });
        });
        const cards = document.querySelectorAll('.link-card');
        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    cardObserver.unobserve(entry.target);
                }
            });
        }, { root: mainContent, threshold: 0.1 });
        cards.forEach(card => cardObserver.observe(card));
    }

    // --- 初始化所有功能 ---
    setupSidebarNav();
    setupSubcategoryTabs();
    setupScrollSpy();
    setupOtherFeatures();
    autoFetchFavicons();
});


// --- 联系站长图片弹窗功能 ---
document.addEventListener('DOMContentLoaded', () => {
    const contactContainer = document.getElementById('contact-container');
    const contactPopup = document.getElementById('contact-popup');

    if (contactContainer && contactPopup) {
      // 鼠标进入容器时，显示弹窗
      contactContainer.addEventListener('mouseenter', () => {
        contactPopup.style.display = 'block';
      });

      // 鼠标离开容器时，隐藏弹窗
      contactContainer.addEventListener('mouseleave', () => {
        contactPopup.style.display = 'none';
      });
    }
});