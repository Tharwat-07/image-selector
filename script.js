// --- إنشاء قائمة بيانات الصور تلقائيًا من 1 إلى 256 ---
const imageData = [];
const totalImages = 256; // العدد الإجمالي للصور

for (let i = 1; i <= totalImages; i++) {
    const imageCode = String(i).padStart(2, '0');
    const imageUrl = `images/s (${i}).jpg`;
    imageData.push({ code: imageCode, url: imageUrl });
}
// -------------------------------------------------------------

// --- الحصول على عناصر الصفحة ---
const imageElement = document.getElementById('current-image');
const sequenceElement = document.getElementById('image-sequence');
const codeDisplayElement = document.getElementById('image-code-display');
// --- أزرار التحكم ---
const yesButton = document.getElementById('yes-button');
const noButton = document.getElementById('no-button');
// --- أزرار التنقل ---
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
// --- منطقة الأكواد ---
const selectedCodesTextarea = document.getElementById('selected-codes-textarea');
// --- أزرار العمل ---
const copyButton = document.getElementById('copy-button');
const downloadTxtButton = document.getElementById('download-txt-button');
// --- تم حذف زر التراجع ومتغيراته ---

// --- متغيرات لتتبع الحالة ---
let currentImageIndex = 0;
let currentSequenceNumber = 1; // يمثل الرقم الظاهر للمستخدم

// --- وظيفة لعرض الصورة الحالية وتحديث حالة الأزرار ---
function displayCurrentImage() {
    // Check if index is valid
    if (currentImageIndex >= 0 && currentImageIndex < imageData.length) {
        const currentImage = imageData[currentImageIndex];
        // تحديث الرقم التسلسلي ليتوافق مع المؤشر (المؤشر يبدأ من 0)
        currentSequenceNumber = currentImageIndex + 1;

        imageElement.src = currentImage.url;
        imageElement.alt = `Image ${currentSequenceNumber} - Code: ${currentImage.code}`;
        sequenceElement.textContent = currentSequenceNumber;
        codeDisplayElement.textContent = currentImage.code;
        imageElement.style.display = 'block';

        // تمكين أزرار Yes/No دائما طالما هناك صورة معروضة
        yesButton.disabled = false;
        noButton.disabled = false;

        // تمكين/تعطيل أزرار التنقل
        prevButton.disabled = (currentImageIndex === 0);
        nextButton.disabled = (currentImageIndex === imageData.length - 1);

        // Preload next/prev image (optional optimization)
        if (currentImageIndex + 1 < imageData.length) {
            const nextImg = new Image();
            nextImg.src = imageData[currentImageIndex + 1].url;
        }
        if (currentImageIndex > 0) {
             const prevImg = new Image();
             prevImg.src = imageData[currentImageIndex - 1].url;
        }

    } else {
        // Handle out-of-bounds index - shouldn't normally happen with disabled buttons
        // but good practice to have a fallback.
        // Could display a "No image" message or revert to a valid index.
        // For now, just log an error and potentially disable everything.
        console.error("Attempted to display image at invalid index:", currentImageIndex);
        imageElement.style.display = 'none';
        sequenceElement.textContent = "-";
        codeDisplayElement.textContent = "-";
        yesButton.disabled = true;
        noButton.disabled = true;
        prevButton.disabled = true;
        nextButton.disabled = true;
    }

    // تعطيل أزرار النسخ والتحميل إذا كان مربع النص فارغًا
    const codesExist = selectedCodesTextarea.value.trim() !== '';
    copyButton.disabled = !codesExist;
    downloadTxtButton.disabled = !codesExist;
}

// --- وظيفة للانتقال للصورة التالية (تستخدمها أزرار Yes/No) ---
function advanceToNextImageForSelection() {
    // هذه الوظيفة خاصة بـ Yes/No وتتعامل مع الوصول لنهاية القائمة
    currentImageIndex++;
    if (currentImageIndex >= imageData.length) {
        // وصلنا للنهاية بعد ضغط Yes/No على آخر صورة
        imageElement.style.display = 'none';
        sequenceElement.textContent = "-";
        codeDisplayElement.textContent = "-";
        alert("All images have been processed!");
        yesButton.disabled = true;
        noButton.disabled = true;
        // أزرار التنقل تبقى ممكنة إذا لم تكن على الحواف
        prevButton.disabled = (currentImageIndex <= 0); // Should be true if length > 0
        nextButton.disabled = true; // Definitely disabled
    } else {
        // إذا لم نصل للنهاية، فقط عرض الصورة التالية
        displayCurrentImage();
    }
     // تعطيل أزرار النسخ والتحميل إذا كان مربع النص فارغًا
    const codesExist = selectedCodesTextarea.value.trim() !== '';
    copyButton.disabled = !codesExist;
    downloadTxtButton.disabled = !codesExist;
}


// --- ربط الأحداث بالأزرار ---

// Yes Button - Add code and ADVANCE
yesButton.addEventListener('click', () => {
    if (currentImageIndex < imageData.length) {
        const currentImageCode = imageData[currentImageIndex].code;
        const textarea = selectedCodesTextarea;

        if (textarea.value.trim() === '') {
            textarea.value = currentImageCode;
        } else {
            textarea.value += '-' + currentImageCode;
        }
        // Use the dedicated advance function for Yes/No
        advanceToNextImageForSelection();
    }
});

// No Button - Skip and ADVANCE
noButton.addEventListener('click', () => {
    if (currentImageIndex < imageData.length) {
        // Use the dedicated advance function for Yes/No
        advanceToNextImageForSelection();
    }
});

// Previous Image Button - Just navigate
prevButton.addEventListener('click', () => {
    if (currentImageIndex > 0) {
        currentImageIndex--; // فقط نقص المؤشر
        displayCurrentImage(); // واعرض الصورة في هذا المؤشر
    }
});

// Next Image Button - Just navigate
nextButton.addEventListener('click', () => {
    if (currentImageIndex < imageData.length - 1) {
        currentImageIndex++; // فقط زد المؤشر
        displayCurrentImage(); // واعرض الصورة في هذا المؤشر
    }
});


// --- وظائف الأزرار الأخرى (Copy, Download) ---

// Copy Button
copyButton.addEventListener('click', () => {
    const codesToCopy = selectedCodesTextarea.value;
    if (codesToCopy) {
        navigator.clipboard.writeText(codesToCopy)
            .then(() => {
                alert('Codes copied to clipboard!');
                const originalText = copyButton.textContent;
                copyButton.textContent = 'Copied!';
                copyButton.disabled = true;
                setTimeout(() => {
                   copyButton.textContent = originalText;
                   copyButton.disabled = selectedCodesTextarea.value.trim() === '';
                }, 1500);
            })
            .catch(err => {
                console.error('Failed to copy codes: ', err);
                alert('Failed to copy codes. See console for details.');
            });
    } else {
        alert('No codes selected to copy.');
    }
});

// Download TXT Button
downloadTxtButton.addEventListener('click', () => {
    const textToSave = selectedCodesTextarea.value;
    if (!textToSave) {
        alert('No codes selected to download.');
        return;
    }

    const blob = new Blob([textToSave], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'selected_codes.txt'; // Filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
});

// --- عرض الصورة الأولى عند تحميل الصفحة ---
displayCurrentImage();