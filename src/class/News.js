export default class News {
  version = 1;
  cover_image = "";
  images = [];
  videos = [];
  title = "";
  content = "";

  constructor(title, content) {
    this.title = title;
    this.content = content;
  }
}
