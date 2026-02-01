// Список всех изображений из папки images
const imageFiles = [
    '085b8c0209d20f8e918eebfa420eb4e2.280x280x1.png',
    '160923-little-kitten-free-transparent-image-hd.png',
    '164152-pink-kitty-download-hq.webp',
    '2-1.png',
    '5cf22c0d9f8b473646572986e8ec2237-removebg-preview.png',
    '716a7c860fd1f489739c14101203cb63-removebg-preview.png',
    'b274c4d1b1f30817b3446da82db5b1bc-removebg-preview.png',
    'Beauty_behind_the_madness_logo.png',
    'c0afcfff8ff10e0debf3943786dade11-removebg-preview.png',
    'Cartoon-hello-kitty-clipart-PNG.png',
    'Delightful-Hello-Kitty-Cartoon-Appearance-PNG.png',
    'Hello-Kitty-PNG-File.png',
    'hello-kitty-png-icon-17.png',
    'hello-kitty-png-icon-7.png',
    'Hello-Kitty-PNG-Images-HD.png',
    'image.png',
    'KissLandLogoblack-removebg-preview.png',
    'lily-flower-illustration-in-cartoon-style-free-png.png',
    'pink-peonies-bouquet-clipart-eh858rz9tx54evyn.png',
    'pngtree-beautiful-bouquet-of-pink-and-white-ranunculus-flowers-isolated-on-transparent-png-image_21227763.png',
    'pngtree-elegant-pink-tulip-bouquet-clipart-illustration-with-transparent-background-png-image_20865193.png',
    'pngtree-gorgeous-floral-arrangement-with-soft-pastel-roses-png-image_20557014.png',
    'pngtree-lily-flower-cartoon-png-png-image_14573155.png',
    'pngtree-peony-flower-bouquet-with-paper-wrap-watercolor-png-image_16249939.png',
    'pngtree-pink-rose-bouquet-clipart-for-romantic-designs-png-image_16640361.webp',
    'pngtree-watercolor-clipart-many-pale-ranunculus-style-minimalistic-child-simple-watercolor-png-image_15770834.png',
    'Sanrio-PNG-File.png',
    'spring-tulip-flowers-in-a-bouquet-drawing-png.png',
    'Starboy_album_logo.png',
    'The-Weeknd-Logo-PNG-Clipart.png',
    'XO_Records_logo.png'
];

// Элементы DOM
const imagesContainer = document.getElementById('imagesContainer');
const btnYes = document.getElementById('btnYes');
const btnNo = document.getElementById('btnNo');
const loveMessage = document.getElementById('loveMessage');
const noMessage = document.getElementById('noMessage');

// Счетчик анимаций для кнопки "Нет"
let animationIndex = 0;
const animations = ['fly-away', 'expand-text', 'burn', 'spin-away', 'shake', 'shrink', 'blur'];

// Массив для хранения позиций размещенных изображений
let placedImages = [];

// Зона исключения для карточки (будет установлена после загрузки)
let cardExclusionZone = null;

// Функция установки зоны исключения для карточки
function setCardExclusionZone() {
    const card = document.querySelector('.card');
    if (card) {
        const rect = card.getBoundingClientRect();
        // Меньший отступ на мобильных устройствах
        const isMobile = window.innerWidth < 768;
        const padding = isMobile ? 30 : 50;
        cardExclusionZone = {
            left: rect.left - padding,
            top: rect.top - padding,
            right: rect.right + padding,
            bottom: rect.bottom + padding
        };
    }
}

// Функция проверки пересечения двух прямоугольников
function checkCollision(rect1, rect2) {
    return !(rect1.right < rect2.left || 
             rect1.left > rect2.right || 
             rect1.bottom < rect2.top || 
             rect1.top > rect2.bottom);
}

// Функция получения границ изображения с учетом поворота
function getImageBounds(x, y, width, height, rotation) {
    // Для упрощения используем ограничивающий прямоугольник
    // При повороте размер увеличивается
    const rad = Math.abs(rotation * Math.PI / 180);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const newWidth = Math.abs(width * cos) + Math.abs(height * sin);
    const newHeight = Math.abs(width * sin) + Math.abs(height * cos);
    
    return {
        left: x - newWidth / 2,
        top: y - newHeight / 2,
        right: x + newWidth / 2,
        bottom: y + newHeight / 2,
        width: newWidth,
        height: newHeight
    };
}

