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
  async getContent(url) {
    this.drawLoader();
    this.drawpPrograssBar(0);
    let response = await fetch(url);
    const reader = response.body.getReader();
    const contentLength = +response.headers.get('Content-Length');
    let receivedLength = 0; // received that many bytes at the moment
    let chunks = []; // array of received binary chunks (comprises the body)
    while(true) {
      const {done, value} = await reader.read();
      if (done) {
        break;
      }
      chunks.push(value);
      receivedLength += value.length;
      const progress = (receivedLength/contentLength * 100).toFixed(0);
      this.drawpPrograssBar(progress);
      console.log(progress);
    }

    let chunksAll = new Uint8Array(receivedLength); // (4.1)
    let position = 0;
    for(let chunk of chunks) {
      chunksAll.set(chunk, position); // (4.2)
      position += chunk.length;
    }

    const html = new TextDecoder("utf-8").decode(chunksAll);
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const body = doc.querySelector('body').innerHTML;
    const style = doc.querySelector('style') ? doc.querySelector('style').innerHTML : '';
    const title = doc.querySelector('title') ? doc.querySelector('title').innerHTML : '';
    this.drawPage({ body, style, title });
    window.history.pushState(null, null, url);
    this.init();
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
        left: calc(50vw - 32px);
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
  drawpPrograssBar(progress) {
    const bar = `
    <div class="progressBar">
      <div class="progress"></div>
      <style>
      .progressBar {
        background-color: grey;
        height: 20px;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        z-index: 999;
      }
      .progress {
        background-color: teal;
        height: 100%;
        width: 0%;
      }
      </style>
    </div>
    `
    if (document.querySelector('.progressBar')) document.querySelector('.progress').style.width = `${progress}%`
    else document.querySelector('body').insertAdjacentHTML('afterbegin', bar);
  },
  destroyLoader() {
    document.querySelector('.loader').remove();
  },
  drawPage({ body, style, title }) {
    // const bodyNode = document.querySelector('body');
    // bodyNode.style.transition = '0.5s all ease';
    // bodyNode.style.transform = 'translate(-100vw)';

    // bodyNode.addEventListener("transitionend", () => {
    //   bodyNode.style.transform = 'translate(0)';
    //   document.querySelector('body').innerHTML = body;
    //   document.querySelector('style').innerHTML = style;
    //   document.querySelector('title').innerHTML = title;
    // });
      document.querySelector('body').innerHTML = body;
      document.querySelector('style').innerHTML = style;
      document.querySelector('title').innerHTML = title;
  }
}

window.onpopstate = () => {
    tln.getContent(location.href)
};

tln.init();
