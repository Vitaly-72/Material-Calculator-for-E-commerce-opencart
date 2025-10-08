
document.addEventListener('DOMContentLoaded', function() {
    // Константы
    const WIDTH = 1.25; // ширина в метрах
    
    // Находим контейнер продукта
    const productContainer = document.getElementById('product');
    
    if (!productContainer) {
        console.log('Элемент с id="product" не найден, ищем по структуре формы');
        // Попробуем найти контейнер с формой заказа
        const possibleContainers = document.querySelectorAll('form, [class*="product"], [class*="form"]');
        if (possibleContainers.length > 0) {
            // Используем первый подходящий контейнер
            productContainer = possibleContainers[0];
        } else {
            console.error('Не удалось найти контейнер продукта');
            return;
        }
    }
    
    // Находим textarea для пояснений - ищем по name="option[...]"
    let textarea = document.querySelector('textarea[name^="option["]');
    
    // Если не нашли по name, ищем любую textarea в форме
    if (!textarea) {
        textarea = productContainer.querySelector('textarea');
    }
    
    if (!textarea) {
        console.error('Textarea не найдена в форме продукта');
        return;
    }
    
    // Находим поле quantity - ищем по name="quantity"
    let quantityInput = document.querySelector('input[name="quantity"]');
    
    // Если не нашли, ищем поле с классом содержащим "quantity"
    if (!quantityInput) {
        quantityInput = productContainer.querySelector('input[id*="quantity"], input[class*="quantity"]');
    }
    
    if (!quantityInput) {
        console.error('Поле quantity не найдено');
        return;
    }
    
    // Создаем контейнер для строк расчета
    const calculationContainer = document.createElement('div');
    calculationContainer.id = 'material-calculator';
    calculationContainer.style.marginBottom = '20px';
    calculationContainer.style.padding = '15px';
    calculationContainer.style.border = '1px solid #e0e0e0';
    calculationContainer.style.borderRadius = '8px';
    calculationContainer.style.backgroundColor = '#f8f9fa';
    
    // Массив для хранения данных строк
    let calculationRows = [];
    
    // Функция для проверки мобильного устройства
    function isMobile() {
        return window.innerWidth <= 768;
    }
    
    // Функция для обновления textarea и квадратуры
    function updateCalculations() {
        // Обновляем textarea
        const descriptions = calculationRows
            .filter(row => row.length > 0 && row.quantity > 0)
            .map(row => `${row.length}м-${row.quantity}шт.`);
        
        textarea.value = descriptions.join('; ');
        if (descriptions.length === 0) {
            textarea.value = ''; // Очищаем если нет данных
        }
        
        // Рассчитываем общую квадратуру
        let totalArea = 0;
        calculationRows.forEach(row => {
            if (row.length > 0 && row.quantity > 0) {
                totalArea += parseFloat(row.length) * parseInt(row.quantity) * WIDTH;
            }
        });
        
        // Обновляем поле количества (квадратура)
        quantityInput.value = totalArea > 0 ? totalArea.toFixed(3) : '1.000';
    }
    
    // Функция для обновления layout при изменении размера окна
    function updateLayout() {
        calculationRows.forEach(row => {
            if (isMobile()) {
                // Мобильный layout
                row.element.style.flexDirection = 'column';
                row.element.style.alignItems = 'stretch';
                row.fieldsContainer.style.flexDirection = 'row';
                row.fieldsContainer.style.justifyContent = 'space-between';
                row.fieldsContainer.style.marginBottom = '8px';
                row.lengthContainer.style.flex = '1';
                row.quantityContainer.style.flex = '1';
                row.lengthInput.style.maxWidth = 'none';
                row.quantityInput.style.maxWidth = 'none';
                row.buttonsContainer.style.flexDirection = 'row';
                row.buttonsContainer.style.justifyContent = 'center';
                row.buttonsContainer.style.gap = '10px';
                row.deleteButton.style.minWidth = '60px';
                row.addButton.style.minWidth = '60px';
            } else {
                // Десктопный layout
                row.element.style.flexDirection = 'row';
                row.element.style.alignItems = 'flex-end';
                row.fieldsContainer.style.flexDirection = 'row';
                row.fieldsContainer.style.marginBottom = '0';
                row.fieldsContainer.style.gap = '8px';
                row.lengthContainer.style.flex = '1';
                row.quantityContainer.style.flex = '1';
                row.lengthInput.style.maxWidth = '80px';
                row.quantityInput.style.maxWidth = '70px';
                row.buttonsContainer.style.flexDirection = 'row';
                row.buttonsContainer.style.gap = '8px';
                row.deleteButton.style.minWidth = '36px';
                row.addButton.style.minWidth = '36px';
            }
        });
    }
    
    // Функция для создания строки расчета
    function createCalculationRow() {
        const rowId = Date.now() + Math.random(); // уникальный ID
        
        const rowDiv = document.createElement('div');
        rowDiv.className = 'calculation-row';
        rowDiv.style.display = 'flex';
        rowDiv.style.marginBottom = '12px';
        rowDiv.style.gap = '8px';
        
        // Контейнер для полей ввода (длина + количество)
        const fieldsContainer = document.createElement('div');
        fieldsContainer.style.display = 'flex';
        fieldsContainer.style.flex = '1';
        fieldsContainer.style.gap = '8px';
        
        // Контейнер для длины
        const lengthContainer = document.createElement('div');
        lengthContainer.style.flex = '1';
        
        const lengthLabel = document.createElement('label');
        lengthLabel.className = 'control-label';
        lengthLabel.textContent = 'Длина(м.)';
        lengthLabel.style.display = 'block';
        lengthLabel.style.marginBottom = '4px';
        lengthLabel.style.fontWeight = '600';
        lengthLabel.style.fontSize = '12px';
        lengthLabel.style.color = '#555';
        
        const lengthInput = document.createElement('input');
        lengthInput.type = 'number';
        lengthInput.step = '0.1';
        lengthInput.min = '0.1';
        lengthInput.className = 'form-control calculation-length';
        lengthInput.placeholder = '0.0';
        lengthInput.style.width = '100%';
        lengthInput.style.padding = '8px';
        lengthInput.style.border = '1px solid #ccc';
        lengthInput.style.borderRadius = '4px';
        lengthInput.style.boxSizing = 'border-box';
        lengthInput.style.fontSize = '14px';
        
        lengthContainer.appendChild(lengthLabel);
        lengthContainer.appendChild(lengthInput);
        
        // Контейнер для количества
        const quantityContainer = document.createElement('div');
        quantityContainer.style.flex = '1';
        
        const quantityLabel = document.createElement('label');
        quantityLabel.className = 'control-label';
        quantityLabel.textContent = 'Кол-во(шт.)';
        quantityLabel.style.display = 'block';
        quantityLabel.style.marginBottom = '4px';
        quantityLabel.style.fontWeight = '600';
        quantityLabel.style.fontSize = '12px';
        quantityLabel.style.color = '#555';
        
        const quantityRowInput = document.createElement('input');
        quantityRowInput.type = 'number';
        quantityRowInput.min = '1';
        quantityRowInput.value = '1';
        quantityRowInput.className = 'form-control calculation-quantity';
        quantityRowInput.placeholder = '1';
        quantityRowInput.style.width = '100%';
        quantityRowInput.style.padding = '8px';
        quantityRowInput.style.border = '1px solid #ccc';
        quantityRowInput.style.borderRadius = '4px';
        quantityRowInput.style.boxSizing = 'border-box';
        quantityRowInput.style.fontSize = '14px';
        
        quantityContainer.appendChild(quantityLabel);
        quantityContainer.appendChild(quantityRowInput);
        
        // Добавляем поля в контейнер
        fieldsContainer.appendChild(lengthContainer);
        fieldsContainer.appendChild(quantityContainer);
        
        // Контейнер для кнопок
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.gap = '8px';
        buttonsContainer.style.alignItems = 'center';
        
        // Кнопка удаления
        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'btn calculation-delete-btn';
        deleteButton.textContent = '×';
        deleteButton.style.padding = '8px 12px';
        deleteButton.style.border = 'none';
        deleteButton.style.borderRadius = '4px';
        deleteButton.style.cursor = 'pointer';
        deleteButton.style.fontWeight = 'bold';
        deleteButton.style.fontSize = '16px';
        deleteButton.style.transition = 'all 0.3s';
        deleteButton.style.minWidth = '36px';
        deleteButton.style.height = '36px';
        deleteButton.style.display = 'flex';
        deleteButton.style.alignItems = 'center';
        deleteButton.style.justifyContent = 'center';
        deleteButton.style.backgroundColor = '#dc3545';
        deleteButton.style.color = 'white';
        deleteButton.title = 'Удалить строку';
        deleteButton.style.flexShrink = '0';
        
        // Кнопка добавления
        const addButton = document.createElement('button');
        addButton.type = 'button';
        addButton.className = 'btn calculation-add-btn';
        addButton.textContent = '+';
        addButton.style.padding = '8px 12px';
        addButton.style.border = 'none';
        addButton.style.borderRadius = '4px';
        addButton.style.cursor = 'pointer';
        addButton.style.fontWeight = 'bold';
        addButton.style.fontSize = '16px';
        addButton.style.transition = 'all 0.3s';
        addButton.style.minWidth = '36px';
        addButton.style.height = '36px';
        addButton.style.display = 'flex';
        addButton.style.alignItems = 'center';
        addButton.style.justifyContent = 'center';
        addButton.style.backgroundColor = '#28a745';
        addButton.style.color = 'white';
        addButton.title = 'Добавить строку';
        addButton.style.flexShrink = '0';
        
        // Эффекты при наведении
        const buttonHoverEffect = function() {
            this.style.transform = 'scale(1.1)';
            this.style.opacity = '0.9';
        };
        
        const buttonHoverOut = function() {
            this.style.transform = 'scale(1)';
            this.style.opacity = '1';
        };
        
        deleteButton.onmouseover = buttonHoverEffect;
        deleteButton.onmouseout = buttonHoverOut;
        addButton.onmouseover = buttonHoverEffect;
        addButton.onmouseout = buttonHoverOut;
        
        deleteButton.onclick = function() {
            removeRow(rowId);
        };
        
        addButton.onclick = function() {
            addNewRow();
        };
        
        buttonsContainer.appendChild(deleteButton);
        buttonsContainer.appendChild(addButton);
        
        // Собираем строку
        rowDiv.appendChild(fieldsContainer);
        rowDiv.appendChild(buttonsContainer);
        
        // Сохраняем ссылки на элементы
        const rowData = {
            id: rowId,
            element: rowDiv,
            fieldsContainer: fieldsContainer,
            lengthContainer: lengthContainer,
            quantityContainer: quantityContainer,
            lengthInput: lengthInput,
            quantityInput: quantityRowInput,
            buttonsContainer: buttonsContainer,
            deleteButton: deleteButton,
            addButton: addButton,
            length: 0,
            quantity: 0
        };
        
        // Добавляем обработчики изменения для полей ввода
        function handleInputChange() {
            const length = parseFloat(lengthInput.value) || 0;
            const quantity = parseInt(quantityRowInput.value) || 0;
            
            rowData.length = length;
            rowData.quantity = quantity;
            
            updateCalculations();
        }
        
        lengthInput.addEventListener('input', handleInputChange);
        quantityRowInput.addEventListener('input', handleInputChange);
        
        // Ограничиваем ввод до 7 символов
        lengthInput.addEventListener('input', function() {
            if (this.value.length > 7) {
                this.value = this.value.slice(0, 7);
            }
        });
        
        quantityRowInput.addEventListener('input', function() {
            if (this.value.length > 7) {
                this.value = this.value.slice(0, 7);
            }
        });
        
        return rowData;
    }
    
    // Функция для добавления новой строки
    function addNewRow() {
        // Создаем новую строку
        const newRow = createCalculationRow();
        calculationContainer.appendChild(newRow.element);
        calculationRows.push(newRow);
        
        // Обновляем layout
        updateLayout();
        updateCalculations();
        
        // Фокусируемся на поле длины новой строки
        newRow.lengthInput.focus();
    }
    
    // Функция для удаления строки
    function removeRow(rowId) {
        const rowIndex = calculationRows.findIndex(row => row.id === rowId);
        if (rowIndex !== -1) {
            const row = calculationRows[rowIndex];
            
            // Удаляем элемент из DOM
            row.element.remove();
            
            // Удаляем из массива
            calculationRows.splice(rowIndex, 1);
            
            // Если удалили все строки, создаем первую строку заново
            if (calculationRows.length === 0) {
                addNewRow();
            }
            
            updateCalculations();
        }
    }
    
    // Инициализация - создаем первую строку
    addNewRow();
    
    // Добавляем заголовок и информацию
    const title = document.createElement('h4');
    title.textContent = ' Расчет материалов';
    title.style.marginBottom = '8px';
    title.style.color = '#333';
    title.style.fontSize = '16px';
    title.style.fontWeight = '600';
    
    const info = document.createElement('div');
    info.innerHTML = '<small style="font-size: 12px; color: #666;">Ширина материала: <strong>' + WIDTH + 'м</strong></small>';
    info.style.marginBottom = '12px';
    
    calculationContainer.insertBefore(info, calculationContainer.firstChild);
    calculationContainer.insertBefore(title, calculationContainer.firstChild);
    
    // Вставляем калькулятор перед textarea
    const textareaParent = textarea.parentNode;
    if (textareaParent) {
        textareaParent.insertBefore(calculationContainer, textarea);
    } else {
        // Если не нашли родителя, вставляем в контейнер продукта
        productContainer.insertBefore(calculationContainer, productContainer.firstChild);
    }
    
    // Обработчик изменения размера окна
    window.addEventListener('resize', updateLayout);
    
    // Инициализируем layout
    updateLayout();
    
    console.log('✅ Адаптивный калькулятор материалов успешно инициализирован');
});
