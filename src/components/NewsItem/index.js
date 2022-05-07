import "./NewsItem.scss";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const NewsItem = ({ article }) => {
  const [loadingImage, setLoadingImage] = useState(true);
  const [coverImageStyle, setCoverImageStyle] = useState({});

  useEffect(() => {
    if (article && article.cover_image) {
      const image = new Image();
      image.addEventListener("load", () => {
        setCoverImageStyle({
          backgroundImage: "url(" + article.cover_image + ")",
        });
        setLoadingImage(false);
      });
      image.addEventListener("error", () => {
        setCoverImageStyle({ height: 0 });
        setLoadingImage(false);
      });
      image.src = article.cover_image;
    }
  }, [article]);
  return (
    <>
      {article && (
        <div className="news-item">
          {article.cover_image && (
            <div className="cover-image-container" style={coverImageStyle}>
              {loadingImage && (
                <div class="loading-cover-image">
                  <Skeleton height={300} borderRadius={25} />
                </div>
              )}
              {!loadingImage && (
                <img
                  alt="cover"
                  className="cover-image-invisible"
                  src={article.cover_image}
                />
              )}
            </div>
          )}
          <div className="text-container">
            <div className="title">{article.title}</div>
            <div className="content">{article.content}</div>

            <Link to={"/news/" + article.id} state={{ article: article }}>
              <div className="read-more-btn">Read More</div>
            </Link>
          </div>
        </div>
      )}

      {!article && (
        <div className="news-item">
          <div className="cover-image-container">
            <div class="loading-cover-image">
              <Skeleton height={300} borderRadius={25} />
            </div>
          </div>
          <div className="text-container">
            <div className="title">
              <Skeleton />
            </div>
            <div className="content">
              <Skeleton count={4} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NewsItem;
