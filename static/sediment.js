(function() {
    var shots = [
        ["FE_Image1.jpeg", "Poolside"],
        ["FE_Image2.jpeg", "Stairwell"],
        ["FE_Image3.jpeg", "Stone Archway"],
        ["FE_Image4.jpeg", "Terracotta Wrap"],
        ["FE_Image5.jpeg", "Ruins in Rust"],
        ["FE_Image6.jpeg", "Cliffside Wind"],
        ["FE_Image7.jpeg", "Water's Edge"],
        ["FE_Image8.jpeg", "Golden Hour"],
        ["FE_Image9.jpeg", "Salt Terraces I"],
        ["FE_Image10.jpeg", "Salt Terraces II"]
    ];
    var grid = document.getElementById('fashionEditorialGrid');
    if (!grid) return;

    var basePath = grid.getAttribute('data-asset-base');
    var previewIndexes = [0, 3, 6, 9];
    var displayedShots = grid.getAttribute('data-preview') === 'true'
        ? previewIndexes.map(function(index) { return shots[index]; })
        : shots;
    var lightbox = document.getElementById('feLightbox');
    var lightboxOpen = false;
    var currentIndex = 0;

    displayedShots.forEach(function(shot, index) {
        var item = document.createElement('button');
        item.className = 'fashion-editorial-item';
        item.type = 'button';
        item.setAttribute('aria-label', 'View ' + shot[1]);

        var inner = document.createElement('span');
        inner.className = 'fe-item-inner';

        var img = document.createElement('img');
        img.src = basePath + encodeURIComponent(shot[0]);
        img.alt = shot[1];
        img.loading = index < 4 ? 'eager' : 'lazy';
        inner.appendChild(img);
        item.appendChild(inner);
        item.addEventListener('click', function() { window.openFeLightbox(index); });
        grid.appendChild(item);
    });

    window.openFeLightbox = function(index) {
        if (!lightbox) return;
        currentIndex = index;
        showLightboxItem(index);
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
        lightboxOpen = true;
    };

    function showLightboxItem(index) {
        var shot = displayedShots[index];
        document.getElementById('feLightboxImg').src = basePath + encodeURIComponent(shot[0]);
        document.getElementById('feLightboxImg').alt = shot[1];
        document.getElementById('feLightboxTitle').textContent = shot[1];
    }

    window.navigateFeLightbox = function(direction) {
        currentIndex = (currentIndex + direction + displayedShots.length) % displayedShots.length;
        showLightboxItem(currentIndex);
    };

    window.closeFeLightbox = function() {
        if (!lightbox) return;
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
        lightboxOpen = false;
    };

    window.closeFeLightboxOnBg = function(event) {
        if (lightbox && event.target === lightbox) window.closeFeLightbox();
    };

    document.addEventListener('keydown', function(event) {
        if (!lightboxOpen) return;
        if (event.key === 'Escape') window.closeFeLightbox();
        if (event.key === 'ArrowLeft') window.navigateFeLightbox(-1);
        if (event.key === 'ArrowRight') window.navigateFeLightbox(1);
    });

    var section = document.querySelector('.fashion-editorial-section[data-scatter]');
    if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var nextSectionTitle = document.querySelector('#campaign-brand-visuals .section-title');
    if (!nextSectionTitle) return;

    var items = [];
    var ready = false;
    var ticking = false;

    function update() {
        if (!ready) return;

        var nextTitleTop = nextSectionTitle.getBoundingClientRect().top;
        var viewportHeight = window.innerHeight;
        var scatterStart = viewportHeight * 0.75;
        var scatterDistance = viewportHeight * 0.7;
        var progress = Math.max(0, Math.min(1, (scatterStart - nextTitleTop) / scatterDistance));
        var eased = 1 - Math.pow(1 - progress, 2);

        items.forEach(function(item) {
            var spread = eased * 1.7;
            var translateX = item.px * spread;
            var translateY = item.py * spread;
            var scale = 1 - eased * 0.45;

            item.element.style.transform = 'translate(' + translateX.toFixed(1) + 'px, ' + translateY.toFixed(1) + 'px) scale(' + scale.toFixed(3) + ')';
            item.element.style.opacity = (1 - eased).toFixed(3);
            item.element.style.zIndex = eased > 0.02 ? String(Math.round(2 + eased * 20)) : '';
        });
    }

    function measure() {
        var gridRect = grid.getBoundingClientRect();
        var centerX = gridRect.width / 2;
        var centerY = gridRect.height / 2;

        items = Array.prototype.map.call(grid.querySelectorAll('.fe-item-inner'), function(element) {
            var rect = element.getBoundingClientRect();
            return {
                element: element,
                px: rect.left - gridRect.left + rect.width / 2 - centerX,
                py: rect.top - gridRect.top + rect.height / 2 - centerY
            };
        });

        ready = true;
        update();
    }

    function waitForImages() {
        var images = grid.querySelectorAll('img');
        var remaining = images.length;
        if (remaining === 0) {
            measure();
            return;
        }

        function imageReady() {
            remaining--;
            if (remaining === 0) measure();
        }

        images.forEach(function(image) {
            if (image.complete) {
                imageReady();
            } else {
                image.addEventListener('load', imageReady, { once: true });
                image.addEventListener('error', imageReady, { once: true });
            }
        });
    }

    function onScroll() {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(function() {
            update();
            ticking = false;
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure, { once: true });
    measure();
    window.setTimeout(waitForImages, 0);
})();
