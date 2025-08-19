document.addEventListener('DOMContentLoaded', () => {
    const SECTIONS = {
        'leyendo-ahora': 'Leyendo Ahora',
        'proximas-lecturas': 'Próximas Lecturas',
        'libros-terminados': 'Libros Terminados',
        'lista-deseos': 'Lista de Deseos'
    };

    const loadBooks = () => {
        const booksFromStorage = localStorage.getItem('myBooks');
        if (booksFromStorage) {
            return JSON.parse(booksFromStorage);
        }
        return [
            { id: 1, title: "Cien años de soledad", author: "Gabriel García Márquez", cover: "https://images.penguinrandomhouse.com/cover/9780593081180", section: "leyendo-ahora", currentPage: 180, totalPages: 432, notes: "Realismo mágico en su máxima expresión." },
            { id: 2, title: "Dune", author: "Frank Herbert", cover: "https://images.penguinrandomhouse.com/cover/9780593098232", section: "leyendo-ahora", currentPage: 501, totalPages: 688, notes: "" },
            { id: 3, title: "Elantris", author: "Brandon Sanderson", cover: "images/elantris.jpg", section: "proximas-lecturas", totalPages: 622, currentPage: 0 },
        ];
    };

    let booksData = loadBooks();

    const saveBooks = () => {
        localStorage.setItem('myBooks', JSON.stringify(booksData));
    };

    // --- Selectores del DOM ---
    const mainContent = document.getElementById('main-content');
    const toggleViewBtn = document.getElementById('toggle-view');
    const toggleThemeBtn = document.getElementById('toggle-theme');
    const searchBar = document.getElementById('search-bar');
    const addBookModal = document.getElementById('add-book-modal');
    const addBookForm = document.getElementById('add-book-form');
    const addBookBtn = document.getElementById('add-book-btn');
    const cancelAddBookBtn = document.getElementById('cancel-add-book');
    const totalPagesInput = document.getElementById('total-pages');
    const detailCoverContainer = document.getElementById('detail-cover-container');
    const bookDetailModal = document.getElementById('book-detail-modal');
    const detailCover = document.getElementById('detail-cover');
    const detailTitle = document.getElementById('detail-title');
    const detailAuthor = document.getElementById('detail-author');
    const detailProgressSection = document.getElementById('detail-progress-section');
    const currentPageInput = document.getElementById('current-page');
    const totalPagesDisplay = document.getElementById('total-pages-display');
    const progressBar = document.getElementById('progress-bar-fill');
    const progressPercentage = document.getElementById('progress-percentage');
    const detailNotes = document.getElementById('detail-notes');
    const saveDetailsBtn = document.getElementById('save-details-btn');
    const moveBookSelect = document.getElementById('move-book-select');
    const deleteBookModalBtn = document.getElementById('delete-book-modal-btn');
    const cancelDetailModalBtn = document.getElementById('cancel-detail-modal');
    
    const createExtraInfoHTML = (book) => {
        if (book.section === 'leyendo-ahora') {
            const currentPage = book.currentPage || 0;
            const totalPages = book.totalPages || '??';
            return `<div class="book-extra-info"><span>Página ${currentPage} de ${totalPages}</span></div>`;
        }
        if (book.section === 'libros-terminados') {
            const stars = Array.from({ length: 5 }, (_, i) => `<button class="star ${i < (book.rating || 0) ? 'filled' : ''}" data-value="${i + 1}" aria-label="Valorar con ${i + 1} estrellas">★</button>`).join('');
            return `<div class="book-extra-info"><div class="rating-stars" role="group">${stars}</div></div>`;
        }
        return '';
    };

    const createBookElement = (book) => {
        const bookArticle = document.createElement('article');
        bookArticle.className = 'book';
        bookArticle.dataset.id = book.id;
        const defaultCover = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
        bookArticle.innerHTML = `
            <img src="${book.cover || defaultCover}" alt="Portada de ${book.title}" class="book-cover" loading="lazy">
            <div class="book-info">
                <h3>${book.title}</h3>
                <p class="author">${book.author}</p>
                ${createExtraInfoHTML(book)}
            </div>
        `;
        return bookArticle;
    };

    const renderBooks = () => {
        document.querySelectorAll('.books-container').forEach(c => c.innerHTML = '');
        booksData.forEach(book => {
            const container = document.querySelector(`.books-container[data-section="${book.section}"]`);
            if (container) container.appendChild(createBookElement(book));
        });
    };
    
    const updateProgressVisuals = (currentPage, totalPages) => {
        if (!totalPages || totalPages <= 0) {
            progressPercentage.textContent = '-';
            progressBar.style.width = '0%';
            return;
        }
        const percentage = Math.round((currentPage / totalPages) * 100);
        progressPercentage.textContent = `${percentage}%`;
        progressBar.style.width = `${percentage}%`;
    };

    const openDetailModal = (bookId) => {
        const book = booksData.find(b => b.id === bookId);
        if (!book) return;
        bookDetailModal.dataset.bookId = book.id;
        detailCover.src = book.cover || '';
        detailTitle.textContent = book.title;
        detailAuthor.textContent = book.author;
        detailNotes.value = book.notes || '';
        if (book.section === 'leyendo-ahora') {
            detailProgressSection.style.display = 'block';
            const currentPage = book.currentPage || 0;
            const totalPages = book.totalPages || 0;
            currentPageInput.value = currentPage;
            currentPageInput.max = totalPages;
            totalPagesDisplay.textContent = `/ ${totalPages} páginas`;
            updateProgressVisuals(currentPage, totalPages);
        } else {
            detailProgressSection.style.display = 'none';
        }
        
        moveBookSelect.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.textContent = 'Mover a otra sección...';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        moveBookSelect.appendChild(defaultOption);
        Object.entries(SECTIONS).forEach(([key, name]) => {
            if (key !== book.section) {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = name;
                moveBookSelect.appendChild(option);
            }
        });

        bookDetailModal.showModal();
    };

    const handleSaveDetails = () => {
        const bookId = parseInt(bookDetailModal.dataset.bookId, 10);
        const book = booksData.find(b => b.id === bookId);
        if (!book) return;
        if (book.section === 'leyendo-ahora') {
            const newPage = parseInt(currentPageInput.value, 10) || 0;
            book.currentPage = newPage > book.totalPages ? book.totalPages : newPage;
        }
        book.notes = detailNotes.value;
        saveBooks();
        renderBooks();
        bookDetailModal.close();
    };

    const handleMainContentClick = (e) => {
        const bookElement = e.target.closest('.book');
        if (!bookElement) return;
        if (e.target.matches('.star')) {
            handleRateBook(parseInt(bookElement.dataset.id, 10), parseInt(e.target.dataset.value, 10));
            return;
        }
        openDetailModal(parseInt(bookElement.dataset.id, 10));
    };

    const handleDeleteBook = (bookId) => {
        booksData = booksData.filter(b => b.id !== bookId);
        renderBooks();
        saveBooks();
    };

    const handleMoveBook = (bookId, targetSection) => {
        const book = booksData.find(b => b.id === bookId);
        if (book && book.section !== targetSection) {
            book.section = targetSection;
            book.currentPage = 0;
            delete book.rating;
            renderBooks();
            saveBooks();
        }
    };
    
    const handleRateBook = (bookId, rating) => {
        const book = booksData.find(b => b.id === bookId);
        if (book) {
            book.rating = rating;
            renderBooks();
            saveBooks();
        }
    };

    const handleAddBook = (e) => {
        e.preventDefault();
        const formData = new FormData(addBookForm);
        const newBook = {
            id: Date.now(),
            title: formData.get('title'),
            author: formData.get('author'),
            cover: formData.get('cover'),
            section: formData.get('section'),
            totalPages: parseInt(totalPagesInput.value, 10) || 0,
            currentPage: 0, notes: '', rating: 0
        };
        booksData.push(newBook);
        renderBooks();
        saveBooks();
        addBookForm.reset();
        addBookModal.close();
    };

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        document.querySelectorAll('.book').forEach(bookElement => {
            const title = bookElement.querySelector('h3').textContent.toLowerCase();
            const author = bookElement.querySelector('.author').textContent.toLowerCase();
            bookElement.classList.toggle('hidden', !title.includes(query) && !author.includes(query));
        });
    };

    const setupTheme = () => {
        const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        document.body.classList.toggle('dark-mode', savedTheme === 'dark');
        toggleThemeBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    };

    const toggleTheme = () => {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        toggleThemeBtn.textContent = isDark ? '☀️' : '🌙';
    };

    // --- EVENT LISTENERS ---
    addBookBtn.addEventListener('click', () => addBookModal.showModal());
    cancelAddBookBtn.addEventListener('click', () => addBookModal.close());
    addBookForm.addEventListener('submit', handleAddBook);
    toggleViewBtn.addEventListener('click', () => {
    console.log('Botón de vista clickado. Clases actuales en <main>:', mainContent.className);
    mainContent.classList.toggle('list-view');
    console.log('Clases nuevas en <main>:', mainContent.className);
});
    toggleThemeBtn.addEventListener('click', toggleTheme);
    mainContent.addEventListener('click', handleMainContentClick);
    searchBar.addEventListener('input', handleSearch);
    saveDetailsBtn.addEventListener('click', handleSaveDetails);
    cancelDetailModalBtn.addEventListener('click', () => bookDetailModal.close());
    currentPageInput.addEventListener('input', () => {
        const bookId = parseInt(bookDetailModal.dataset.bookId, 10);
        const book = booksData.find(b => b.id === bookId);
        if (book) updateProgressVisuals(parseInt(currentPageInput.value, 10), book.totalPages);
    });
    deleteBookModalBtn.addEventListener('click', () => {
        const bookId = parseInt(bookDetailModal.dataset.bookId, 10);
        if (bookId && confirm('¿Estás seguro de que quieres eliminar este libro? Esta acción no se puede deshacer.')) {
            handleDeleteBook(bookId);
            bookDetailModal.close();
        }
    });
    detailCoverContainer.addEventListener('click', () => {
        const bookId = parseInt(bookDetailModal.dataset.bookId, 10);
        const book = booksData.find(b => b.id === bookId);
        if (!book) return;
        const newCoverUrl = prompt('Introduce la nueva URL para la portada:', book.cover || '');
        if (newCoverUrl !== null) {
            book.cover = newCoverUrl;
            detailCover.src = newCoverUrl || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
            saveBooks();
            renderBooks();
        }
    });
    
    moveBookSelect.addEventListener('change', () => {
        const bookId = parseInt(bookDetailModal.dataset.bookId, 10);
        const newSection = moveBookSelect.value;
        if (bookId && newSection) {
            handleMoveBook(bookId, newSection);
            bookDetailModal.close();
        }
    });

    // --- INICIALIZACIÓN ---
    setupTheme();
    renderBooks();
});