// Функция проверки, можно ли разместить изображение в данной позиции
function canPlaceImage(x, y, width, height, rotation) {
    const bounds = getImageBounds(x, y, width, height, rotation);
    
    // Проверяем границы экрана (с небольшим отступом)
    const margin = 10;
    if (bounds.left < -margin || bounds.top < -margin || 
        bounds.right > window.innerWidth + margin || bounds.bottom > window.innerHeight + margin) {
        return false;
    }
    
    // Проверяем пересечение с зоной исключения карточки (с увеличенным отступом)
    if (cardExclusionZone) {
        const expandedZone = {
            left: cardExclusionZone.left - 30,
            top: cardExclusionZone.top - 30,
            right: cardExclusionZone.right + 30,
            bottom: cardExclusionZone.bottom + 30
        };
        if (checkCollision(bounds, expandedZone)) {
            return false;
        }
    }
    
    // Проверяем пересечение с уже размещенными изображениями
    // На мобильных устройствах разрешаем небольшое перекрытие (20% площади)
    const isMobile = window.innerWidth < 768;
    const overlapThreshold = isMobile ? 0.2 : 0.1; // 20% на мобильных, 10% на десктопе
    
    for (let placed of placedImages) {
        if (checkCollision(bounds, placed)) {
            // Вычисляем площадь пересечения
            const overlapLeft = Math.max(bounds.left, placed.left);
            const overlapTop = Math.max(bounds.top, placed.top);
            const overlapRight = Math.min(bounds.right, placed.right);
            const overlapBottom = Math.min(bounds.bottom, placed.bottom);
            
            if (overlapLeft < overlapRight && overlapTop < overlapBottom) {
                const overlapArea = (overlapRight - overlapLeft) * (overlapBottom - overlapTop);
                const boundsArea = bounds.width * bounds.height;
                const overlapRatio = overlapArea / boundsArea;
                
                // Если перекрытие больше порога, отклоняем
                if (overlapRatio > overlapThreshold) {
                    return false;
                }
            }
        }
    }
    
    return true;
}

// Функция поиска свободной позиции для изображения
function findFreePosition(width, height, rotation) {
    const maxAttempts = 2000; // Увеличено количество попыток
    const padding = 15;
    const isMobile = window.innerWidth < 768;
    
    // На мобильных пробуем сначала по краям, где больше места
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        let randomX, randomY;
        
        if (isMobile && attempt < maxAttempts / 2) {
            // На мобильных сначала пробуем верхнюю и нижнюю части экрана
            const useTop = attempt % 2 === 0;
            randomY = useTop 
                ? padding + Math.random() * (window.innerHeight * 0.3)
                : window.innerHeight * 0.7 + Math.random() * (window.innerHeight * 0.3 - padding);
            randomX = padding + Math.random() * (window.innerWidth - padding * 2);
        } else {
            randomX = padding + Math.random() * (window.innerWidth - padding * 2);
            randomY = padding + Math.random() * (window.innerHeight - padding * 2);
        }
        
        if (canPlaceImage(randomX, randomY, width, height, rotation)) {
            return { x: randomX, y: randomY };
        }
    }
    
    // Если не нашли свободное место, возвращаем позицию с минимальным перекрытием
    return {
        x: padding + Math.random() * (window.innerWidth - padding * 2),
        y: padding + Math.random() * (window.innerHeight - padding * 2)
    };
}

// Функция переразмещения изображений
function reloadImages() {
    // Очищаем контейнер и массив размещенных изображений
    imagesContainer.innerHTML = '';
    placedImages = [];
    
    // Загружаем изображения заново
    loadImages();
}

// Функция вычисления оптимального количества изображений на основе размера экрана
function calculateImageCount() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Упрощенный расчет на основе ширины экрана
    // На мобильных устройствах используем фиксированные значения
    if (viewportWidth < 480) {
        // Маленькие экраны (iPhone и т.д.) - 10-15 изображений
        return Math.min(15, imageFiles.length);
    } else if (viewportWidth < 768) {
        // Планшеты - 15-20 изображений
        return Math.min(20, imageFiles.length);
    } else if (viewportWidth < 1024) {
        // Небольшие десктопы - 20-25 изображений
        return Math.min(25, imageFiles.length);
    } else {
        // Большие экраны - все изображения
        return imageFiles.length;
    }
}

