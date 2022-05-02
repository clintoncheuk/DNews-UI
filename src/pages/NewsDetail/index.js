import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import "./NewsDetail.scss";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import { GetNewsArticles } from "../../tools/DNews";

const NewsDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const [article, setArticle] = useState(null);
  const [carouselImages, setCarouselImages] = useState([]);

  useEffect(() => {
    if (article && article.cover_image) {
      setCarouselImages([article.cover_image, ...article.images]);
    } else if (article) {
      setCarouselImages(article.images);
    }
  }, [article]);

  useEffect(() => {
    if (location.state && location.state.article) {
      setArticle(location.state.article);
    } else {
      GetNewsArticles(id, id).then((articles) => {
        setArticle(articles[0]);
      });
    }
  }, [id, location]);

  return (
    article && (
      <div className="article">
        {carouselImages && carouselImages.length > 0 && (
          <Carousel
            className="carousel"
            showThumbs={false}
            showStatus={false}
            dynamicHeight={false}
            onClickItem={(index) => {
              window.open(carouselImages[index], "_blank");
            }}
          >
            {carouselImages.map((image, index) => (
              <div key={"image-" + index}>
                <img
                  alt=""
                  src={image}
                  style={{ maxHeight: "50vh", objectFit: "cover" }}
                />
              </div>
            ))}
          </Carousel>
        )}

        <h1>{article.title}</h1>

        <div className="videos-container">
          {article.videos.map((video, index) => (
            <div key={"video-" + index}>
              <video controls style={{ width: "100%" }}>
                <source src={video} />
                Your browser does not support the video tag.
              </video>
            </div>
          ))}
        </div>
        <div className="content">{article.content}</div>
      </div>
    )
  );
};

export default NewsDetail;
