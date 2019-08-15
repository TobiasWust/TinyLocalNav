const tln = {
  init() {
    document.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', e => {
        if (a.origin === location.origin) {
          e.preventDefault();
          this.getContent(a.href);
        }
      })
    )
  },
  getContent(url) {
    this.drawLoader();
    fetch(url).then(res => res.text()).then(html => {
      this.destroyLoader();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const body = doc.querySelector('body').innerHTML;
      const style = doc.querySelector('style') ? doc.querySelector('style').innerHTML : '';
      const title = doc.querySelector('title') ? doc.querySelector('title').innerHTML : '';
      this.drawPage({ body, style, title });
      window.history.pushState(null, null, url);
      this.init();
    })
    .catch(() => window.location = url)
  },
  drawLoader() {
    const loader = `
    <div class="loader">
    <style>
      .loader {
        display: inline-block;
        width: 64px;
        height: 64px;
        position: fixed;
        top: calc(50vh - 32px);
        left: calc(50vh - 32px);
      }
      .loader:after {
        content: " ";
        display: block;
        width: 46px;
        height: 46px;
        margin: 1px;
        border-radius: 50%;
        border: 5px solid #fff;
        border-color: #111 transparent #111 transparent;
        animation: loader 1.2s linear infinite;
      }
      @keyframes loader {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    </style>
    </div>
      `;
    document.querySelector('body').insertAdjacentHTML('beforeend', loader);
  },
  destroyLoader() {
    document.querySelector('.loader').remove();
  },
  drawPage({ body, style, title }) {
    document.querySelector('body').innerHTML = body;
    document.querySelector('style').innerHTML = style;
    document.querySelector('title').innerHTML = title;
  }
}

window.onpopstate = () => {
    tln.getContent(location.href)
};

tln.init();
