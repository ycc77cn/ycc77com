// Reading progress indicator
document.addEventListener('DOMContentLoaded', function() {
  const progressBar = document.querySelector('.reading-progress-bar');
  const contentWrapper = document.querySelector('.content-wrapper');
  
  if (!progressBar || !contentWrapper) return;
  
  function updateProgress() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Calculate progress based on content area
    const contentTop = contentWrapper.offsetTop;
    const contentHeight = contentWrapper.offsetHeight;
    const contentBottom = contentTop + contentHeight;
    
    let progress = 0;
    
    if (scrollTop >= contentTop) {
      const scrolledInContent = Math.min(scrollTop - contentTop + windowHeight, contentHeight);
      progress = (scrolledInContent / contentHeight) * 100;
    }
    
    progress = Math.min(Math.max(progress, 0), 100);
    progressBar.style.width = progress + '%';
  }
  
  // Update progress on scroll
  window.addEventListener('scroll', updateProgress);
  window.addEventListener('resize', updateProgress);
  
  // Initial update
  updateProgress();
});