document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CGPA/SGPA <-> Percentage Conversion Logic ---
    const conversionInput = document.getElementById('conversion-input');
    const conversionOutput = document.getElementById('conversion-output');
    const swapBtn = document.getElementById('swap-btn');
    const conversionLabel = document.getElementById('conversion-label');
    const formulaDisplay = document.getElementById('formula-display');

    let isPercentageMode = false; // False: CGPA/SGPA -> Percentage, True: Percentage -> CGPA

    function updateConversion() {
        const val = parseFloat(conversionInput.value);
        if (isNaN(val)) {
            conversionOutput.textContent = '—';
            return;
        }

        if (!isPercentageMode) {
            // AKTU Formula: Percentage = (CGPA - 0.75) * 10
            const percentage = (val - 0.75) * 10;
            conversionOutput.textContent = percentage >= 0 ? percentage.toFixed(2) + '%' : '0.00%';
        } else {
            // Reverse Formula: CGPA = (Percentage / 10) + 0.75
            const cgpa = (val / 10) + 0.75;
            conversionOutput.textContent = cgpa <= 10 ? cgpa.toFixed(2) : '10.00';
        }
    }

    conversionInput.addEventListener('input', updateConversion);

    swapBtn.addEventListener('click', () => {
        isPercentageMode = !isPercentageMode;
        if (isPercentageMode) {
            conversionLabel.textContent = 'Percentage';
            conversionInput.placeholder = 'e.g. 77.5';
            formulaDisplay.textContent = 'Formula: CGPA = (Percentage ÷ 10) + 0.75';
        } else {
            conversionLabel.textContent = 'CGPA / SGPA';
            conversionInput.placeholder = 'e.g. 8.5';
            formulaDisplay.textContent = 'Formula: Percentage = (CGPA − 0.75) × 10';
        }
        conversionInput.value = '';
        conversionOutput.textContent = '—';
    });


    // --- 2. Calculator Tabs Switcher ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const calcPanels = document.querySelectorAll('.calc-panel');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            calcPanels.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const target = btn.getAttribute('data-tab');
            document.getElementById(`${target}-panel`).classList.add('active');
        });
    });


    // --- 3. SGPA Calculator Dynamic Rows & Calculation ---
    const gradePointsMap = {
        'O': 10,
        'A+': 9,
        'A': 8,
        'B+': 7,
        'B': 6,
        'C': 5,
        'P': 4,
        'F': 0
    };

    const subjectRowsContainer = document.getElementById('subject-rows-container');
    const addSubjectBtn = document.getElementById('add-subject-btn');
    const sgpaResultValue = document.getElementById('sgpa-result-value');

    function createSgpaRow() {
        const row = document.createElement('div');
        row.className = 'dynamic-row';

        row.innerHTML = `
            <input type="number" class="sgpa-credit" placeholder="e.g. 4" min="1" max="10" value="4">
            <select class="sgpa-grade">
                <option value="" disabled selected>Select grade</option>
                <option value="O">O (10)</option>
                <option value="A+">A+ (9)</option>
                <option value="A">A (8)</option>
                <option value="B+">B+ (7)</option>
                <option value="B">B (6)</option>
                <option value="C">C (5)</option>
                <option value="P">P (4)</option>
                <option value="F">F (0)</option>
            </select>
            <button type="button" class="delete-row-btn">&times;</button>
        `;

        row.querySelector('.delete-row-btn').addEventListener('click', () => {
            row.remove();
            calculateSGPA();
        });

        row.querySelectorAll('input, select').forEach(element => {
            element.addEventListener('input', calculateSGPA);
        });

        subjectRowsContainer.appendChild(row);
    }

    function calculateSGPA() {
        const rows = subjectRowsContainer.querySelectorAll('.dynamic-row');
        let totalCreditPoints = 0;
        let totalCredits = 0;

        rows.forEach(row => {
            const credit = parseFloat(row.querySelector('.sgpa-credit').value);
            const gradeKey = row.querySelector('.sgpa-grade').value;

            if (!isNaN(credit) && gradeKey in gradePointsMap) {
                totalCreditPoints += credit * gradePointsMap[gradeKey];
                totalCredits += credit;
            }
        });

        if (totalCredits > 0) {
            const sgpa = totalCreditPoints / totalCredits;
            sgpaResultValue.textContent = sgpa.toFixed(2);
        } else {
            sgpaResultValue.textContent = '0.00';
        }
    }

    addSubjectBtn.addEventListener('click', () => {
        createSgpaRow();
    });

    // Initialize with 3 rows by default
    for (let i = 0; i < 3; i++) {
        createSgpaRow();
    }


    // --- 4. CGPA Calculator Dynamic Rows & Calculation ---
    const cgpaRowsContainer = document.getElementById('cgpa-rows-container');
    const addSemBtn = document.getElementById('add-sem-btn');
    const cgpaResultValue = document.getElementById('cgpa-result-value');

    function createCgpaRow() {
        const row = document.createElement('div');
        row.className = 'dynamic-row';
        // Adjust grid template for 3 items + delete icon
        row.style.gridTemplateColumns = '1.2fr 1.2fr 1fr 30px';

        row.innerHTML = `
            <input type="text" placeholder="Sem" value="Sem ${cgpaRowsContainer.children.length + 1}">
            <input type="number" class="cgpa-sgpa-val" placeholder="e.g. 8.2" step="0.01" min="0" max="10">
            <input type="number" class="cgpa-credit-val" placeholder="e.g. 20" min="1" max="50" value="20">
            <button type="button" class="delete-row-btn">&times;</button>
        `;

        row.querySelector('.delete-row-btn').addEventListener('click', () => {
            row.remove();
            calculateCGPA();
        });

        row.querySelectorAll('input').forEach(element => {
            element.addEventListener('input', calculateCGPA);
        });

        cgpaRowsContainer.appendChild(row);
    }

    function calculateCGPA() {
        const rows = cgpaRowsContainer.querySelectorAll('.dynamic-row');
        let totalWeightedPoints = 0;
        let totalCredits = 0;

        rows.forEach(row => {
            const sgpa = parseFloat(row.querySelector('.cgpa-sgpa-val').value);
            const credits = parseFloat(row.querySelector('.cgpa-credit-val').value);

            if (!isNaN(sgpa) && !isNaN(credits)) {
                totalWeightedPoints += sgpa * credits;
                totalCredits += credits;
            }
        });

        if (totalCredits > 0) {
            const cgpa = totalWeightedPoints / totalCredits;
            cgpaResultValue.textContent = cgpa.toFixed(2);
        } else {
            cgpaResultValue.textContent = '0.00';
        }
    }

    addSemBtn.addEventListener('click', () => {
        createCgpaRow();
    });

    // Initialize with 2 rows by default
    for (let i = 0; i < 2; i++) {
        createCgpaRow();
    }
});
