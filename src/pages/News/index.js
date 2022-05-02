import NewsItem from "../../components/NewsItem";
import { useCallback, useEffect, useState } from "react";
import "./News.scss";
import { GetNewsArticles, NewsArticlesCount } from "../../tools/DNews";

const News = () => {
  const [articlesCount, setArticlesCount] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const getLatestNews = useCallback(() => {
    // Get last 20 news
    if (articlesCount === 0) return;
    GetNewsArticles(Math.max(0, articlesCount - 20), articlesCount - 1).then(
      (articles) => {
        setLoading(false);
        setArticles(articles);
      }
    );
  }, [articlesCount]);

  useEffect(() => {
    if (articlesCount === null) {
      NewsArticlesCount().then((count) => {
        setArticlesCount(count);
      });
    } else {
      getLatestNews();
    }
  }, [articlesCount, getLatestNews]);

  return (
    <div className="news-container">
      {loading &&
        Array.from(Array(10).keys()).map((x) => (
          <NewsItem key={"skeleton-" + x} />
        ))}
      {articles.map((article) => {
        return <NewsItem key={"news-" + article.id} article={article} />;
      })}
    </div>
  );
};

export default News;
