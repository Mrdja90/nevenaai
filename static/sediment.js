(function() {
    var sedimentVideos = Array.prototype.slice.call(document.querySelectorAll('.sediment-page video'));
    var imageButtons = Array.prototype.slice.call(document.querySelectorAll('.sediment-image-button'));
    var lightbox = document.getElementById('feLightbox');
    var lightboxOpen = false;
    var currentIndex = 0;
    var displayedShots = imageButtons.map(function(button) {
        var image = button.querySelector('img');
        return [image ? image.getAttribute('src') : '', image ? image.alt : 'Editorial image'];
    });

    if (lightbox && imageButtons.length) {
        imageButtons.forEach(function(button, index) {
            button.addEventListener('click', function() { window.openFeLightbox(index); });
        });

        window.openFeLightbox = function(index) {
            currentIndex = index;
            showLightboxItem(index);
            lightbox.classList.add('open');
            document.body.style.overflow = 'hidden';
            lightboxOpen = true;
        };

        function showLightboxItem(index) {
            var shot = displayedShots[index];
            document.getElementById('feLightboxImg').src = shot[0];
            document.getElementById('feLightboxImg').alt = shot[1];
            document.getElementById('feLightboxTitle').textContent = shot[1];
        }

        window.navigateFeLightbox = function(direction) {
            currentIndex = (currentIndex + direction + displayedShots.length) % displayedShots.length;
            showLightboxItem(currentIndex);
        };

        window.closeFeLightbox = function() {
            lightbox.classList.remove('open');
            document.body.style.overflow = '';
            lightboxOpen = false;
        };

        window.closeFeLightboxOnBg = function(event) {
            if (event.target === lightbox) window.closeFeLightbox();
        };

        document.addEventListener('keydown', function(event) {
            if (!lightboxOpen) return;
            if (event.key === 'Escape') window.closeFeLightbox();
            if (event.key === 'ArrowLeft') window.navigateFeLightbox(-1);
            if (event.key === 'ArrowRight') window.navigateFeLightbox(1);
        });
    }

    if (!sedimentVideos.length || !('IntersectionObserver' in window)) return;

    var videoObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            var video = entry.target;
            if (entry.isIntersecting) {
                video.muted = true;
                var playback = video.play();
                if (playback && typeof playback.catch === 'function') {
                    playback.catch(function(error) {
                        if (error.name !== 'AbortError') {
                            console.warn('Unable to autoplay a Sediment film.', error);
                        }
                    });
                }
            } else {
                video.pause();
            }
        });
    }, { threshold: 0.35 });

    sedimentVideos.forEach(function(video) {
        video.muted = true;
        videoObserver.observe(video);
    });
})();