// Загрузка и размещение изображений
function loadImages() {
    const isMobile = window.innerWidth < 768;
    const isSmallMobile = window.innerWidth < 480;
    
    // Размеры изображений зависят от устройства
    const maxImageSize = isSmallMobile ? 100 : isMobile ? 120 : 150;
    const minImageSize = isSmallMobile ? 60 : isMobile ? 70 : 80;
    
    // Вычисляем количество изображений для текущего размера экрана
    const imageCount = calculateImageCount();
    
    // Берем случайные изображения из массива
    const shuffledImages = [...imageFiles].sort(() => Math.random() - 0.5);
    const selectedImages = shuffledImages.slice(0, imageCount);
    
    selectedImages.forEach((filename, index) => {
        const img = document.createElement('img');
        img.src = `images/${filename}`;
        img.alt = 'Valentine decoration';
        
        img.onload = function() {
            // Получаем реальные размеры изображения
            const naturalWidth = img.naturalWidth;
            const naturalHeight = img.naturalHeight;
            
            // Вычисляем размер с учетом ограничений
            let displayWidth = Math.min(naturalWidth, maxImageSize);
            let displayHeight = Math.min(naturalHeight, maxImageSize);
            
            // Сохраняем пропорции
            const aspectRatio = naturalWidth / naturalHeight;
            if (displayWidth / displayHeight > aspectRatio) {
                displayWidth = displayHeight * aspectRatio;
            } else {
                displayHeight = displayWidth / aspectRatio;
            }
            
            // Случайный размер от minImageSize до maxImageSize
            const randomScale = (minImageSize + Math.random() * (maxImageSize - minImageSize)) / Math.max(displayWidth, displayHeight);
            displayWidth *= randomScale;
            displayHeight *= randomScale;
            
            // Случайный поворот от -30 до 30 градусов
            const randomRotation = (Math.random() * 60) - 30;
            
            // Ищем свободную позицию
            const position = findFreePosition(displayWidth, displayHeight, randomRotation);
            
            // Устанавливаем стили
            img.style.width = displayWidth + 'px';
            img.style.height = displayHeight + 'px';
            img.style.left = (position.x - displayWidth / 2) + 'px';
            img.style.top = (position.y - displayHeight / 2) + 'px';
            img.style.transform = `rotate(${randomRotation}deg)`;
            img.style.transformOrigin = 'center center';
            
            // Сохраняем границы для проверки пересечений
            const bounds = getImageBounds(position.x, position.y, displayWidth, displayHeight, randomRotation);
            placedImages.push(bounds);
            
            imagesContainer.appendChild(img);
        };
        
        img.onerror = function() {
            // Если изображение не загрузилось, просто скрываем его
            this.style.display = 'none';
        };
    });
}

// Обработчик кнопки "Да"
btnYes.addEventListener('click', function() {
    loveMessage.classList.add('show');
    btnYes.style.display = 'none';
    btnNo.style.display = 'none';
    
    // Скрываем карточку
    document.querySelector('.card').style.opacity = '0';
    document.querySelector('.card').style.transition = 'opacity 0.5s ease';
});

// Сохраняем исходную позицию кнопки "Нет"
let btnNoOriginalPosition = null;

// Функция сохранения исходной позиции кнопки
function saveBtnNoPosition() {
    const card = document.querySelector('.card');
    const buttons = document.querySelector('.buttons');
    if (card && buttons) {
        const cardRect = card.getBoundingClientRect();
        const buttonsRect = buttons.getBoundingClientRect();
        btnNoOriginalPosition = {
            left: buttonsRect.left + (buttonsRect.width / 2) + 15, // Смещение для кнопки No
            top: buttonsRect.top + buttonsRect.height / 2
        };
    }
}

