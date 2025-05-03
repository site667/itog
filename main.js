 // Form submission
 document.getElementById('rsvp-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Получаем элементы
    const successMessage = document.getElementById('success-message');
    const submitBtn = document.getElementById('submit-btn');
    const nameInput = document.getElementById('name');
    const attendanceInput = document.querySelector('input[name="attendance"]:checked');
    
    // Блокируем кнопку и меняем текст
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка...';
        if (!nameInput.value.trim()) {
            alert('Пожалуйста, введите ваше имя и фамилию');
            nameInput.focus();
            successMessage.classList.remove('show');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Отправить ответ';
            return;
        }
        
        if (!attendanceInput) {
            alert('Пожалуйста, укажите, придёте ли вы на свадьбу');
            successMessage.classList.remove('show');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Отправить ответ';
            return;
        }
        
        // Собираем данные формы
        const formData = new FormData(this);
        const data = {};
        formData.forEach((value, key) => {
            if (key === 'drink') {
                if (!data[key]) data[key] = [];
                data[key].push(value);
            } else {
                data[key] = value;
            }
        });
        
        // Формируем сообщение для Telegram
        const message = `Новый ответ на приглашение:
Имя: ${data.name}
Присутствие: ${data.attendance === 'yes' ? 'Придет' : 'Не придет'}
Напитки: ${data.drink ? getDrinkPreference(data.drink) : 'Не указано'}
Аллергии: ${data.allergies || 'Нет'}`;
        
        try {
            // Здесь нужно указать ваш токен бота и chat_id
            const { botToken, chatId } = window.telegramConfig || {};
            if (!botToken || !chatId) {
  throw new Error('Конфигурация Telegram не найдена');
}
            // Отправка в Telegram
            const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message
                })
            });
            
            const result = await response.json();
            
            if (result.ok) {
            // Показываем сообщение об успехе
            successMessage.style.display = 'block';
            
            // Очищаем форму
            this.reset();
            
            // Скрываем сообщение через 5 секунд
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 5000);
        } else {
            throw new Error('Ошибка при отправке в Telegram');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Произошла ошибка при отправке формы. Пожалуйста, попробуйте ещё раз.');
    } finally {
        // Всегда восстанавливаем кнопку
        submitBtn.disabled = false;
        submitBtn.textContent = 'Отправить ответ';
    }
});