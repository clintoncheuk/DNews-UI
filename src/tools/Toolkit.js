const ReadFileToBuffer = (file) => {
  return new Promise((resolve, reject) => {
    var reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = function (error) {
      console.error(error);
      reject(error);
    };
    reader.readAsArrayBuffer(file);
  });
};

const BuildArweaveUrl = (id) => {
  return "https://arweave.net/" + id;
};

export { ReadFileToBuffer, BuildArweaveUrl };
