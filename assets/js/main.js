/* =========================================================
   CORE MAIN INITIALIZER (DISPATCHER)
========================================================= */


/* =========================================================
   URL UNIFICATION & CANONICAL ROUTER
========================================================= */
(function unifyURL() {
  const path = window.location.pathname;
  const hash = window.location.hash;

  // Nếu người dùng đang mở Tournament.html -> Tự động chuyển về contest.html?type=tournament
  if (path.endsWith('Tournament.html')) {
    window.location.replace(`contest.html?type=tournament${hash}`);
    return;
  }

  // Nếu người dùng đang mở Marathon.html -> Tự động chuyển về contest.html?type=marathon
  if (path.endsWith('Marathon.html')) {
    window.location.replace(`contest.html?type=marathon${hash}`);
    return;
  }
})();

document.addEventListener('DOMContentLoaded', async () => {
  if (window.ProtectionModule) {
    window.ProtectionModule.init();
  }

  const urlParams = new URLSearchParams(window.location.search);
  let contestType = urlParams.get('type');
  const pathName = window.location.pathname.toLowerCase();

  if (!contestType) {
    if (pathName.includes('marathon')) contestType = 'marathon';
    else contestType = 'tournament';
  }

  // Nạp dữ liệu
  await new Promise((resolve) => {
    const isMarathon = contestType === 'marathon';
    const scriptId = 'data-contest-script';
    let dataScript = document.getElementById(scriptId);
    if (dataScript) dataScript.remove();

    dataScript = document.createElement('script');
    dataScript.id = scriptId;
    dataScript.src = isMarathon ? 'assets/js/data/data-marathon.js' : 'assets/js/data/data-tournament.js';
    dataScript.onload = () => resolve();
    document.head.appendChild(dataScript);
  });

  if (window.UIComponentsModule) {
    window.UIComponentsModule.init();
  }

  const data = window.CONTEST_DATA;
  if (!data) return;

  if (data.themeClass) {
    document.body.classList.add(data.themeClass);
  }

  const heroTitle = document.getElementById('hero-title');
  const heroSub = document.getElementById('hero-sub');
  if (heroTitle) heroTitle.textContent = data.title;
  if (heroSub) heroSub.textContent = data.subTitle;

  if (window.MenuTreeModule) {
    window.MenuTreeModule.render('tree-menu', data);
  }

  if (window.ShareActionsModule) {
    window.ShareActionsModule.init();
  }

  const examItems = document.querySelectorAll('.exam-item');

  function activateExam(item) {
    if (!item) return;

    examItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');

    const examTitle = item.getAttribute('data-title');

    // Hiển thị PDF Drive
    if (window.PdfViewerModule) {
      window.PdfViewerModule.renderPreview(item);
    }

    if (window.MenuTreeModule) {
      window.MenuTreeModule.expandParentsOfItem(item);
    }

    // Nạp Đánh giá & Bình luận theo đúng examTitle
    if (window.RatingCommentModule && examTitle) {
      window.RatingCommentModule.init(examTitle);
    }
  }

  if (examItems.length > 0) {
    const urlHash = window.location.hash.replace('#', '').trim();
    let targetExam = null;

    if (urlHash) {
      examItems.forEach(item => {
        const title = item.getAttribute('data-title') || '';
        const driveUrl = item.getAttribute('data-drive') || '';
        if (title.includes(urlHash) || driveUrl.includes(urlHash)) {
          targetExam = item;
        }
      });
    }

    if (!targetExam) {
      targetExam = examItems[0];
    }

    if (targetExam) {
      activateExam(targetExam);
    }

    examItems.forEach(item => {
      item.addEventListener('click', function() {
        activateExam(this);
      });
    });
  }
});
