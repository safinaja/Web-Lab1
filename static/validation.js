document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');

    const form = document.getElementById('valForm');
    const resultsBody = document.getElementById('resultsBody');

    console.log('Form found:', !!form);
    console.log('ResultsBody found:', !!resultsBody);

    if (!form) {
        console.error('Форма не найдена!');
        alert('Ошибка: форма не найдена на странице');
        return;
    }

    if (!resultsBody) {
        console.error('Таблица результатов не найдена!');
        alert('Ошибка: таблица результатов не найдена');
        return;
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Form submitted');

        const xValue = document.getElementById('x').value;
        const rValue = document.getElementById('r').value;


        const yCheckboxes = document.querySelectorAll('input[name="y"]:checked');
        const yValues = Array.from(yCheckboxes).map(cb => cb.value);

        console.log('Input values:', {x: xValue, y: yValues, r: rValue});

        const x = parseFloat(xValue);
        const r = parseFloat(rValue);

        console.log('Parsed values:', {x, r, yValues});


        if (isNaN(x) || x < -5 || x > 5) {
            alert('X должен быть числом от -5 до 5');
            return;
        }

        if (yValues.length === 0) {
            alert('Выберите хотя бы одно значение Y');
            return;
        }

        if (isNaN(r) || r < 1 || r > 4) {
            alert('R должен быть числом от 1 до 4');
            return;
        }


        yValues.forEach(yValue => {
            const y = parseFloat(yValue);
            sendDataToServer(x, y, r);
        });//вызов асинхронной функции
    });

    async function sendDataToServer(x, y, r) {
        try {
            console.log('Sending data to server:', {x, y, r});

            const formData = new URLSearchParams();
            formData.append('x', x);
            formData.append('y', y);
            formData.append('r', r);

            const response = await fetch('/fcgi-bin/server.jar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            if (!response.ok) {
                let errorText = 'No error details';
                try {
                    errorText = await response.text();
                } catch (e) {
                    console.error('Cannot read error response:', e);
                }
                console.error('Server error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}. Details: ${errorText}`);
            }

            const data = await response.json(); 
            console.log('Success response data:', data);
            updateResultsTable(data);

        } catch (error) {
            console.error('Request error:', error);
            alert('Ошибка при отправке данных на сервер: ' + error.message);
        }
    }

    function updateResultsTable(data) {
        console.log('Updating results table with data:', data);

        if (!data.results || data.results.length === 0) {
            console.log('No results in response');
            resultsBody.innerHTML = '<tr><td colspan="6">Нет данных</td></tr>';
            return;
        }


        resultsBody.innerHTML = '';

        data.results.forEach((result, index) => {
                    console.log(`Adding result ${index}:`, result);

                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${result.x}</td>
                        <td>${result.y}</td>
                        <td>${result.r}</td>
                        <td class="${result.hit ? 'hit' : 'miss'}">
                            ${result.hit ? 'Попадание' : 'Промах'}
                        </td>
                        <td>${result.timestamp || result.currentTime || 'N/A'}</td>
                        <td>${result.workTime || result.executionTime || 0} мс</td>
                    `;


                    resultsBody.prepend(row);
                });

                console.log('Table updated successfully');
            }

    form.addEventListener('reset', function() {
        console.log('Form reset');
        resultsBody.innerHTML = '<tr><td colspan="6">Нет данных</td></tr>';
    });
});
