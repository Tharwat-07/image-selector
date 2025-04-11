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
const pageBody = document.getElementById('page-body');
const singleImageViewer = document.getElementById('single-image-viewer');
const imageElement = document.getElementById('current-image');
const sequenceElement = document.getElementById('image-sequence');
const codeDisplayElement = document.getElementById('image-code-display');
const yesButton = document.getElementById('yes-button');
const noButton = document.getElementById('no-button');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const selectedCodesTextarea = document.getElementById('selected-codes-textarea');
const copyButton = document.getElementById('copy-button');
const downloadTxtButton = document.getElementById('download-txt-button');
// --- عناصر العرض المتعدد ---
const showAllButton = document.getElementById('show-all-button');
const allImagesGrid = document.getElementById('all-images-grid');

// --- متغيرات لتتبع الحالة ---
let currentImageIndex = 0;
let currentSequenceNumber = 1;
let isGridView = false; // لتتبع حالة عرض الشبكة

// --- وظيفة لعرض الصورة الحالية (في العارض الفردي) ---
function displayCurrentImage() {
    if (currentImageIndex >= 0 && currentImageIndex < imageData.length) {
        const currentImage = imageData[currentImageIndex];
        currentSequenceNumber = currentImageIndex + 1;

        imageElement.src = currentImage.url;
        imageElement.alt = `Image ${currentSequenceNumber} - Code: ${currentImage.code}`;
        sequenceElement.textContent = currentSequenceNumber;
        codeDisplayElement.textContent = currentImage.code;
        imageElement.style.display = 'block';

        yesButton.disabled = false;
        noButton.disabled = false;
        prevButton.disabled = (currentImageIndex === 0);
        nextButton.disabled = (currentImageIndex === imageData.length - 1);

        if (currentImageIndex + 1 < imageData.length) {
            const nextImg = new Image(); nextImg.src = imageData[currentImageIndex + 1].url;
        }
        if (currentImageIndex > 0) {
             const prevImg = new Image(); prevImg.src = imageData[currentImageIndex - 1].url;
        }
    } else {
        console.error("Attempted to display image at invalid index:", currentImageIndex);
        // Handle gracefully, maybe show first image if index is invalid
        if(imageData.length > 0) {
            currentImageIndex = 0;
            displayCurrentImage(); // Try displaying the first image
        } else {
            // No images at all
            imageElement.style.display = 'none';
            sequenceElement.textContent = "-";
            codeDisplayElement.textContent = "-";
            yesButton.disabled = true; noButton.disabled = true;
            prevButton.disabled = true; nextButton.disabled = true;
        }
    }
    // Update action buttons state regardless
    const codesExist = selectedCodesTextarea.value.trim() !== '';
    copyButton.disabled = !codesExist;
    downloadTxtButton.disabled = !codesExist;
}

// --- وظيفة للانتقال للصورة التالية (تستخدمها أزرار Yes/No) ---
function advanceToNextImageForSelection() {
    currentImageIndex++;
    if (currentImageIndex >= imageData.length) {
        imageElement.style.display = 'none';
        sequenceElement.textContent = "-";
        codeDisplayElement.textContent = "-";
        alert("All images have been processed!");
        yesButton.disabled = true;
        noButton.disabled = true;
        prevButton.disabled = (currentImageIndex <= 0);
        nextButton.disabled = true;
    } else {
        displayCurrentImage();
    }
    const codesExist = selectedCodesTextarea.value.trim() !== '';
    copyButton.disabled = !codesExist;
    downloadTxtButton.disabled = !codesExist;
}

// --- وظيفة لملء شبكة الصور ---
function populateImageGrid() {
    allImagesGrid.innerHTML = ''; // Clear previous grid content

    imageData.forEach((imgData, index) => {
        // Create grid item container
        const gridItem = document.createElement('div');
        gridItem.classList.add('grid-item');
        gridItem.dataset.index = index; // Store index for click handling

        // Create image element
        const img = document.createElement('img');
        img.src = imgData.url;
        img.alt = `Image ${index + 1} - Code: ${imgData.code}`;
        img.loading = 'lazy'; // Lazy load images in the grid

        // Create code paragraph
        const codeP = document.createElement('p');
        codeP.textContent = imgData.code;

        // Append image and code to grid item
        gridItem.appendChild(img);
        gridItem.appendChild(codeP);

        // Add click listener to grid item
        gridItem.addEventListener('click', () => {
            const clickedIndex = parseInt(gridItem.dataset.index, 10);
            currentImageIndex = clickedIndex; // Update main viewer index
            displayCurrentImage(); // Show the clicked image in the main viewer
            // Switch back to single view after clicking
            toggleGridView(false); // Force hide grid view
        });

        // Append grid item to the grid container
        allImagesGrid.appendChild(gridItem);
    });
}

// --- وظيفة لتبديل عرض الشبكة/العارض الفردي ---
// Takes an optional 'forceState' (true = show grid, false = show single)
function toggleGridView(forceState = null) {
    const showGrid = forceState !== null ? forceState : !isGridView;

    if (showGrid) {
        populateImageGrid(); // Fill the grid content
        allImagesGrid.classList.remove('hidden');
        pageBody.classList.add('grid-view-active'); // Hides single viewer via CSS
        showAllButton.textContent = 'Hide All Images';
        isGridView = true;
    } else {
        allImagesGrid.classList.add('hidden');
        pageBody.classList.remove('grid-view-active'); // Shows single viewer
        showAllButton.textContent = 'Show All Images';
        isGridView = false;
        // Ensure the correct image is displayed when switching back
        displayCurrentImage();
    }
}

// --- ربط الأحداث بالأزرار ---

// Yes Button
yesButton.addEventListener('click', () => {
    if (currentImageIndex < imageData.length) {
        const currentImageCode = imageData[currentImageIndex].code;
        const textarea = selectedCodesTextarea;
        if (textarea.value.trim() === '') {
            textarea.value = currentImageCode;
        } else {
            textarea.value += '-' + currentImageCode;
        }
        advanceToNextImageForSelection();
    }
});

// No Button
noButton.addEventListener('click', () => {
    if (currentImageIndex < imageData.length) {
        advanceToNextImageForSelection();
    }
});

// Previous Image Button
prevButton.addEventListener('click', () => {
    if (currentImageIndex > 0) {
        currentImageIndex--;
        displayCurrentImage();
    }
});

// Next Image Button
nextButton.addEventListener('click', () => {
    if (currentImageIndex < imageData.length - 1) {
        currentImageIndex++;
        displayCurrentImage();
    }
});

// Show/Hide All Button
showAllButton.addEventListener('click', () => {
    toggleGridView(); // Toggle the view state
});


// --- وظائف الأزرار الأخرى (Copy, Download) --- unchanged ---
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
    link.download = 'selected_codes.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
});

// --- عرض الصورة الأولى عند تحميل الصفحة ---
displayCurrentImage(); // Initial display in single view mode