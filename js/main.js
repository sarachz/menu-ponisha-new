        function toPersianDigits(str) {
            const enToFa = { '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴', '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹' };
            return String(str).replace(/\d/g, d => enToFa[d] || d);
        }

        function loadMenu() {
            return new Promise((resolve, reject) => {
                const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTQZg_Y95sX5trO8hh1FLX5Vn5IjCFKVxwKJXD7mais851Imcb9i3Uq2Da4HGFW3kVjYFB7nwAGEnfH/pub?output=csv";

                let menuData = [];
                let categories = [];

                function setActiveCategory(index) {
                    document.querySelectorAll('.cat-item').forEach(el => el.classList.remove('active'));
                    const target = document.querySelector(`[data-index="${index}"]`);
                    if (target) target.classList.add('active');
                }

                function buildCategories() {
                    const wrap = document.getElementById('categories');
                    wrap.innerHTML = '';
                    categories.forEach((cat, i) => {
                        const idx = i + 1;
                        const div = document.createElement('div');
                        div.className = 'cat-item';
                        div.dataset.index = idx;

                        const iconBox = document.createElement('div');
                        iconBox.className = 'icon-box';

                        const img = document.createElement('img');
                        const slug = cat.replace(/[^\u0600-\u06FF0-9a-zA-Z]+/g, '_');
                        img.src = 'icons/' + slug + '.png';
                        img.onerror = () => { img.src = ''; };
                        iconBox.appendChild(img);

                        const label = document.createElement('div');
                        label.className = 'label';
                        label.textContent = cat;

                        div.appendChild(iconBox);
                        div.appendChild(label);

                        div.addEventListener('click', () => {
                            const section = document.getElementById('cat' + idx);
                            if (section) {

                                const scrollContainer = document.querySelector('.content');
                                if (scrollContainer && scrollContainer.scrollHeight > scrollContainer.clientHeight) {

                                    section.scrollIntoView();

                                    const containerRect = scrollContainer.getBoundingClientRect();
                                    const sectionRect = section.getBoundingClientRect();
                                    scrollContainer.scrollTop += (sectionRect.top - containerRect.top - 20);
                                } else {

                                    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                                setActiveCategory(idx);
                            }
                        });

                        wrap.appendChild(div);
                    });

                    if (wrap.children.length > 0) {
                        wrap.children[0].classList.add('active');
                    }
                }

                function buildSections() {
                    const root = document.getElementById('root');
                    root.innerHTML = '';
                    categories.forEach((cat, i) => {
                        const idx = i + 1;
                        const sec = document.createElement('section');
                        sec.className = 'cafelist';
                        sec.id = 'cat' + idx;

                        const title = document.createElement('div');
                        title.className = 'cat-title';
                        title.textContent = cat;
                        sec.appendChild(title);

                        const products = menuData.filter(p => p.category === cat);
                        if (products.length === 0) {
                            const empty = document.createElement('div');
                            empty.style.textAlign = 'center';
                            empty.style.padding = '16px';
                            empty.style.color = '#888';
                            empty.textContent = 'محصولی وجود ندارد.';
                            sec.appendChild(empty);
                        }

                        products.forEach(prod => {
                            const item = document.createElement('div');
                            item.className = 'product';

                            const imgBox = document.createElement('div');
                            imgBox.className = 'img-box';
                            const img = document.createElement('img');
                            img.src = prod.img || '';
                            img.onerror = () => { img.src = 'https://via.placeholder.com/100x80/e0e0e0/999?text=No+Image'; };
                            imgBox.appendChild(img);

                            const info = document.createElement('div');
                            info.className = 'info';

                            const h2 = document.createElement('h2');
                            h2.textContent = (prod.name || '')
                                .replace(/[.,،;؛\-–—_]+/g, ' ')
                                .replace(/\s+/g, ' ')
                                .trim();

                            const desc = document.createElement('div');
                            desc.className = 'desc';
                            desc.textContent = (prod.desc || '')
                                .replace(/[.,،;؛\-–—_]+/g, ' ')
                                .replace(/\s+/g, ' ')
                                .trim();

                            info.appendChild(h2);
                            info.appendChild(desc);

                            const priceBox = document.createElement('div');
                            priceBox.className = 'price';
                            priceBox.textContent = prod.price ? toPersianDigits(prod.price) : '';

                            const infoWrapper = document.createElement('div');
                            infoWrapper.className = 'info-wrapper';
                            infoWrapper.appendChild(info);
                            infoWrapper.appendChild(priceBox);

                            item.appendChild(imgBox);
                            item.appendChild(infoWrapper);

                            sec.appendChild(item);
                        });

                        root.appendChild(sec);
                    });
                }


                function setupScrollObserver() {
                    const sections = Array.from(document.querySelectorAll('.cafelist'));
                    const sidebarItems = Array.from(document.querySelectorAll('.cat-item'));
                    const scrollContainer = document.querySelector('.content');

                    if (sections.length === 0 || sidebarItems.length === 0) return;

                    let container, getOffsetTop, getViewportMid;


                    if (scrollContainer && scrollContainer.scrollHeight > scrollContainer.clientHeight) {

                        container = scrollContainer;
                        getOffsetTop = el => {
                            let offsetTop = 0;
                            let current = el;
                            while (current && current !== scrollContainer) {
                                offsetTop += current.offsetTop;
                                current = current.offsetParent;
                            }
                            return offsetTop;
                        };
                        getViewportMid = () => scrollContainer.scrollTop + scrollContainer.clientHeight / 2;
                    } else {

                        container = window;
                        getOffsetTop = el => el.getBoundingClientRect().top + window.scrollY;
                        getViewportMid = () => window.scrollY + window.innerHeight / 2;
                    }

                    function setActiveOnScroll() {
                        const midpoint = getViewportMid();
                        let currentSection = null;


                        for (let i = sections.length - 1; i >= 0; i--) {
                            const section = sections[i];
                            const top = getOffsetTop(section);
                            const bottom = top + section.offsetHeight;

                            if (top <= midpoint && midpoint < bottom) {
                                currentSection = section;
                                break;
                            }
                        }

                        if (currentSection) {
                            const index = currentSection.id.replace('cat', '');
                            sidebarItems.forEach(item => item.classList.remove('active'));
                            const activeItem = document.querySelector(`[data-index="${index}"]`);
                            if (activeItem) {
                                activeItem.classList.add('active');
                            }
                        }
                    }

                    setActiveOnScroll();
                    container.addEventListener('scroll', setActiveOnScroll);
                }

                function parseCSV(csv) {
                    const lines = csv.trim().split('\n');
                    if (!lines.length) return { headers: [], rows: [] };

                    let first = lines[0].replace(/^\uFEFF/, '');
                    const headers = first.split(',').map(h => h.replace(/^"|"$/g, '').trim().toLowerCase());
                    const rows = [];

                    for (let i = 1; i < lines.length; i++) {
                        let line = lines[i].trim();
                        if (!line) continue;

                        const fields = [];
                        let quote = false;
                        let current = '';

                        for (let j = 0; j < line.length; j++) {
                            const c = line[j];
                            if (c === '"') {
                                if (quote && line[j + 1] === '"') {
                                    current += '"';
                                    j++;
                                } else {
                                    quote = !quote;
                                }
                            } else if (c === ',' && !quote) {
                                fields.push(current);
                                current = '';
                            } else {
                                current += c;
                            }
                        }
                        fields.push(current);
                        rows.push(fields.map(f => f.replace(/^"|"$/g, '').trim()));
                    }

                    return { headers, rows };
                }

                fetch(sheetURL)
                    .then(res => res.ok ? res.text() : Promise.reject('خطا در بارگذاری شیت'))
                    .then(csv => {
                        const { headers, rows } = parseCSV(csv);
                        if (!rows.length) throw 'هیچ داده‌ای وجود ندارد';

                        menuData = rows.map((cells, idx) => {
                            const map = {};
                            headers.forEach((h, i) => map[h] = cells[i] || '');
                            return {
                                img: map.image || map.img || map.image_url || cells[0] || '',
                                desc: map.description || map.desc || cells[1] || '',
                                name: map.name || map.title || map.item || cells[2] || `آیتم ${idx + 1}`,
                                category: map.category || map.cat || cells[3] || 'بدون دسته',
                                price: map.price || cells[4] || ''
                            };
                        }).filter(p => p.name.trim());

                        categories = [...new Set(menuData.map(p => p.category))];

                        buildCategories();
                        buildSections();

                        setTimeout(() => {
                            const content = document.querySelector('.content');
                            if (content) content.classList.add('visible');
                        }, 150);
                        setTimeout(() => {
                            const sidebar = document.querySelector('.sidebar');
                            if (sidebar) sidebar.classList.add('visible');
                        }, 50);

                        setupScrollObserver(); // ✅ نسخه هوشمند
                        window.menuLoaded = true;
                        resolve();
                    })
                    .catch(err => {
                        console.error(err);
                        reject(err);
                    });
            });
        }

        document.getElementById('go-to-menu').addEventListener('click', function (e) {
            e.preventDefault();

            const btn = this;
            const originalText = btn.textContent;

            btn.textContent = 'لطفا صبر کنید...';
            btn.disabled = true;
            btn.style.opacity = '0.9';
            btn.style.color = '#155236';
            btn.style.pointerEvents = 'none';

            loadMenu()
                .then(() => {
                    document.getElementById('landing-page').style.display = 'none';
                    document.getElementById('menu-page').style.display = 'block';
                })
                .catch(err => {
                    btn.textContent = originalText;
                    btn.disabled = false;
                    btn.style.opacity = '1';
                    btn.style.pointerEvents = 'auto';
                    alert('خطا در بارگذاری منو:\n' + (err.message || err));
                });
        });

        document.addEventListener('click', function (e) {
            const socialLink = e.target.closest('.social-link');
            const tooltip = e.target.closest('.social-tooltip');
            const allLinks = document.querySelectorAll('.social-link');

            if (tooltip) return;

            if (socialLink) {
                if (socialLink.getAttribute('href') === '#') {
                    e.preventDefault();
                }
                allLinks.forEach(link => link.classList.remove('active'));
                socialLink.classList.add('active');
            } else {
                allLinks.forEach(link => link.classList.remove('active'));
            }
        });
    