// Обработчик кнопки "Нет"
btnNo.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Сохраняем текущую позицию, если еще не сохранена
    if (!btnNoOriginalPosition) {
        saveBtnNoPosition();
    }
    
    // Выбираем анимацию по кругу
    const animationClass = animations[animationIndex];
    animationIndex = (animationIndex + 1) % animations.length;
    
    // Сохраняем текущую позицию кнопки перед анимацией
    const currentLeft = btnNo.style.left || '';
    const currentTop = btnNo.style.top || '';
    const currentPosition = btnNo.style.position || '';
    
    // Удаляем все предыдущие классы анимаций и сбрасываем стили
    btnNo.className = 'btn btn-no';
    btnNo.style.opacity = '1';
    btnNo.style.filter = 'none';
    btnNo.style.transform = '';
    btnNo.style.display = 'block';
    btnNo.style.visibility = 'visible';
    
    // Добавляем новую анимацию
    setTimeout(() => {
        btnNo.classList.add(animationClass);
        
        // Для анимации "expand-text" показываем сообщение
        if (animationClass === 'expand-text') {
            setTimeout(() => {
                noMessage.classList.add('show');
                setTimeout(() => {
                    noMessage.classList.remove('show');
                }, 2000);
            }, 300);
        }
        
        // После завершения анимации возвращаем кнопку
        const animationDuration = animationClass === 'burn' || animationClass === 'spin-away' ? 1000 : 
                                  animationClass === 'expand-text' ? 600 : 
                                  animationClass === 'shrink' ? 600 : 
                                  animationClass === 'blur' ? 800 : 800;
        
        setTimeout(() => {
            btnNo.classList.remove(animationClass);
            
            // Полностью сбрасываем все стили
            btnNo.style.opacity = '1';
            btnNo.style.filter = 'none';
            btnNo.style.display = 'block';
            btnNo.style.visibility = 'visible';
            
            // Для анимаций fly-away и spin-away кнопка может улететь, для остальных остается на месте
            // В любом случае возвращаем кнопку в исходное положение за 2 секунды
            setTimeout(() => {
                const buttons = document.querySelector('.buttons');
                if (buttons) {
                    // Устанавливаем transition для плавного возврата
                    btnNo.style.transition = 'left 2s ease-out, top 2s ease-out, transform 2s ease-out, opacity 2s ease-out, filter 2s ease-out';
                    
                    // Получаем текущую позицию кнопки No в контейнере buttons
                    const buttonsRect = buttons.getBoundingClientRect();
                    const btnNoRect = btnNo.getBoundingClientRect();
                    
                    // Вычисляем позицию кнопки No относительно контейнера buttons
                    // Кнопка No находится справа от центра контейнера
                    const buttonsCenterX = buttonsRect.left + buttonsRect.width / 2;
                    const buttonsCenterY = buttonsRect.top + buttonsRect.height / 2;
                    const gap = 15; // Расстояние между кнопками
                    const targetLeft = buttonsCenterX + gap + btnNo.offsetWidth / 2;
                    const targetTop = buttonsCenterY;
                    
                    // Если кнопка была перемещена (fly-away, spin-away), возвращаем её
                    if (animationClass === 'fly-away' || animationClass === 'spin-away') {
                        btnNo.style.position = 'fixed';
                        btnNo.style.left = targetLeft + 'px';
                        btnNo.style.top = targetTop + 'px';
                        btnNo.style.transform = 'translate(-50%, -50%)';
                    } else {
                        // Для других анимаций просто сбрасываем стили
                        btnNo.style.position = '';
                        btnNo.style.left = '';
                        btnNo.style.top = '';
                        btnNo.style.transform = '';
                    }
                    
                    // После завершения возврата (2 секунды) сбрасываем все стили
                    setTimeout(() => {
                        btnNo.style.transition = '';
                        btnNo.style.position = '';
                        btnNo.style.left = '';
                        btnNo.style.top = '';
                        btnNo.style.transform = '';
                    }, 2000);
                }
            }, 50);
        }, animationDuration);
    }, 10);
});

// Также обрабатываем попытку наведения на кнопку "Нет"
btnNo.addEventListener('mouseenter', function() {
    // Небольшая случайная анимация при наведении
    if (!btnNo.classList.contains('shake') && !btnNo.classList.contains('fly-away') && 
        !btnNo.classList.contains('spin-away') && !btnNo.classList.contains('burn') &&
        !btnNo.classList.contains('shrink') && !btnNo.classList.contains('blur') &&
        !btnNo.classList.contains('expand-text')) {
        btnNo.style.transform = `translate(${(Math.random() - 0.5) * 10}px, ${(Math.random() - 0.5) * 10}px)`;
    }
});

btnNo.addEventListener('mouseleave', function() {
    if (!btnNo.classList.contains('shake') && !btnNo.classList.contains('fly-away') && 
        !btnNo.classList.contains('spin-away') && !btnNo.classList.contains('burn') &&
        !btnNo.classList.contains('shrink') && !btnNo.classList.contains('blur') &&
        !btnNo.classList.contains('expand-text')) {
        btnNo.style.transform = '';
    }
});

// Обработка изменения размера окна для пересчета позиций изображений
let resizeTimeout;
window.addEventListener('resize', function() {
    // Дебаунс для оптимизации - пересчитываем только после завершения изменения размера
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        setCardExclusionZone();
        saveBtnNoPosition();
        reloadImages();
    }, 300);
});

// Инициализация при загрузке страницы
window.addEventListener('DOMContentLoaded', function() {
    // Устанавливаем зону исключения для карточки после полной загрузки
    setTimeout(() => {
        setCardExclusionZone();
        saveBtnNoPosition();
        
        // Загружаем изображения после установки зоны исключения
        loadImages();
        
        // Переразмещаем изображения случайным образом
        setTimeout(() => {
            reloadImages();
        }, 500);
    }, 200);
    
    // Обновляем зону исключения при изменении размера окна
    window.addEventListener('resize', function() {
        setCardExclusionZone();
        saveBtnNoPosition();
    });
});
