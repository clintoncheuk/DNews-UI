import ABI from "../ABI.json";
import Web3 from "web3";

const DNews = (useGivenProvider = true) => {
  let web3;
  if (useGivenProvider) {
    web3 = new Web3(Web3.givenProvider);
  } else {
    web3 = new Web3(process.env.REACT_APP_WEB3_PROVIDER_URL);
  }
  return new web3.eth.Contract(
    ABI,
    process.env.REACT_APP_SMART_CONTRACT_ADDRESS
  );
};

const NewsArticlesCount = async () => {
  return DNews(false).methods.getNewsArticlesCount().call();
};

const GetNewsArticles = async (fromId, toId) => {
  return new Promise((resolve, reject) => {
    DNews(false)
      .methods.getNewsArticles(fromId, toId)
      .call()
      .then((articles) => {
        const fetchArticles = articles.map((article) =>
          fetch(article.url).then((response) => response.json())
        );
        Promise.all(fetchArticles).then((result) => {
          result.forEach((item, index) => {
            item.id = parseInt(articles[index][2]);
            item.author = articles[index].author;
            item.upvote = parseInt(articles[index].upvote);
            item.downvote = parseInt(articles[index].downvote);
          });
          result = result.sort((a, b) => b.id - a.id);
          resolve(result);
        });
      });
  });
};

const CreateNewsArticle = async (newsUrl, from) => {
  return new Promise((resolve, reject) => {
    DNews(true)
      .methods.createArticle(newsUrl)
      .send({ from })
      .on("receipt", (receipt) => {
        console.log(receipt);
        resolve(receipt);
      })
      .on("error", (error) => {
        reject(error);
        console.error(error);
      });
  });
};

export { NewsArticlesCount, GetNewsArticles, CreateNewsArticle };
